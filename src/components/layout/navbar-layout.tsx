"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Bell, CircleUser, Menu, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppNavbarProps {
  
  onProfileClick?: () => void;
  onLogout?: () => void;
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function AppNavbar({
  onLogout,
  onMenuClick,
}: AppNavbarProps) {
  const { data: session } = useSession();
  const username = session?.user?.username;
  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-16 bg-white dark:bg-gray-900">
      {/* Kiri: tombol menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"       >
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Kanan */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search */}
        <form className="relative hidden md:block w-64 lg:w-80">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-300 bg-gray-50 focus:border-blue-500 focus:ring-blue-300 focus:outline-none"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </form>

        <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="hidden md:block h-6 border-l border-gray-300 dark:border-gray-600"></div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <CircleUser className="h-8 w-8 text-gray-700 dark:text-gray-300" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mt-2 w-40">
<DropdownMenuItem disabled>Hai, {username}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/profile`}>Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (onLogout) onLogout();
                signOut({ callbackUrl: "/login" }); // redirect setelah logout
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
