import { NextResponse } from "next/server";
import { STREAM_MEMBERS } from "@/lib/streamers";

type TwitchTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type TwitchGetStreamsResponse = {
  data: Array<{
    user_login: string;
    type: string;
    title: string;
  }>;
};

async function getAppAccessToken() {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Twitch environment variables");
  }

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get Twitch token: ${text}`);
  }

  return (await res.json()) as TwitchTokenResponse;
}

export async function GET() {
  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { ok: false, error: "Missing TWITCH_CLIENT_ID" },
        { status: 500 }
      );
    }

    const twitchMembers = STREAM_MEMBERS.filter(
      (m) => m.platform === "Twitch" && m.channelName
    );

    const token = await getAppAccessToken();

    const params = new URLSearchParams();
    for (const member of twitchMembers) {
      params.append("user_login", member.channelName);
    }

    const res = await fetch(
      `https://api.twitch.tv/helix/streams?${params.toString()}`,
      {
        headers: {
          "Client-Id": clientId,
          Authorization: `Bearer ${token.access_token}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch Twitch streams: ${text}`);
    }

    const json = (await res.json()) as TwitchGetStreamsResponse;

    const liveMap = Object.fromEntries(
      twitchMembers.map((m) => [m.channelName.toLowerCase(), false])
    );

    for (const stream of json.data) {
      liveMap[stream.user_login.toLowerCase()] = true;
    }

    return NextResponse.json({
      ok: true,
      live: twitchMembers.map((m) => ({
        id: m.id,
        name: m.name,
        channelName: m.channelName,
        live: !!liveMap[m.channelName.toLowerCase()],
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
