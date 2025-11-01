import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Inventaris App",
  description: "Dashboard Inventaris Udang",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2674a4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={quicksand.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2674a4" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-quicksand antialiased pb-20 md:pb-2">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
