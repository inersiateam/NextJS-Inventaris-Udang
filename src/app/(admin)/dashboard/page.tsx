"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BoxTick, Calendar, EmptyWallet, User } from "iconsax-react";
import { ArrowSwapHorizontal } from "iconsax-react";
import { Button } from "@/components/ui/button";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Badge } from "@/components/ui/badge";

// PENTING: Registrasi semua elemen yang dibutuhkan
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const barData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Pengeluaran",
      data: [40, 20, 15, 70, 60, 15],
      backgroundColor: "#ACDFFF",
      borderRadius: 8,
    },
    {
      label: "Pendapatan",
      data: [120, 65, 85, 100, 80, 100],
      backgroundColor: "#00B8FB",
      borderRadius: 8,
    },
  ],
};

export default function Page() {
  const [selected, setSelected] = useState<"Aqua Water" | "Aqua Difire">(
    "Aqua Water"
  );
  const chartData = {
    "Aqua Water": {
      labels: ["Barang terjual", "Barang masuk"],
      datasets: [
        {
          data: [70, 30],
          backgroundColor: ["#f43f5e", "#0ea5e9"],
          hoverOffset: 4,
        },
      ],
    },
    "Aqua Difire": {
      labels: ["Barang terjual", "Barang masuk"],
      datasets: [
        {
          data: [40, 60],
          backgroundColor: ["#f43f5e", "#0ea5e9"],
          hoverOffset: 4,
        },
      ],
    },
  };
  const toggleProduct = () => {
    setSelected((prev) =>
      prev === "Aqua Water" ? "Aqua Difire" : "Aqua Water"
    );
  };

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
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-full animate-bounce">
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
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full animate-bounce">
                <BoxTick size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Stok Minimum Aqua Water</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge variant="default">Stok Terisi</Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">100</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card ke-3 */}
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full animate-bounce">
                <BoxTick size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">
                {" "}
                Stok Minimum Aqua Difire
              </h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <Badge variant="secondary">Stok Menipis</Badge>
              <div className="text-right">
                <p className="text-2xl font-bold">30</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card ke-4 */}
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-teal-300 p-3 rounded-full animate-bounce">
                <User size={24} color="white" variant="Bold" />
              </div>
              <h2 className="text-lg font-semibold">Pelanggan Aktif</h2>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div></div>
              <div className="text-right">
                <p className="text-2xl font-bold">100</p>
                <p className="text-xs text-gray-500">stok persediaan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bagian bawah: kiri (statistik + donut), kanan (tagihan) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Kolom kiri: Statistik dan Donut */}
        <div className="flex flex-col gap-3">
          {/* Statistik */}
          <Card className="shadow-sm h-[350px] sm:h-[400px] w-full hover:shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Statistic</CardTitle>
            </CardHeader>
            <CardContent className="!p-2 sm:!p-4">
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false, // penting supaya chart isi penuh tinggi card
                  plugins: {
                    legend: {
                      display: true,
                      position: "bottom",
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 120,
                      ticks: {
                        stepSize: 20,
                        callback: (value) => value + "jt",
                      },
                    },
                    x: {
                      grid: { display: false },
                    },
                  },
                }}
                height={250} // tambah tinggi chart biar penuh di mobile
              />
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card className="shadow-sm h-[238px] w-full hover:shadow-xl">
            <CardHeader className="pb-1 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{selected}</CardTitle>
              </div>
              <button
                onClick={toggleProduct}
                className="p-1 rounded hover:bg-gray-100"
              >
                <ArrowSwapHorizontal size="24" color="black" />
              </button>
            </CardHeader>

            <CardContent className="relative flex flex-col items-center justify-center p-2">
              {/* Donut */}
              <div className="w-32 h-32">
                <Doughnut
                  data={chartData[selected]}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    cutout: "70%",
                  }}
                />
              </div>

              {/* Custom Legend */}
              <div className="absolute bottom-2 left-3 flex flex-col gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-pink-500"></span>
                  <span>Barang terjual</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-sm bg-sky-400"></span>
                  <span>Barang masuk</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-xl pb-20 md:pb-0">
          <CardTitle className="text-xl px-4 font-bold">
            Tagihan Jatuh Tempo
          </CardTitle>
          <CardContent className="px-4 pt-0 ">
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
            <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
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
  );
}
