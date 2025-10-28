"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter,  } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";

export default function GuestSelectionPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false); 
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toLowerCase());
  };

  const handleSubmit = () => {
    if (inputValue === "2503") {
      router.push("/laporan-guest?type=abl");
    } else if (inputValue === "0125") {
      router.push("/laporan-guest?type=atm");
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
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full py-3 px-4 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
        </DialogTrigger>
        <DialogContent className="">
          <DialogTitle>Invalid Code</DialogTitle>
          <DialogDescription>
            Kode tidak valid! <br />Masukkan kode tamu yang valid untuk melanjutkan.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
