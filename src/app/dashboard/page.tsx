"use client";

import InventarisDashboard from "@/components/layout/inventaris-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoxTick, BoxTime, Calendar } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// register chart.js komponen yang dibutuhkan
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

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "left", // posisi legend di kiri chart
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 15,
      },
    },
  },
};

export default function AblDashboardPage() {
  const user = { name: "Admin ABL", role: "abl" as const };

  return (
    <InventarisDashboard user={user}>
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Card fleksibel */}
        <Card className="flex-1 min-w-[250px] shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <BoxTime size={28} color="#00B7FE" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Peringatan Stok Minimum
              </p>
              <p className="text-xl font-medium text-gray-900">300 Produk</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[250px] shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-indigo-50">
              <BoxTick size={28} color="#6366F1" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Peringatan Stok Minimum
              </p>
              <p className="text-xl font-medium text-gray-900">300 Produk</p>
            </div>
          </CardContent>
        </Card>

        {/* Card Total Penjualan (fixed width) */}
        <Card className="basis-[408px] min-w-[250px] shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-3 rounded-lg bg-yellow-50">
              <BoxTick size={28} color="#FF6A00" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Penjualan</p>
              <p className="text-xl font-medium text-gray-900">
                Rp. 523.000.000
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bagian Chart & Tagihan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Donut Chart */}
        <div className="lg:col-span-2 space-y-3">
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-semibold">
                Kuantitas Barang Keluar per Produk (Periode)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56 flex items-center justify-center p-4">
              <div className="flex items-center justify-between gap-4 md:gap-8 w-full items-center justify-center">
                {/* Legend di kiri */}
                <div className="flex flex-col gap-2 flex-shrink-0 pl-2 md:pl-8 lg:pl-16">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <div className="text-xs">
                      <div className="font-medium">Re-used APIs</div>
                      <div className="text-gray-500">36%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <div className="text-xs">
                      <div className="font-medium">Webhooks</div>
                      <div className="text-gray-500">38%</div>
                    </div>
                  </div>
                </div>

                {/* Donut Chart di kanan */}
                <div className="flex items-center justify-center flex-shrink-0 pr-2 md:pr-8 lg:pr-16">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                    <Doughnut
                      data={data}
                      options={{
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        maintainAspectRatio: true,
                        responsive: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Tambahan di bawah Chart */}
          <Card className="shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-semibold">
                Penjualan per Bulan (Lunas)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">{/* Chart penjualan */}</CardContent>
          </Card>
        </div>

        {/* Tagihan Jatuh Tempo */}
        <Card className="shadow-xl self-start">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold">
              Tagihan Jatuh Tempo
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-3">
              <Button className="px-4 py-1 bg-primary text-white rounded-lg text-xs font-medium">
                All
              </Button>
              <Button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">
                Barang Keluar
              </Button>
              <Button className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300">
                Barang Masuk
              </Button>
            </div>

            <div
              className="cursor-pointer bg-white rounded-lg p-3 mb-4 border-2 border-gray 
            shadow-[4px_4px_0px_#2674A4] 
        transition-all duration-200 
        hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none 
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
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
                  Status Barang : Keluar / Masuk
                </span>
              </div>
            </div>

            {/* Tambah Card item lain kalau perlu */}
            <div
              className="cursor-pointer bg-white rounded-lg p-3 mb-4 border-2 border-gray 
        shadow-[4px_4px_0px_#2674A4] 
        transition-all duration-200 
        hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none 
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            >
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
                  Status Barang : Keluar / Masuk
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InventarisDashboard>
  );
}
