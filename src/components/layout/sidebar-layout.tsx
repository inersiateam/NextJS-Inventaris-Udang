"use client";

import Link from "next/link";
import { MenuItem } from "@/lib/menu-config";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  menuItems: MenuItem[];
  open: boolean;
}

export default function AppSidebar({ menuItems, open }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "h-full border-r bg-white dark:bg-gray-900 transition-all duration-300 flex-shrink-0",
        open ? "w-56" : "w-0 border-r-0 overflow-hidden"
      )}
    >
      {/* Logo + Brand */}
      <div className="h-16 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold text-primary font-poppins">
            CV. ABL
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, idx) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const isAfterBarangKeluar = item.label === "Barang Keluar";

          return (
            <div key={idx}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition",
                  active
                    ? "bg-primary text-white rounded-2xl"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon
                  size={20}
                  color={active ? "#fff" : "#000"}
                  variant="Bold"
                />
                <span>{item.label}</span>
              </Link>

              {/* Garis setelah Barang Keluar */}
              {isAfterBarangKeluar && <div className="border-b my-2" />}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}