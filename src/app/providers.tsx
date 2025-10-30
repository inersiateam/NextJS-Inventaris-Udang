"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "bg-white text-gray-900 border border-gray-200 shadow-md",
        }}
      />
    </SessionProvider>
  );
}
