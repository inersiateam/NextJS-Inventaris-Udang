import { Element4, BoxTick, BoxRemove, CardSend, Profile2User, ClipboardText, Category, Stickynote, Box, } from "iconsax-react";
import { IconProps } from "iconsax-react";

export type Role = "abl" | "atm";

export interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<IconProps>;
}

export function getMenuItemsByRole(role: Role): MenuItem[] {
  if (role === "abl") {
    return [
      { label: "Dashboard", href: "/dashboard", icon: Element4 },
      { label: "Barang", href: "/barang", icon: Box },
      { label: "Barang Masuk", href: "/barang-masuk", icon: BoxTick },
      { label: "Barang Keluar", href: "/barang-keluar", icon: BoxRemove },
      { label: "Pengeluaran", href: "/pengeluaran", icon: CardSend },
      { label: "Pelanggan", href: "/pelanggan", icon: Profile2User },
      { label: "Laporan", href: "/laporan", icon: Stickynote },
    ];
  }
  if (role === "atm") {
    return [
      { label: "Dashboard", href: "/dashboard", icon: Element4 },
      { label: "Barang", href: "/barang", icon: Box },
      { label: "Barang Masuk", href: "/barang-masuk", icon: BoxTick },
      { label: "Barang Keluar", href: "/barang-keluar", icon: BoxRemove },
      { label: "Pengeluaran", href: "/pengeluaran", icon: CardSend },
      { label: "Pelanggan", href: "/pelanggan", icon: Profile2User },
      { label: "Laporan", href: "/laporan", icon: Stickynote },
    ];
  }
  return [];
}