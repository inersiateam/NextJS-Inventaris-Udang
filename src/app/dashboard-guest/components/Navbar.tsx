"use client";

import { useRouter } from "next/navigation";
import { LogoutCurve, User } from "iconsax-react";

interface GuestNavbarProps {
  guestType: "abl" | "atm";
}

export default function GuestNavbar({ guestType }: GuestNavbarProps) {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/guest-selection");
  };
  const logoSrc = guestType === "atm" ? "/ATM.png" : "/ABL.png";
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg">
              <img
                src={logoSrc} 
                className="w-14 h-14 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Dashboard Tamu {guestType === "abl" ? "ABL" : "ATM"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* <div
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                guestType === "abl"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Tamu {guestType.toUpperCase()}
            </div> */}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Keluar"
            >
              <LogoutCurve size={24} variant="Bold" color="red" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
