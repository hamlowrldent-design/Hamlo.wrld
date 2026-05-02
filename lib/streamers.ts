export type Platform = "Twitch";

export type StreamMember = {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  channelUrl: string;
  channelName: string;
  live: boolean;
  title: string;
  color: string;
};

export const STREAM_MEMBERS: StreamMember[] = [
  {
    id: "hamlo",
    name: "Hamlo.wrld",
    handle: "@Hamlo_wrld",
    platform: "Twitch",
    channelUrl: "https://www.twitch.tv/hamlo_wrld",
    channelName: "hamlo_wrld",
    live: true,
    title: "Main Signal",
    color: "from-fuchsia-500/25 to-cyan-500/20",
  },
  {
    id: "g3m1n1",
    name: "G3M1N1Cl1PS",
    handle: "@G3M1N1",
    platform: "Twitch",
    channelUrl: "https://www.twitch.tv/g3m1n1cl1ps",
    channelName: "g3m1n1cl1ps",
    live: false,
    title: "Dormant",
    color: "from-emerald-500/20 to-white/5",
  },
{
  id: "thruthatlane",
  name: "Thru That Lane Entertainment",
  handle: "@thruthatlaneentertainment",
  platform: "Twitch",
  channelName: "thruthatlaneentertainment",
  channelUrl: "https://www.twitch.tv/thruthatlaneentertainment",
  live: false,
  title: "Signal Feed",
  color: "from-purple-500/20 to-white/5",
}
];
