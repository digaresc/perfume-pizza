import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pizza-Perfume CRM",
  description: "The CRM for a store that sells pizzas, perfumes, and pizza-perfumes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
