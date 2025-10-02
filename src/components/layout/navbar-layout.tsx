"use client";

import { Bell, CircleUser, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppNavbarProps {
  title?: string; 
  user: {
    name: string;
    role: "abl" | "atm";
  };
  onProfileClick?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function AppNavbar({
  title = "Dashboard", 
  user,
  onProfileClick,
  onLogout,
  onMenuClick,
  sidebarOpen,
}: AppNavbarProps) {
  return (
    <header className="flex items-center justify-between px-6 h-16 border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Menu Button - selalu ditampilkan */}
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
        >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
        
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <button>
          <Bell className="h-6 w-6 text-primary dark:text-gray-300" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <CircleUser className="h-8 w-8" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-40">
            <DropdownMenuItem onClick={onProfileClick}>Profil</DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}