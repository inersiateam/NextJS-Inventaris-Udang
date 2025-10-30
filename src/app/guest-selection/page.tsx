"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function GuestSelectionPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = () => {
    if (inputValue === "2503" || inputValue === "0125") {
      router.push(`/guest-selection?code=${inputValue}`);
    } else {
      setDialogOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-6 sm:px-10">
      <div className="bg-white shadow-lg rounded-2xl p-8 sm:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md scale-95 transition-transform">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          Pilih Tipe Tamu
        </h2>

        <div className="space-y-4">
          <label className="block text-gray-700 text-sm font-medium">
            Masukkan Kode Tamu
          </label>
          <input
            type="password"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Masukkan kode akses"
            className="w-full py-3 px-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            autoComplete="off"
          />
        </div>

        <div className="mt-6">
          <button
            className="w-full py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!inputValue}
          >
            Lanjutkan
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Masukkan kode akses yang telah diberikan untuk melanjutkan
          </p>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogTitle>Kode Tidak Valid</DialogTitle>
          <DialogDescription>
            Kode yang Anda masukkan tidak valid. <br />
            Silakan hubungi administrator untuk mendapatkan kode akses yang
            benar.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
