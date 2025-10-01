"use client";

import Link from "next/link";
import { MenuItem } from "@/lib/menu-config";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AppSidebarProps {
  menuItems: MenuItem[];
}

export default function AppSidebar({ menuItems }: AppSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "h-full w-56 border-r bg-white dark:bg-gray-900 transform transition-transform duration-300 md:translate-x-0 md:static md:flex-shrink-0",
          open
            ? "translate-x-0 fixed top-0 left-0 z-40"
            : "-translate-x-full fixed top-0 left-0 z-40"
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
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition",
                    active
                      ? "bg-primary text-white rounded-2xl"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>

                {/* Garis setelah Barang Keluar */}
                {isAfterBarangKeluar && <div className="border-b my-2" />}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
