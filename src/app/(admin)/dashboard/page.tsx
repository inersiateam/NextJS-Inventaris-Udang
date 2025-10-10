import { Card, CardContent } from "@/components/ui/card";
import { BoxTick, EmptyWallet, User } from "iconsax-react";
import { Badge } from "@/components/ui/badge";
import {
  getDashboardData,
  getPelangganAktif,
} from "@/lib/services/barangService";
import { getJabatan } from "@/lib/helpers/globalHelper";
import DashboardClient from "./dashboardClient";

export default async function Page() {
  const jabatan = await getJabatan();

  const [dashboardData, pelangganAktif] = await Promise.all([
    getDashboardData(jabatan),
    getPelangganAktif(jabatan),
  ]);

  const { stats, stokBarang } = dashboardData;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Visualisasi data, manajemen informasi, dan insight!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Total Omset</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20%</p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.totalOmset)}
            </p>
            <p className="text-xs text-gray-500">per bulan ini</p>
          </CardContent>
        </Card>

        {stokBarang.map((barang) => (
          <Card
            key={barang.id}
            className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out"
          >
            <CardContent className="flex flex-col justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-3 rounded-full">
                  <BoxTick size={24} color="white" variant="Bold" />
                </div>
                <h2 className="text-lg font-semibold">
                  Stok Minimum {barang.nama}
                </h2>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant={barang.stok >= 50 ? "default" : "secondary"}>
                  {barang.stok >= 50 ? "Stok Terisi" : "Stok Menipis"}
                </Badge>
                <div className="text-right">
                  <p className="text-2xl font-bold">{barang.stok}</p>
                  <p className="text-xs text-gray-500">stok persediaan</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="shadow-lg rounded-2xl h-[190px] hover:shadow-2xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="flex flex-col justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="bg-teal-300 p-3 rounded-full">
                <User size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Pelanggan Aktif</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div></div>
              <div className="text-right">
                <p className="text-2xl font-bold">{pelangganAktif}</p>
                <p className="text-xs text-gray-500">total pelanggan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardClient />
    </div>
  );
}
