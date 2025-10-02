"use client";

import React, { useMemo, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar-layout";
import AppNavbar from "@/components/layout/navbar-layout";
import { getMenuItemsByRole } from "@/lib/menu-config";
import { useRouter } from "next/navigation";

interface User {
  name: string;
  role: "abl" | "atm";
}

interface InventarisDashboardProps {
  user: User;
  title?: string;
  children: React.ReactNode;
}

const InventarisDashboard: React.FC<InventarisDashboardProps> = ({
  user,
  title,
  children,
}) => {
  const router = useRouter();
  const menuItems = useMemo(() => getMenuItemsByRole(user.role), [user.role]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleProfileClick = () => {
    router.push(`/${user.role}/settings`);
  };

  const handleLogout = () => {
    router.push("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <AppSidebar 
          menuItems={menuItems} 
          open={sidebarOpen}
        />

        {/* Konten utama */}
        <SidebarInset className="flex flex-1 flex-col min-w-0">
          <AppNavbar
            title={title}
            user={user}
            onProfileClick={handleProfileClick}
            onLogout={handleLogout}
            onMenuClick={toggleSidebar}
            sidebarOpen={sidebarOpen}
          />
          <main className="flex-1 p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-950/50 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default InventarisDashboard;