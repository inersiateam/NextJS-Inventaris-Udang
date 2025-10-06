"use client";

import Link from "next/link";
import { MenuItem } from "@/lib/menu-config";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface AppSidebarProps {
  menuItems: MenuItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function AppSidebar({
  menuItems,
  open,
  setOpen,
}: AppSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Sidebar untuk Desktop */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 border-r z-40",
          open ? "w-56" : "w-20"
        )}
      >
        {/* Logo + Brand */}
        <div className="h-16 flex items-center justify-center border-b">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold text-primary"
              >
                CV. ABL
              </motion.span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          {menuItems.map((item, idx) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            const isAfterBarangKeluar = item.label === "Barang Keluar";

            return (
              <div key={idx}>
                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) setOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all",
                    active
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Icon
                      size={open ? 22 : 24}
                      color={active ? "#fff" : "#000"}
                      variant="Bold"
                    />
                  </motion.div>

                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>

                {isAfterBarangKeluar && <div className="border-b my-2" />}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Overlay saat sidebar terbuka di mobile */}
      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Navigation untuk Mobile */}
      {isMobile && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] border-t z-40 flex justify-around py-2"
        >
          {menuItems.map((item, idx) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center space-y-1"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "p-2 rounded-full transition-all",
                    active ? "bg-primary text-white" : "text-gray-600"
                  )}
                >
                  <Icon
                    size={28}
                    color={active ? "#fff" : "#000"}
                    variant="Bold"
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "text-[10px] font-medium",
                    active ? "text-primary" : "text-gray-500"
                  )}
                >
                  {item.label}
                </motion.span>
              </Link>
            );
          })}
        </motion.nav>
      )}
    </>
  );
}
