import type { Metadata } from "next";
import { JetBrains_Mono, Monoton, VT323 } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });
const marquee = Monoton({ variable: "--font-marquee", weight: "400", subsets: ["latin"] });
const pixel = VT323({ variable: "--font-pixel", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Perfume·Pizza Hippodrome",
  description: "Live coding party race: merge PRs, move your horse, survive the Monster Code Reviewer.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${mono.variable} ${marquee.variable} ${pixel.variable}`}>
      <body>{children}</body>
    </html>
  );
}
