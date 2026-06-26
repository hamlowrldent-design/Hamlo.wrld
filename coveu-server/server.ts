import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import crypto from "node:crypto";

type Role = "host" | "viewer";
type SourceMode = "url" | "local";
type MediaKind = "video" | "audio";

type SharedSource = {
  mode: SourceMode;
  kind: MediaKind;
  value: string;
  updatedBy: string;
  updatedAtMs: number;
};

type SharedPlayback = {
  isPlaying: boolean;
  positionSec: number;
  updatedAtMs: number;
  updatedBy: string;
};

type ChatMessage = {
  id: string;
  authorId: string;
  authorName?: string;
  authorRole: Role;
  text: string;
  createdAtMs: number;
};

type ClientToServer =
  | { t: "hello"; roomId: string; role: Role; name?: string }
  | { t: "ping"; clientNowMs: number }
  | {
      t: "source.set";
      roomId: string;
      source: {
        mode: SourceMode;
        kind: MediaKind;
        value: string;
      };
    }
  | {
      t: "playback.set";
      roomId: string;
      playback: {
        isPlaying: boolean;
        positionSec: number;
      };
    }
  | {
      t: "profile.set";
      roomId: string;
      name: string;
    }
  | {
      t: "chat.send";
      roomId: string;
      text: string;
    };

type PresenceEntry = {
  id: string;
  role: Role;
  name?: string;
  verified: boolean;
};

type RoomStats = {
  roomId: string;
  hostId: string | null;
  viewersTotal: number;
  viewersVerified: number;
};

type ServerToClient =
  | { t: "welcome"; clientId: string; serverNowMs: number }
  | {
      t: "room.snapshot";
      roomId: string;
      you: { role: Role; verified: boolean; name?: string };
      stats: RoomStats;
      source: SharedSource | null;
      playback: SharedPlayback | null;
      participants: PresenceEntry[];
      chat: ChatMessage[];
    }
  | { t: "room.stats"; stats: RoomStats }
  | { t: "room.source"; roomId: string; source: SharedSource | null }
  | { t: "room.playback"; roomId: string; playback: SharedPlayback | null }
  | { t: "room.presence"; roomId: string; participants: PresenceEntry[] }
  | { t: "room.chat"; roomId: string; chat: ChatMessage[] }
  | { t: "pong"; serverNowMs: number }
  | { t: "error"; message: string };

type ClientInfo = {
  id: string;
  role: Role;
  name?: string;
  verified: boolean;
};

type Room = {
  id: string;
  hostId: string | null;
  clients: Map<string, ClientInfo>;
  source: SharedSource | null;
  playback: SharedPlayback | null;
  chat: ChatMessage[];
};

const rooms = new Map<string, Room>();
const sockets = new Map<string, WebSocket>();
const clientRoom = new Map<string, string>();

function getOrCreateRoom(roomId: string): Room {
  const existing = rooms.get(roomId);
  if (existing) return existing;

  const room: Room = {
    id: roomId,
    hostId: null,
    clients: new Map(),
    source: null,
    playback: null,
    chat: [],
  };

  rooms.set(roomId, room);
  return room;
}

function computeStats(room: Room): RoomStats {
  let viewersTotal = 0;
  let viewersVerified = 0;

  for (const client of room.clients.values()) {
    if (client.role === "viewer") {
      viewersTotal += 1;
      if (client.verified) viewersVerified += 1;
    }
  }

  return {
    roomId: room.id,
    hostId: room.hostId,
    viewersTotal,
    viewersVerified,
  };
}

function computePresence(room: Room): PresenceEntry[] {
  return Array.from(room.clients.values()).map((client) => ({
    id: client.id,
    role: client.role,
    name: client.name,
    verified: client.verified,
  }));
}

function send(ws: WebSocket, msg: ServerToClient) {
  ws.send(JSON.stringify(msg));
}

