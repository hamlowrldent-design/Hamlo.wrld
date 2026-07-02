import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SignalBackdrop from "@/components/SignalBackdrop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hamlo.wrld",
  description:
    "An immersive world. Music, artifacts, live streams, synchronized theater, and skill trials — all within the signal.",
  openGraph: {
    type: "website",
    url: "https://hamlowrld.com",
    title: "Hamlo.wrld",
    description:
      "An immersive world. Music, artifacts, live streams, synchronized theater, and skill trials — all within the signal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hamlo.wrld",
    description:
      "An immersive world. Music, artifacts, live streams, synchronized theater, and skill trials — all within the signal.",
    creator: "@Hamlo_wrld",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
	  <SignalBackdrop />
        {children}
      </body>
    </html>
  );
}
