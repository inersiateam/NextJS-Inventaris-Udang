"use client";

import { useMemo, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar-layout";
import AppNavbar from "@/components/layout/navbar-layout";
import { getMenuItemsByRole } from "@/lib/menu-config";

interface User {
  name: string;
  role: "abl" | "atm";
}

interface InventarisDashboardProps {
  user: User;
  children: React.ReactNode;
}

export default function InventarisDashboard({
  user,
  children,
}: InventarisDashboardProps) {
  const menuItems = useMemo(() => getMenuItemsByRole(user.role), [user.role]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
        <AppSidebar
          menuItems={menuItems}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
        />

        <SidebarInset className="flex flex-1 flex-col min-w-0 w-full">
          <AppNavbar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-950/50 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
