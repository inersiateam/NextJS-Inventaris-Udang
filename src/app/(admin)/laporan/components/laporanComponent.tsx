import { Card, CardContent } from "@/components/ui/card";
import { EmptyWallet } from "iconsax-react";
import { formatCurrency } from "@/lib/utils";

interface LaporanCardProps {
  title: string;
  amount: number;
  percentageChange: number;
  periode: string;
}

interface PembagianCardProps {
  owner1: number;
  owner2: number;
  owner3: number;
  kas: number;
}

interface TopPelangganItemProps {
  nama: string;
  alamat: string;
  totalTransaksi: number;
}

export function LaporanCard({
  title,
  amount,
  percentageChange,
  periode,
}: LaporanCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <Card className="shadow-lg rounded-2xl h-[180px] hover:shadow-2xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
      <CardContent className="flex flex-col justify-between h-full">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-full shrink-0">
            <EmptyWallet size={24} color="#fff" variant="Bold" />
          </div>
          <h2 className="text-base md:text-lg font-bold">{title}</h2>
        </div>

        <div className="space-y-1">
          <p
            className={`text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
          </p>
          <p className="text-xl md:text-2xl font-bold">
            {formatCurrency(amount)}
          </p>
          <p className="text-xs text-gray-500">{periode}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PembagianCard({
  owner1,
  owner2,
  owner3,
  kas,
}: PembagianCardProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
        <p className="text-sm font-semibold text-gray-600 mb-2">Owner 1</p>
        <p className="text-lg md:text-xl font-bold text-gray-900">
          {formatCurrency(owner1)}
        </p>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
        <p className="text-sm font-semibold text-gray-600 mb-2">Owner 2</p>
        <p className="text-lg md:text-xl font-bold text-gray-900">
          {formatCurrency(owner2)}
        </p>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
        <p className="text-sm font-semibold text-gray-600 mb-2">Owner 3</p>
        <p className="text-lg md:text-xl font-bold text-gray-900">
          {formatCurrency(owner3)}
        </p>
      </div>
      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
        <p className="text-sm font-semibold text-gray-600 mb-2">Kas</p>
        <p className="text-lg md:text-xl font-bold text-gray-900">
          {formatCurrency(kas)}
        </p>
      </div>
    </div>
  );
}

export function TopPelangganItem({
  nama,
  alamat,
  totalTransaksi,
}: TopPelangganItemProps) {
  return (
    <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-bold">{nama}</h4>
          <p className="text-sm text-gray-600">{alamat}</p>
        </div>
        <div className="text-right ml-2">
          <p className="text-xs text-gray-600">Total Transaksi :</p>
          <p className="text-primary font-bold text-lg">{totalTransaksi}</p>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <EmptyWallet
        size={48}
        color="#d1d5db"
        variant="Bold"
        className="mx-auto mb-3"
      />
      <p>{message}</p>
    </div>
  );
}
