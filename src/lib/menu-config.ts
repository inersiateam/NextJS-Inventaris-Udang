import {
  LayoutDashboard,
  PackagePlus,
  PackageMinus,
  Wallet,
  Users,
  FileText,
  CreditCard,
} from "lucide-react";

export type Role = "abl" | "atm";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function getMenuItemsByRole(role: Role): MenuItem[] {
  if (role === "abl") {
    return [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Barang Masuk", href: "/barang-masuk", icon: PackagePlus },
      { label: "Barang Keluar", href: "/barang-keluar", icon: PackageMinus },
      { label: "Pengeluaran", href: "/pengeluaran", icon: Wallet },
      { label: "Pelanggan", href: "/pelanggan", icon: Users },
      { label: "Laporan", href: "/laporan", icon: FileText },
    ];
  }

  if (role === "atm") {
    return [
      { label: "Dashboard", href: "/atm/dashboard", icon: LayoutDashboard },
      { label: "Transaksi", href: "/atm/transaksi", icon: CreditCard },
      { label: "Tagihan", href: "/atm/tagihan", icon: Wallet },
      { label: "Laporan", href: "/atm/laporan", icon: FileText },
    ];
  }

  return [];
}
