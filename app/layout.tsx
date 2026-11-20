import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const description =
  "A personal health platform concept by David Pukha, designed after Helios's product designer exercise. Not affiliated with or endorsed by Helios.";

export const metadata: Metadata = {
  title: "Home · Helios",
  description,
  authors: [{ name: "David Pukha" }],
  robots: { index: false, follow: false },
  openGraph: {
    title: "Helios, a health platform concept",
    description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Helios, a health platform concept",
    description,
  },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  );
}
