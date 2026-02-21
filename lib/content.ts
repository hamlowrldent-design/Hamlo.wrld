export type Platform = "YouTube" | "Apple Music" | "BandLab";

export type Link = {
  platform: Platform;
  url: string;
};

export type Track = {
  title: string;
  links: Link[];
};

export const LISTEN_TRACKS: Track[] = [
  {
    title: "Midas",
    links: [{ platform: "YouTube", url: "https://youtu.be/tv4jSVWNtNQ?si=DIlElJHYL5lN5wOh" }],
  },
  {
    title: "Smoke Thru Tha",
    links: [
      { platform: "Apple Music", url: "https://music.apple.com/us/song/smoke-thru-tha/1768314385" },
      { platform: "YouTube", url: "https://youtu.be/95P0ZhARJOo?si=LkSW7MNhphCLH8WU" },
    ],
  },
  {
    title: "Look Boo",
    links: [{ platform: "YouTube", url: "https://youtu.be/0i_e94q3C8I?si=-bKWnitfS3dUzs0L" }],
  },
  {
    title: "Wait",
    links: [{ platform: "YouTube", url: "https://youtu.be/3nCHdxnAtu4?si=tsfJn132cCIq057O" }],
  },
  {
    title: "Want me for?",
    links: [
      { platform: "Apple Music", url: "https://music.apple.com/us/song/want-me-for/1768314388" },
      { platform: "YouTube", url: "https://youtu.be/awc4bXB5doc?si=bYq-0LQDdNg8zm6v" },
    ],
  },
  {
    title: "Commentate",
    links: [
      { platform: "Apple Music", url: "https://music.apple.com/us/song/commentate/1797340527" },
      { platform: "YouTube", url: "https://youtu.be/kAf_cMGAja8?si=AJXv_uGLGCd7OX9x" },
    ],
  },
  {
    title: "80’s Pop",
    links: [{ platform: "YouTube", url: "https://youtu.be/DDCe4wmvrYw?si=h2wSZLJsbzdUw46X" }],
  },
  {
    title: "What She Take",
    links: [{ platform: "YouTube", url: "https://youtu.be/ay6pAGknRvM?si=r3M4tvuIFohH80ms" }],
  },
  {
    title: "Melatonic Music",
    links: [{ platform: "Apple Music", url: "https://music.apple.com/us/song/melatonic-music/1792128533" }],
  },
  {
    title: "Stero",
    links: [{ platform: "Apple Music", url: "https://music.apple.com/us/song/stero/1797444229" }],
  },
  {
    title: "Cant B Scared",
    links: [{ platform: "Apple Music", url: "https://music.apple.com/us/song/cant-b-scared/1797371665" }],
  },
  {
    title: "Crime",
    links: [{ platform: "Apple Music", url: "https://music.apple.com/us/song/crime/1797444231" }],
  },
  {
    title: "Stay Right Here",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/track/074a45fe-0655-4822-88d1-3f93838618cd?revId=37555ef9-1e3e-4be4-8a1f-36bf334f74b3" }],
  },
  {
    title: "F*ck This Up",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/track/f45f9661-75f9-f011-832e-6045bd324b5d?revId=f35f9661-75f9-f011-832e-6045bd324b5d" }],
  },
  {
    title: "Buduhbumpumbum",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/track/651e30e5-3342-40e8-9ea4-26465d110ae2?revId=29f38222-edc1-425f-8afc-bbdf9555e351" }],
  },
  {
    title: "Omg Man",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/revisions/f4686d4f-12cd-f011-8196-000d3a96100f?sharedKey=cHhio_hKrE6ZEVdgPWK1Sw" }],
  },
  {
    title: "Just Chase That",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/track/3c100d20-e3cc-f011-8196-000d3a96100f?revId=3a100d20-e3cc-f011-8196-000d3a96100f" }],
  },
  {
    title: "Want to",
    links: [{ platform: "BandLab", url: "https://www.bandlab.com/revisions/1926d74a-d3b7-f011-8196-0022484a3197?sharedKey=q5pxPUIOMkOEn90ynkMW-g" }],
  },
];
