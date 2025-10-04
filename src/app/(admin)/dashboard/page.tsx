"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoxTick, BoxTime, Calendar, EmptyWallet } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Badge } from "@/components/ui/badge";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Aqua Water", "Aqua Difire"],
  datasets: [
    {
      label: "Total Barang Keluar",
      data: [30, 50],
      backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
      hoverOffset: 4,
    },
  ],
};

export default function Page() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Visualisasi data, manajemen informasi, dan insight!
        </p>
      </div>
      {/* Bagian atas: kartu ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card Total Omset */}
        <Card className="shadow-md rounded-xl h-[180px]">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Total Omset</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20% ▲</p>
            <p className="text-xl font-bold mt-1">Rp. 15.000.000</p>
            <p className="text-xs text-gray-500">per bulan ini</p>
          </CardContent>
        </Card>

        {/* Card Stok Minimum */}
        <Card className="shadow-md rounded-xl h-[180px]">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <BoxTick size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Stok Minimum Aqua Water</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Stok terisi
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">100</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card ke-3 */}
        <Card className="shadow-md rounded-xl h-[180px]">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <BoxTick size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Stok Minimum Aqua Water</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Stok terisi
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">100</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card ke-4 */}
        <Card className="shadow-md rounded-xl h-[180px]">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <BoxTick size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Stok Minimum Aqua Water</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                Stok terisi
              </Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">100</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bagian bawah: kiri (penjualan), kanan (donut + tagihan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Kiri: Data Penjualan */}
        <Card className="shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold">
              Penjualan per Bulan (Lunas)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-24 flex items-center justify-center text-gray-400">
            (Chart penjualan bulan belum tersedia)
          </CardContent>
        </Card>

        {/* Kanan: Donut + Tagihan */}
        <div className="space-y-3">
          {/* Donut Chart */}
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-semibold">
                Kuantitas Barang Keluar per Produk (Periode)
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-22">
              <div className="w-22 h-22">
                <Doughnut
                  data={data}
                  options={{
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: true,
                    responsive: true,
                  }}
                />
              </div>
            </CardContent>
          </Card>
          {/* Tagihan Jatuh Tempo */}
          <Card className="shadow-xl">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-semibold">
                Tagihan Jatuh Tempo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {/* Filter Buttons */}
              <div className="flex gap-2 mb-3">
                <Button size="sm" className="bg-primary text-white">
                  All
                </Button>
                <Button size="sm" variant="outline">
                  Barang Keluar
                </Button>
                <Button size="sm" variant="outline">
                  Barang Masuk
                </Button>
              </div>

              {/* Daftar Tagihan dengan scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {/* Tagihan 1 */}
                <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold">AQUA WATER</h4>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Biaya :</p>
                      <p className="text-primary font-bold text-gray-900">
                        Rp. 14.520.000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} color="#00B7FE" variant="Bold" />
                    <span>03-08-2026</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Status Barang : Masuk
                    </span>
                  </div>
                </div>
                <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold">AQUA WATER</h4>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Biaya :</p>
                      <p className="text-primary font-bold text-gray-900">
                        Rp. 14.520.000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} color="#00B7FE" variant="Bold" />
                    <span>03-08-2026</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Status Barang : Masuk
                    </span>
                  </div>
                </div>
                <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold">AQUA WATER</h4>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Biaya :</p>
                      <p className="text-primary font-bold text-gray-900">
                        Rp. 14.520.000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} color="#00B7FE" variant="Bold" />
                    <span>03-08-2026</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Status Barang : Masuk
                    </span>
                  </div>
                </div>
                <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold">AQUA WATER</h4>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Biaya :</p>
                      <p className="text-primary font-bold text-gray-900">
                        Rp. 14.520.000
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Calendar size={14} color="#00B7FE" variant="Bold" />
                    <span>03-08-2026</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Status Barang : Masuk
                    </span>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
