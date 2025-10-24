import type { Metadata } from "next";
import "../globals.css";
import Providers from "../provider";
import InventarisDashboard from "@/components/layout/inventaris-dashboard";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Inventaris App",
  description: "Dashboard Inventaris CV. ABL",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.username,
    role: session.user.jabatan.toLowerCase() as "abl" | "atm",
  };

  return (
    <Providers>
      <InventarisDashboard user={user}>{children}</InventarisDashboard>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "bg-white text-gray-900 border border-gray-200 shadow-md",
        }}
      />
    </Providers>
  );
}
