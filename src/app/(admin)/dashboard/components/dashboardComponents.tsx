import { Card, CardContent } from "@/components/ui/card";
import { BoxTick, EmptyWallet, User } from "iconsax-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DASHBOARD } from "@/lib/constants";

interface OmsetCardProps {
  totalOmset: number;
  percentageChange: number;
}

interface ProductCardProps {
  nama: string;
  stok: number;
}

interface PelangganCardProps {
  count: number;
}

export function OmsetCard({ totalOmset, percentageChange }: OmsetCardProps) {
  const isPositive = percentageChange >= 0;

  return (
<Card className="shadow-lg rounded-2xl h-auto min-h-[150px] sm:h-[180px] md:h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
  <CardContent className="flex flex-col justify-between h-full p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="bg-green-500 p-2 sm:p-3 rounded-full shrink-0">
        <EmptyWallet size={20} color="#fff" variant="Bold" />
      </div>
      <h2 className="text-sm sm:text-base md:text-lg font-bold">
        Total Omset
      </h2>
    </div>

    <div className="space-y-1 mt-2 sm:mt-0">
      <p
        className={`text-xs sm:text-sm font-semibold ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? "+" : ""}
        {percentageChange}%
      </p>
      <p className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
        {formatCurrency(totalOmset)}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-500">per bulan ini</p>
    </div>
  </CardContent>
</Card>

  );
}

export function ProductCard({ nama, stok }: ProductCardProps) {
  const isLowStock = stok < DASHBOARD.BATAS_MINIMUM_STOK;

  return (
   <Card className="shadow-lg rounded-2xl h-auto min-h-[150px] sm:h-[180px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
  <CardContent className="flex flex-col justify-between h-full p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="bg-primary p-2 sm:p-3 rounded-full shrink-0">
        <BoxTick size={20} color="white" variant="Bold" />
      </div>
      <h2 className="text-sm sm:text-base md:text-lg font-semibold line-clamp-2">
        {nama}
      </h2>
    </div>

    <div className="grid grid-cols-2 items-center mt-2 sm:mt-0">
      <Badge
        variant={isLowStock ? "secondary" : "default"}
        className="whitespace-nowrap text-[10px] sm:text-xs px-2 py-1"
      >
        {isLowStock ? "Stok Menipis" : "Stok Terisi"}
      </Badge>
      <div className="text-right">
        <p className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight">
          {stok}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500">stok tersedia</p>
      </div>
    </div>
  </CardContent>
</Card>

  );
}

export function EmptyProductCard({ isEmpty }: { isEmpty: boolean }) {
  if (!isEmpty) return null; // tidak render apa-apa kalau tidak empty

  return (
    <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
      <CardContent className="flex flex-col justify-center items-center h-full">
        <BoxTick size={32} color="#d1d5db" variant="Bold" />
        <p className="text-gray-400 text-sm text-center mt-2">
          Belum ada barang terbaru
        </p>
      </CardContent>
    </Card>
  );
}


export function PelangganCard({ count }: PelangganCardProps) {
  return (
   <Card className="shadow-lg rounded-2xl h-auto min-h-[150px] sm:h-[180px] md:h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
  <CardContent className="flex flex-col justify-between h-full p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="bg-teal-400 p-2 sm:p-3 rounded-full shrink-0">
        <User size={20} color="white" variant="Bold" />
      </div>
      <h2 className="text-sm sm:text-base md:text-lg font-semibold">
        Pelanggan Aktif
      </h2>
    </div>

    <div className="flex items-end justify-end mt-2 sm:mt-0">
      <div className="text-right">
        <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
          {count}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500">total pelanggan</p>
      </div>
    </div>
  </CardContent>
</Card>

  );
}
