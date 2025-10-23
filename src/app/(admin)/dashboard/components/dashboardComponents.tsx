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
    <div className="shadow-md rounded-xl h-[170px] bg-white hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out p-4 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-green-600 p-3 rounded-full">
          <EmptyWallet size={24} color="#fff" variant="Bold" />
        </div>
        <h2 className="text-base font-bold">Omset</h2>
      </div>

      <div>
        <p
          className={`text-sm mt-2 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {percentageChange.toFixed(2)}%
        </p>
        <p className="text-xl font-bold mt-1">{formatCurrency(totalOmset)}</p>
        <p className="text-xs text-gray-500">Oktober 2025</p>
      </div>
    </div>
  );
}

export function ProductCard({ nama, stok }: ProductCardProps) {
  const isLowStock = stok < DASHBOARD.BATAS_MINIMUM_STOK;

  return (
    <div className="shadow-md rounded-xl h-[170px] bg-white hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-300 ease-out p-4 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-primary p-3 rounded-full">
          <BoxTick size={24} color="#fff" variant="Bold" />
        </div>
        <h2 className="text-base font-bold">{nama}</h2>
      </div>

      <div className="flex justify-between items-end">
        <Badge
          variant={isLowStock ? "secondary" : "default"}
          className="text-[10px] sm:text-xs px-2 py-1"
        >
          {isLowStock ? "Stok Menipis" : "Stok Terisi"}
        </Badge>
        <div className="text-right">
          <p className="text-xl font-bold">{stok}</p>
          <p className="text-xs text-gray-500">stok persediaan</p>
        </div>
      </div>
    </div>
  );
}

export function PelangganCard({ count }: PelangganCardProps) {
  return (
    <div className="shadow-md rounded-xl h-[170px] bg-white hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 ease-out p-4 flex flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-green-500 p-3 rounded-full">
          <User size={24} color="#fff" variant="Bold" />
        </div>
        <h2 className="text-base font-bold">Pelanggan Aktif</h2>
      </div>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-xl font-bold">{count}</p>
          <p className="text-xs text-gray-500">total pelanggan</p>
        </div>
      </div>
    </div>
  );
}


export function EmptyProductCard({ isEmpty =true}) {
  if (!isEmpty) return null; 

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
