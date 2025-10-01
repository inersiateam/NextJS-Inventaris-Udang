"use client";
import InventarisDashboard from "@/components/layout/inventaris-dashboard";

export default function AblDashboardPage() {
  const user = { name: "Admin ABL", role: "abl" as const };

  return (
    <InventarisDashboard user={user}>
      <h2 className="text-xl font-semibold mb-4">Dashboard ABL</h2>
      <p>Ini konten dashboard ABL.</p>
    </InventarisDashboard>
  );
}
