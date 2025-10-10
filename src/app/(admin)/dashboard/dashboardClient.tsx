"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "iconsax-react";
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

export default function DashboardClient() {
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
                maintainAspectRatio: false,
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
              height={250}
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

      {/* Kolom kanan: Tagihan */}
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
  );
}
