import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import InventarisDashboard from "@/components/layout/inventaris-dashboard";

export const metadata: Metadata = {
  title: "Inventaris App",
  description: "Dashboard Inventaris",
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

  return <InventarisDashboard user={user}>{children}</InventarisDashboard>;
}
