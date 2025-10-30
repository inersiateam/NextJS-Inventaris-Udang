"use client";

import Link from "next/link";
import Image from "next/image";
import { MenuItem } from "@/lib/menu-config";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
  const [mounted, setMounted] = useState(false);

  const { data: session, status } = useSession();

  const jabatan = session?.user?.jabatan;
  const logoSrc = jabatan === "ATM" ? "/ATM.png" : "/ABL.png";
  const label = jabatan === "ATM" ? "CV. ATM" : "CV. ABL";

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!mounted || status === "loading") {
    return (
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white dark:bg-gray-900 shadow-lg border rounded-xl",
          "sticky top-0 h-screen transition-all duration-300",
          open ? "w-56" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-center">
          <div className="w-12 h-12 bg-gray-200 animate-pulse rounded" />
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex flex-col bg-white dark:bg-gray-900 shadow-lg border rounded-xl shadow-gray-100 transition-all duration-300",
          "sticky top-0 h-screen",
          open ? "w-56" : "w-20"
        )}
      >
        <div className="h-16 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Image src={logoSrc} alt="Logo" width={48} height={48} priority />
            {open && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold text-primary"
              >
                {label}
              </motion.span>
            )}
          </div>
        </div>

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
                      variant="Linear"
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

      {open && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

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
                    variant="Outline"
                  />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "text-[8px] font-medium",
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
