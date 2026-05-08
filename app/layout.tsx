import type { Metadata } from "next";
import { Audiowide, Inter, VT323 } from "next/font/google";
import "./globals.css";
import { Nav } from "./components/Nav";

const audiowide = Audiowide({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NewsForge — AI news, forged for builders",
  description: "Browse the latest AI news from trusted sources. Build presentation briefs in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${audiowide.variable} ${inter.variable} ${vt323.variable}`}
    >
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}