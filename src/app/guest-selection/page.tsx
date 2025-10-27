"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuestSelectionPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value.toLowerCase());
  };

  const handleSubmit = () => {
    if (inputValue === "2503") {
      router.push("/dashboard-guest?type=abl");
    } else if (inputValue === "0125") {
      router.push("/dashboard-guest?type=atm");
    } else {
      alert("Kode tidak valid! Masukkan 'abl' atau 'atm'");
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
          <p className="text-xs text-gray-500 mt-2">
            Masukkan <span className="font-semibold">abl</span> atau{" "}
            <span className="font-semibold">atm</span>
          </p>
        </div>

        <div className="mt-6">
          <button
            className="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!inputValue}
          >
            Lanjutkan
          </button>
        </div>
      </div>
    </div>
  );
}