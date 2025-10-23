"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowSwapHorizontal } from "iconsax-react";
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
} from "@/types/interfaces/IDashboard";
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

const TagihanCard = memo(
  ({
    tagihan,
  }: {
    tagihan: {
      id: number;
      namaBarang: string;
      noInvoice: string;
      jatuhTempo: Date;
      totalBiaya: number;
      status: "Masuk" | "Keluar";
    };
  }) => (
    <div className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all">
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
              tagihan.status === "Masuk" ? "bg-blue-500" : "bg-orange-500"
            }`}
          ></span>
          Status Barang : {tagihan.status}
        </span>
      </div>
    </div>
  )
);

TagihanCard.displayName = "TagihanCard";

export default function DashboardClient({
  chartStatistik,
  chartBarang,
  tagihanJatuhTempo,
}: DashboardClientProps) {
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [filterTagihan, setFilterTagihan] = useState<
    "All" | "Keluar" | "Masuk"
  >("All");

  const barData = useMemo(
    () => ({
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
    }),
    [chartStatistik]
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "bottom" as const,
          labels: {
            usePointStyle: true,
            padding: 50,
          },
          title: {
            display: false,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 20,
            callback: (value: any) => value + "jt",
          },
        },
        x: {
          grid: { display: false },
        },
      },
    }),
    []
  );

  const currentProduct = useMemo(
    () => chartBarang[selectedProductIndex],
    [chartBarang, selectedProductIndex]
  );

  const hasData = useMemo(() => {
    if (!currentProduct) return false;
    return currentProduct.data.reduce((sum, val) => sum + val, 0) > 0;
  }, [currentProduct]);

  const getDoughnutData = useMemo(() => {
    if (!currentProduct) return null;

    const totalData = currentProduct.data.reduce((sum, val) => sum + val, 0);
    const isEmpty = totalData === 0;

    return {
      labels: currentProduct.labels,
      datasets: [
        {
          data: isEmpty ? [1, 1] : currentProduct.data,
          backgroundColor: isEmpty
            ? ["#d1d5db", "#d1d5db"]
            : ["#f43f5e", "#0ea5e9"],
          hoverOffset: isEmpty ? 0 : 6,
          borderWidth: 0,
        },
      ],
    };
  }, [currentProduct]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: false,
      maintainAspectRatio: false,
      cutout: "70%",
      layout: {
        padding: 8,
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: hasData,
          backgroundColor: "rgba(0,0,0,0.8)",
          bodyFont: { size: 12 },
          padding: 10,
        },
      },
      animation: {
        duration: 400,
      },
    }),
    [hasData]
  );

  const filteredTagihan = useMemo(() => {
    if (filterTagihan === "All") return tagihanJatuhTempo;
    return tagihanJatuhTempo.filter(
      (tagihan) => tagihan.status === filterTagihan
    );
  }, [tagihanJatuhTempo, filterTagihan]);

  const toggleProduct = useCallback(() => {
    if (chartBarang.length === 0) return;
    setSelectedProductIndex((prev) =>
      prev >= chartBarang.length - 1 ? 0 : prev + 1
    );
  }, [chartBarang.length]);

  const handleFilterTagihan = useCallback(
    (filter: "All" | "Keluar" | "Masuk") => {
      setFilterTagihan(filter);
    },
    []
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="flex flex-col gap-3">
        <Card className="shadow-sm h-[350px] sm:h-[400px] w-full hover:shadow-xl transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">Statistic</CardTitle>
          </CardHeader>
          <CardContent className="!p-2 sm:!p-4">
            <Bar data={barData} options={barOptions} height={250} />
          </CardContent>
        </Card>

        <Card className="shadow-sm h-[250px] w-full hover:shadow-xl transition-shadow overflow-visible">
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

          <CardContent className="relative flex flex-col items-center justify-center py-0 overflow-visible">
            {currentProduct ? (
              <>
                <div className="relative w-32 h-32 flex items-center justify-center overflow-visible">
                  {getDoughnutData && (
                    <Doughnut
                      data={getDoughnutData}
                      options={doughnutOptions}
                      width={128}
                      height={128}
                    />
                  )}
                </div>

                <div className="absolute top-20 left-4 px-2 flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-sm ${
                        hasData ? "bg-red-500" : "bg-gray-300"
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
        <CardTitle className="text-xl px-8 pt-0 font-bold">
          Tagihan Jatuh Tempo
        </CardTitle>
        <CardContent className="px-8 pt-4">
          <div className="flex gap-2 mb-3 flex-wrap">
            <Button
              size="sm"
              variant={filterTagihan === "All" ? "default" : "outline"}
              onClick={() => handleFilterTagihan("All")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterTagihan === "Keluar" ? "default" : "outline"}
              onClick={() => handleFilterTagihan("Keluar")}
            >
              Barang Keluar
            </Button>
            <Button
              size="sm"
              variant={filterTagihan === "Masuk" ? "default" : "outline"}
              onClick={() => handleFilterTagihan("Masuk")}
            >
              Barang Masuk
            </Button>
          </div>

          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {filteredTagihan.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <img
                  src="/9264885.jpg"
                  alt="Tidak ada tagihan"
                  className="w-60 h-60 object-contain mb-4 opacity-80"
                />
                <p className="text-sm text-gray-500">
                  Tidak ada tagihan jatuh tempo
                </p>
              </div>
            ) : (
              filteredTagihan.map((tagihan) => (
                <TagihanCard
                  key={`${tagihan.status}-${tagihan.id}`}
                  tagihan={tagihan}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
