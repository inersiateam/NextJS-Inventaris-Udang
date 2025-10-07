import type { Metadata } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Providers from "../provider";
import InventarisDashboard from "@/components/layout/inventaris-dashboard";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Inventaris App",
  description: "Dashboard Inventaris CV. ABL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;

}) {
  // Dummy user untuk frontend saja
  const user = {
    name: "Admin ABL",
    role: "abl" as const,
  };

  return (
        <Providers>
          {/* Client component boleh dipanggil di sini */}
          <InventarisDashboard user={user}>{children}</InventarisDashboard>
        </Providers>
  );
}
