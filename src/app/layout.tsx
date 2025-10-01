import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./provider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // pilih variasi sesuai kebutuhan
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Inventaris App",
  description: "Dashboard Inventaris CV. ABL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-poppins antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
