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
import {
  ChartBarangItem,
  DashboardClientProps,
} from "@/types/interfaces/dashboard/IDashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

export default function DashboardClient({
  chartStatistik,
  chartBarang,
  tagihanJatuhTempo,
}: DashboardClientProps) {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [filterTagihan, setFilterTagihan] = useState<
    "All" | "Keluar" | "Masuk"
  >("All");

  const barData = {
    labels: chartStatistik.labels,
    datasets: [
      {
        label: "Pengeluaran",
        data: chartStatistik.pengeluaran,
        backgroundColor: "#ACDFFF",
        borderRadius: 8,
      },
      {
        label: "Pendapatan",
        data: chartStatistik.pendapatan,
        backgroundColor: "#00B8FB",
        borderRadius: 8,
      },
    ],
  };

  const getChartDataForProduct = (product: ChartBarangItem) => {
    const totalData = product.data.reduce((sum, val) => sum + val, 0);
    const isEmpty = totalData === 0;

    return {
      labels: product.labels,
      datasets: [
        {
          data: isEmpty ? [1, 1] : product.data,
          backgroundColor: isEmpty
            ? ["#d1d5db", "#d1d5db"]
            : ["#f43f5e", "#0ea5e9"],
          hoverOffset: isEmpty ? 0 : 4,
          borderWidth: 0,
        },
      ],
    };
  };

  const toggleProduct = () => {
    if (chartBarang.length === 0) return;
    setSelectedProductIndex((prev) =>
      prev >= chartBarang.length - 1 ? 0 : prev + 1
    );
  };

  const currentProduct = chartBarang[selectedProductIndex];
  const hasData = currentProduct
    ? currentProduct.data.reduce((sum, val) => sum + val, 0) > 0
    : false;

  const filteredTagihan = tagihanJatuhTempo.filter((tagihan) => {
    if (filterTagihan === "All") return true;
    return tagihan.status === filterTagihan;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="flex flex-col gap-3">
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

        <Card className="shadow-sm h-[250px] w-full hover:shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold line-clamp-1">
                {currentProduct ? currentProduct.nama : "Tidak ada data"}
              </CardTitle>
              {chartBarang.length > 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  {selectedProductIndex + 1} dari {chartBarang.length} produk
                </p>
              )}
            </div>
            {chartBarang.length > 1 && (
              <button
                onClick={toggleProduct}
                className="p-1 rounded hover:bg-gray-100 transition-colors"
                aria-label="Toggle product"
              >
                <ArrowSwapHorizontal size="24" color="black" />
              </button>
            )}
          </CardHeader>

          <CardContent className="relative flex flex-col items-center justify-center bottom-6">
            {currentProduct ? (
              <>
                <div className="w-32 h-32">
                  <Doughnut
                    data={getChartDataForProduct(currentProduct)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: hasData,
                        },
                      },
                      cutout: "70%",
                      events: hasData
                        ? [
                            "mousemove",
                            "mouseout",
                            "click",
                            "touchstart",
                            "touchmove",
                          ]
                        : [],
                    }}
                  />
                </div>

                <div className="absolute top-32 left-3 flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-sm ${
                        hasData ? "bg-pink-500" : "bg-gray-300"
                      }`}
                    ></span>
                    <span className={hasData ? "" : "text-gray-400"}>
                      Barang terjual
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-sm ${
                        hasData ? "bg-sky-400" : "bg-gray-300"
                      }`}
                    ></span>
                    <span className={hasData ? "" : "text-gray-400"}>
                      Barang masuk
                    </span>
                  </div>
                </div>

                {!hasData && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-gray-400 text-sm">Tidak ada data</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">Belum ada produk</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl pb-20 md:pb-0">
        <CardTitle className="text-xl px-4 pt-6 font-bold">
          Tagihan Jatuh Tempo
        </CardTitle>
        <CardContent className="px-4 pt-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button
              size="sm"
              className={filterTagihan === "All" ? "bg-primary text-white" : ""}
              variant={filterTagihan === "All" ? "default" : "outline"}
              onClick={() => setFilterTagihan("All")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterTagihan === "Keluar" ? "default" : "outline"}
              onClick={() => setFilterTagihan("Keluar")}
            >
              Barang Keluar
            </Button>
            <Button
              size="sm"
              variant={filterTagihan === "Masuk" ? "default" : "outline"}
              onClick={() => setFilterTagihan("Masuk")}
            >
              Barang Masuk
            </Button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {filteredTagihan.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada tagihan jatuh tempo</p>
              </div>
            ) : (
              filteredTagihan.map((tagihan) => (
                <div
                  key={`${tagihan.status}-${tagihan.id}`}
                  className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold line-clamp-2">
                      {tagihan.namaBarang}
                    </h4>
                    <div className="text-right ml-2">
                      <p className="text-xs text-gray-600">Total Biaya :</p>
                      <p className="text-primary font-bold text-gray-900">
                        {formatCurrency(tagihan.totalBiaya)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} color="#00B7FE" variant="Bold" />
                      <span>{formatDate(tagihan.jatuhTempo)}</span>
                    </div>
                    <span className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          tagihan.status === "Masuk"
                            ? "bg-blue-500"
                            : "bg-orange-500"
                        }`}
                      ></span>
                      Status Barang : {tagihan.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