function broadcastRoom(room: Room, msg: ServerToClient) {
  for (const clientId of room.clients.keys()) {
    const ws = sockets.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}

function broadcastPresence(room: Room) {
  broadcastRoom(room, {
    t: "room.presence",
    roomId: room.id,
    participants: computePresence(room),
  });
}

function broadcastChat(room: Room) {
  broadcastRoom(room, {
    t: "room.chat",
    roomId: room.id,
    chat: room.chat,
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "coveu-server" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  const clientId = crypto.randomUUID();
  sockets.set(clientId, ws);

  send(ws, {
    t: "welcome",
    clientId,
    serverNowMs: Date.now(),
  });

  ws.on("message", (raw) => {
    let msg: ClientToServer;

    try {
      msg = JSON.parse(raw.toString()) as ClientToServer;
    } catch {
      send(ws, { t: "error", message: "Invalid JSON" });
      return;
    }

    if (msg.t === "hello") {
      const room = getOrCreateRoom(msg.roomId);
      const cleanName = msg.name?.trim() || undefined;

      const info: ClientInfo = {
        id: clientId,
        role: msg.role,
        name: cleanName,
        verified: msg.role === "host",
      };

      room.clients.set(clientId, info);
      clientRoom.set(clientId, room.id);

      if (msg.role === "host") {
        room.hostId = clientId;
      }

      send(ws, {
        t: "room.snapshot",
        roomId: room.id,
        you: { role: info.role, verified: info.verified, name: info.name },
        stats: computeStats(room),
        source: room.source,
        playback: room.playback,
        participants: computePresence(room),
        chat: room.chat,
      });

      broadcastRoom(room, {
        t: "room.stats",
        stats: computeStats(room),
      });

      broadcastPresence(room);

      if (room.source) {
        broadcastRoom(room, {
          t: "room.source",
          roomId: room.id,
          source: room.source,
        });
      }

      if (room.playback) {
        broadcastRoom(room, {
          t: "room.playback",
          roomId: room.id,
          playback: room.playback,
        });
      }

      broadcastChat(room);
      return;
    }

    if (msg.t === "ping") {
      send(ws, {
        t: "pong",
        serverNowMs: Date.now(),
      });
      return;
    }

    if (msg.t === "profile.set") {
      const roomId = clientRoom.get(clientId);
      if (!roomId) {
        send(ws, { t: "error", message: "Client is not in a room" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { t: "error", message: "Room not found" });
        return;
      }

      const sender = room.clients.get(clientId);
      if (!sender) {
        send(ws, { t: "error", message: "Sender not found in room" });
        return;
      }

      sender.name = msg.name.trim() || undefined;
      room.clients.set(clientId, sender);
      broadcastPresence(room);
      return;
    }

    if (msg.t === "source.set") {
      const roomId = clientRoom.get(clientId);
      if (!roomId) {
        send(ws, { t: "error", message: "Client is not in a room" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { t: "error", message: "Room not found" });
        return;
      }

      const sender = room.clients.get(clientId);
      if (!sender) {
        send(ws, { t: "error", message: "Sender not found in room" });
        return;
      }

      if (sender.role !== "host") {
        send(ws, { t: "error", message: "Only the host can set the source" });
        return;
      }

      room.source = {
        mode: msg.source.mode,
        kind: msg.source.kind,
        value: msg.source.value,
        updatedBy: clientId,
        updatedAtMs: Date.now(),
      };

      broadcastRoom(room, {
        t: "room.source",
        roomId: room.id,
        source: room.source,
      });

      return;
    }

    if (msg.t === "playback.set") {
      const roomId = clientRoom.get(clientId);
      if (!roomId) {
        send(ws, { t: "error", message: "Client is not in a room" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { t: "error", message: "Room not found" });
        return;
      }

      const sender = room.clients.get(clientId);
      if (!sender) {
        send(ws, { t: "error", message: "Sender not found in room" });
        return;
      }

      if (sender.role !== "host") {
        send(ws, { t: "error", message: "Only the host can control playback" });
        return;
      }

      room.playback = {
        isPlaying: msg.playback.isPlaying,
        positionSec: msg.playback.positionSec,
        updatedAtMs: Date.now(),
        updatedBy: clientId,
      };

      broadcastRoom(room, {
        t: "room.playback",
        roomId: room.id,
        playback: room.playback,
      });

      return;
    }

    if (msg.t === "chat.send") {
      const roomId = clientRoom.get(clientId);
      if (!roomId) {
        send(ws, { t: "error", message: "Client is not in a room" });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        send(ws, { t: "error", message: "Room not found" });
        return;
      }

      const sender = room.clients.get(clientId);
      if (!sender) {
        send(ws, { t: "error", message: "Sender not found in room" });
        return;
      }

      const text = msg.text.trim();
      if (!text) {
        send(ws, { t: "error", message: "Cannot send an empty chat message" });
        return;
      }

      const chatMessage: ChatMessage = {
        id: crypto.randomUUID(),
        authorId: clientId,
        authorName: sender.name,
        authorRole: sender.role,
        text,
        createdAtMs: Date.now(),
      };

      room.chat = [...room.chat, chatMessage].slice(-100);
      broadcastChat(room);
      return;
    }

    send(ws, { t: "error", message: "Unsupported message" });
  });

  ws.on("close", () => {
    const roomId = clientRoom.get(clientId);
    sockets.delete(clientId);
    clientRoom.delete(clientId);

    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    room.clients.delete(clientId);

    if (room.hostId === clientId) {
      room.hostId = null;
      for (const candidate of room.clients.values()) {
        if (candidate.role === "host") {
          room.hostId = candidate.id;
          break;
        }
      }
    }

    if (room.clients.size === 0) {
      rooms.delete(room.id);
      return;
    }

    broadcastRoom(room, {
      t: "room.stats",
      stats: computeStats(room),
    });

    broadcastPresence(room);

    if (room.source) {
      broadcastRoom(room, {
        t: "room.source",
        roomId: room.id,
        source: room.source,
      });
    }

    if (room.playback) {
      broadcastRoom(room, {
        t: "room.playback",
        roomId: room.id,
        playback: room.playback,
      });
    }

    broadcastChat(room);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`CoVue server listening on http://localhost:${PORT}`);
});
