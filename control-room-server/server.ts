import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer, WebSocket } from "ws";
import crypto from "node:crypto";

type StreamChatMessage = {
  id: string;
  streamerId: string;
  authorName: string;
  text: string;
  createdAtMs: number;
};

type ClientToServer =
  | {
      t: "stream.join";
      streamerId: string;
      displayName?: string;
    }
  | {
      t: "stream.chat.send";
      streamerId: string;
      text: string;
    };

type ServerToClient =
  | {
      t: "welcome";
      clientId: string;
      serverNowMs: number;
    }
  | {
      t: "stream.snapshot";
      streamerId: string;
      displayName?: string;
      chat: StreamChatMessage[];
      viewers: number;
    }
  | {
      t: "stream.chat";
      streamerId: string;
      chat: StreamChatMessage[];
    }
  | {
      t: "stream.viewers";
      streamerId: string;
      viewers: number;
    }
  | {
      t: "error";
      message: string;
    };

type StreamClient = {
  id: string;
  streamerId: string;
  displayName?: string;
};

type StreamRoom = {
  streamerId: string;
  chat: StreamChatMessage[];
  clients: Map<string, StreamClient>;
};

const sockets = new Map<string, WebSocket>();
const clientStream = new Map<string, string>();
const streamRooms = new Map<string, StreamRoom>();

function getOrCreateStreamRoom(streamerId: string): StreamRoom {
  const existing = streamRooms.get(streamerId);
  if (existing) return existing;

  const room: StreamRoom = {
    streamerId,
    chat: [],
    clients: new Map(),
  };

  streamRooms.set(streamerId, room);
  return room;
}

function send(ws: WebSocket, msg: ServerToClient) {
  ws.send(JSON.stringify(msg));
}

function broadcastStream(streamerId: string, msg: ServerToClient) {
  const room = streamRooms.get(streamerId);
  if (!room) return;

  for (const clientId of room.clients.keys()) {
    const ws = sockets.get(clientId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}

function broadcastViewerCount(streamerId: string) {
  const room = streamRooms.get(streamerId);
  if (!room) return;

  broadcastStream(streamerId, {
    t: "stream.viewers",
    streamerId,
    viewers: room.clients.size,
  });
}

function broadcastChat(streamerId: string) {
  const room = streamRooms.get(streamerId);
  if (!room) return;

  broadcastStream(streamerId, {
    t: "stream.chat",
    streamerId,
    chat: room.chat,
  });
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "control-room-server" });
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

    if (msg.t === "stream.join") {
      const streamerId = msg.streamerId.trim();
      if (!streamerId) {
        send(ws, { t: "error", message: "Missing streamerId" });
        return;
      }

      const room = getOrCreateStreamRoom(streamerId);
      const displayName = msg.displayName?.trim() || undefined;

      room.clients.set(clientId, {
        id: clientId,
        streamerId,
        displayName,
      });

      clientStream.set(clientId, streamerId);

      send(ws, {
        t: "stream.snapshot",
        streamerId,
        displayName,
        chat: room.chat,
        viewers: room.clients.size,
      });

      broadcastViewerCount(streamerId);
      broadcastChat(streamerId);
      return;
    }

    if (msg.t === "stream.chat.send") {
      const joinedStreamerId = clientStream.get(clientId);
      if (!joinedStreamerId) {
        send(ws, { t: "error", message: "Join a stream first" });
        return;
      }

      if (joinedStreamerId !== msg.streamerId) {
        send(ws, { t: "error", message: "Streamer mismatch" });
        return;
      }

      const room = streamRooms.get(joinedStreamerId);
      if (!room) {
        send(ws, { t: "error", message: "Stream room not found" });
        return;
      }

      const sender = room.clients.get(clientId);
      if (!sender) {
        send(ws, { t: "error", message: "Sender not found" });
        return;
      }

      const text = msg.text.trim();
      if (!text) {
        send(ws, { t: "error", message: "Cannot send empty message" });
        return;
      }

      const chatMessage: StreamChatMessage = {
        id: crypto.randomUUID(),
        streamerId: joinedStreamerId,
        authorName: sender.displayName || sender.id.slice(0, 8),
        text,
        createdAtMs: Date.now(),
      };

      room.chat = [...room.chat, chatMessage].slice(-200);
      broadcastChat(joinedStreamerId);
      return;
    }

    send(ws, { t: "error", message: "Unsupported message" });
  });

  ws.on("close", () => {
    const streamerId = clientStream.get(clientId);
    sockets.delete(clientId);
    clientStream.delete(clientId);

    if (!streamerId) return;

    const room = streamRooms.get(streamerId);
    if (!room) return;

    room.clients.delete(clientId);

    if (room.clients.size === 0) {
      streamRooms.delete(streamerId);
      return;
    }

    broadcastViewerCount(streamerId);
  });
});

const PORT = 4100;
server.listen(PORT, () => {
  console.log(`Control Room server listening on http://localhost:${PORT}`);
});
