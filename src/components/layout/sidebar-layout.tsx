"use client";

import Link from "next/link";
import { MenuItem } from "@/lib/menu-config";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  menuItems: MenuItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AppSidebar({ menuItems, open, setOpen }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen bg-white dark:bg-gray-900 transition-all duration-300 z-40",
          // Desktop: inline sidebar dengan width toggle
          "hidden md:block md:border-r",
          open ? "md:w-56" : "md:w-0 md:border-r-0 md:overflow-hidden",
          // Mobile: fixed overlay sidebar
          "md:relative fixed top-0 left-0",
          open ? "block w-56" : "hidden"
        )}
      >
        {/* Logo + Brand */}
        <div className="h-16 flex items-center justify-center border-b">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-primary font-poppins">
              CV. ABL
            </span>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item, idx) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const isAfterBarangKeluar = item.label === "Barang Keluar";

            return (
              <div key={idx}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Auto close di mobile setelah klik menu
                    if (window.innerWidth < 768) {
                      setOpen(false);
                    }
                  }}
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

      {/* Overlay untuk mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}