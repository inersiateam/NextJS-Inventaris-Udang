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
    <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="bg-green-500 p-3 rounded-full shrink-0">
            <EmptyWallet size={24} color="#fff" variant="Bold" />
          </div>
          <h2 className="text-base md:text-lg font-bold">Total Omset</h2>
        </div>

        <div className="space-y-1">
          <p
            className={`text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {percentageChange}%
          </p>
          <p className="text-xl md:text-2xl font-bold">
            {formatCurrency(totalOmset)}
          </p>
          <p className="text-xs text-gray-500">per bulan ini</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductCard({ nama, stok }: ProductCardProps) {
  const isLowStock = stok < DASHBOARD.BATAS_MINIMUM_STOK;

  return (
    <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-full shrink-0">
            <BoxTick size={24} color="white" variant="Bold" />
          </div>
          <h2 className="text-base md:text-lg font-semibold line-clamp-2">
            {nama}
          </h2>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge
            variant={isLowStock ? "secondary" : "default"}
            className="whitespace-nowrap"
          >
            {isLowStock ? "Stok Menipis" : "Stok Terisi"}
          </Badge>
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold">{stok}</p>
            <p className="text-xs text-gray-500">stok tersedia</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyProductCard() {
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
    <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="bg-teal-300 p-3 rounded-full shrink-0">
            <User size={24} color="white" variant="Bold" />
          </div>
          <h2 className="text-base md:text-lg font-semibold">
            Pelanggan Aktif
          </h2>
        </div>

        <div className="flex items-end justify-end">
          <div className="text-right">
            <p className="text-2xl md:text-3xl font-bold">{count}</p>
            <p className="text-xs text-gray-500">total pelanggan</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
