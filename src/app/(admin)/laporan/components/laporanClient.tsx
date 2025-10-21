"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyWallet, Sort, ArrowSwapHorizontal } from "iconsax-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/utils";
import {
  LaporanStats,
  ChartLaporanData,
  PembagianProvit,
  TopPelanggan,
  ChartBarangItem,
} from "@/types/interfaces/ILaporan";
import {
  getLaporanStatsAction,
  getChartLaporanAction,
  getPembagianProvitAction,
  getTopPelangganAction,
  getChartBarangLaporanAction,
} from "../actions/laporanActions";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

interface LaporanClientProps {
  initialStats: LaporanStats;
  initialChartLaporan: ChartLaporanData;
  initialPembagianProvit: PembagianProvit[];
  initialTopPelangganWater: TopPelanggan[];
  initialTopPelangganDifire: TopPelanggan[];
  initialChartBarang: ChartBarangItem[];
  jabatan: string;
}

export default function LaporanClient({
  initialStats,
  initialChartLaporan,
  initialPembagianProvit,
  initialTopPelangganWater,
  initialTopPelangganDifire,
  initialChartBarang,
  jabatan,
}: LaporanClientProps) {
  const [selectedPeriode, setSelectedPeriode] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialStats);
  const [chartLaporan, setChartLaporan] = useState(initialChartLaporan);
  const [chartBarang, setChartBarang] = useState(initialChartBarang);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  const [pembagianProvit, setPembagianProvit] = useState(
    initialPembagianProvit
  );
  const [topPelangganWater, setTopPelangganWater] = useState(
    initialTopPelangganWater
  );
  const [topPelangganDifire, setTopPelangganDifire] = useState(
    initialTopPelangganDifire
  );

  const currentDate = new Date();
  const periode = `${currentDate.toLocaleDateString("id-ID", {
    month: "long",
  })} ${currentDate.getFullYear()}`;

  const handlePeriodeChange = useCallback(async (newPeriode: number) => {
    setIsLoading(true);
    setSelectedPeriode(newPeriode);

    try {
      const [
        statsResult,
        chartResult,
        pembagianResult,
        chartBarangResult,
        topWaterResult,
        topDifireResult,
      ] = await Promise.all([
        getLaporanStatsAction(newPeriode),
        getChartLaporanAction(newPeriode),
        getPembagianProvitAction(newPeriode),
        getChartBarangLaporanAction(newPeriode),
        getTopPelangganAction("water", newPeriode),
        getTopPelangganAction("difire", newPeriode),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (chartResult.success && chartResult.data) {
        setChartLaporan(chartResult.data);
      }

      if (pembagianResult.success && pembagianResult.data) {
        setPembagianProvit(pembagianResult.data);
      }

      if (chartBarangResult.success && chartBarangResult.data) {
        setChartBarang(chartBarangResult.data);
        setSelectedProductIndex(0);
      }

      if (topWaterResult.success && topWaterResult.data) {
        setTopPelangganWater(topWaterResult.data);
      }

      if (topDifireResult.success && topDifireResult.data) {
        setTopPelangganDifire(topDifireResult.data);
      }
    } catch (error) {
      console.error("Error updating data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPeriodeLabel = (periode: number) => {
    if (periode === 1) return "Bulan Ini";
    return `${periode} Bulan`;
  };

  const barData = useMemo(
    () => ({
      labels: chartLaporan.labels,
      datasets: [
        {
          label: "Pengeluaran",
          data: chartLaporan.pengeluaran,
          backgroundColor: "#ACDFFF",
          borderRadius: 8,
        },
        {
          label: "Pendapatan",
          data: chartLaporan.pendapatan,
          backgroundColor: "#00B8FB",
          borderRadius: 8,
        },
      ],
    }),
    [chartLaporan]
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
          hoverOffset: isEmpty ? 0 : 4,
          borderWidth: 0,
        },
      ],
    };
  }, [currentProduct]);

  const toggleProduct = useCallback(() => {
    if (chartBarang.length === 0) return;
    setSelectedProductIndex((prev) =>
      prev >= chartBarang.length - 1 ? 0 : prev + 1
    );
  }, [chartBarang.length]);

  return (
    <div className="space-y-6 p-2">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Laporan
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">
            Laporan keuangan dan analisis performa bisnis
          </p>
        </div>
        <div className="items-end justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isLoading}>
                <Sort size={24} color="#fff" variant="Outline" />
                Filter: {getPeriodeLabel(selectedPeriode)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePeriodeChange(1)}>
                Bulan Ini
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodeChange(3)}>
                3 Bulan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodeChange(6)}>
                6 Bulan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodeChange(12)}>
                12 Bulan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Card 1: Omset */}
        <Card className="shadow-md rounded-xl h-[170px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-base font-bold">Omset</h2>
            </div>
            <p
              className={`text-sm mt-3 ${
                stats.percentageChange.omset >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChange.omset >= 0 ? "+" : ""}
              {stats.percentageChange.omset.toFixed(2)}%
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.omset)}
            </p>
            <p className="text-xs text-gray-500">{stats.periodeLabel}</p>
          </CardContent>
        </Card>

        {/* Card 2: Modal */}
        <Card className="shadow-md rounded-xl h-[170px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-base font-bold">Modal</h2>
            </div>
            <p
              className={`text-sm mt-3 ${
                stats.percentageChange.modal >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChange.modal >= 0 ? "+" : ""}
              {stats.percentageChange.modal.toFixed(2)}%
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.modal)}
            </p>
            <p className="text-xs text-gray-500">{stats.periodeLabel}</p>
          </CardContent>
        </Card>

        {/* Card 3: Laba Berjalan */}
        <Card className="shadow-md rounded-xl h-[170px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-base font-bold">Laba Berjalan</h2>
            </div>
            <p
              className={`text-sm mt-3 ${
                stats.percentageChange.labaBerjalan >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChange.labaBerjalan >= 0 ? "+" : ""}
              {stats.percentageChange.labaBerjalan.toFixed(2)}%
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.labaBerjalan)}
            </p>
            <p className="text-xs text-gray-500">{stats.periodeLabel}</p>
          </CardContent>
        </Card>

        {/* Card 4: Pengeluaran */}
        <Card className="shadow-md rounded-xl h-[170px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-base font-bold">Pengeluaran</h2>
            </div>
            <p
              className={`text-sm mt-3 ${
                stats.percentageChange.pengeluaran >= 0
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {stats.percentageChange.pengeluaran >= 0 ? "+" : ""}
              {stats.percentageChange.pengeluaran.toFixed(2)}%
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.pengeluaran)}
            </p>
            <p className="text-xs text-gray-500">{stats.periodeLabel}</p>
          </CardContent>
        </Card>

        {/* Card 5: Laba Bersih */}
        <Card className="shadow-md rounded-xl h-[170px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500 p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-base font-bold">Laba Bersih</h2>
            </div>
            <p
              className={`text-sm mt-3 ${
                stats.percentageChange.labaBersih >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stats.percentageChange.labaBersih >= 0 ? "+" : ""}
              {stats.percentageChange.labaBersih.toFixed(2)}%
            </p>
            <p className="text-xl font-bold mt-1">
              {formatCurrency(stats.labaBersih)}
            </p>
            <p className="text-xs text-gray-500">{stats.periodeLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - 2/3 */}
        <Card className="shadow-sm w-full hover:shadow-xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold">Statistic</CardTitle>
          </CardHeader>
          <CardContent className="!p-2 sm:!p-4 h-full">
            <div className="h-[250px] lg:h-[300px]">
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
              />
            </div>
          </CardContent>
        </Card>

        {/* Doughnut Chart - 1/3 */}
        <Card className="shadow-sm w-full hover:shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-0 flex flex-row items-center justify-between mt-0 md:mt-4">
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
                className="p-1 rounded hover:bg-gray-100"
              >
                <ArrowSwapHorizontal size="24" color="black" />
              </button>
            )}
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center pt-0 pb-2 rounded-b-lg mt-4 relative">
            {currentProduct ? (
              <>
                <div className="w-40 h-40 md:w-52 md:h-52 -mt-2">
                  {getDoughnutData && (
                    <Doughnut
                      data={getDoughnutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: { enabled: hasData },
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
                          : ([] as any),
                      }}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1 text-xs mt-10 mb-2">
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

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sharing Provit - 2/3 */}
        <Card className="p-4 lg:col-span-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  colSpan={jabatan === "ATM" ? 4 : 5}
                  className="bg-primary text-white text-center font-semibold text-lg"
                >
                  Sharing Profit
                </TableHead>
              </TableRow>
              <TableRow className="bg-primary text-white">
                <TableHead className="text-white text-center whitespace-nowrap px-4">
                  Bulan
                </TableHead>
                <TableHead className="text-white whitespace-nowrap px-4">
                  Owner 1
                </TableHead>
                <TableHead className="text-white text-center whitespace-nowrap px-4">
                  Owner 2
                </TableHead>
                {jabatan === "ABL" && (
                  <TableHead className="text-white text-center whitespace-nowrap px-4">
                    Owner 3
                  </TableHead>
                )}
                <TableHead className="text-white text-center whitespace-nowrap px-4">
                  Kas
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pembagianProvit.length > 0 ? (
                pembagianProvit.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="whitespace-nowrap text-center px-4 font-medium">
                      {item.bulan}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center px-4">
                      {formatCurrency(item.owner1)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center px-4">
                      {formatCurrency(item.owner2)}
                    </TableCell>
                    {jabatan === "ABL" && (
                      <TableCell className="whitespace-nowrap text-center px-4">
                        {formatCurrency(item.owner3)}
                      </TableCell>
                    )}
                    <TableCell className="whitespace-nowrap text-center px-4">
                      {formatCurrency(item.kas)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={jabatan === "ATM" ? 4 : 5}
                    className="text-center py-8"
                  >
                    <p className="text-gray-500">Belum ada data pembagian</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Top Pelanggan - 1/3 */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="text-lg font-semibold">Daftar Top Pelanggan</h3>
          <Tabs defaultValue="aqua-water">
            <TabsList className="flex gap-2 mb-4">
              <TabsTrigger
                value="aqua-water"
                className="px-2 py-1 rounded-md border border-gray-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Aqua Water
              </TabsTrigger>
              <TabsTrigger
                value="aqua-difire"
                className="px-2 py-1 rounded-md border border-gray-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Aqua Difire
              </TabsTrigger>
            </TabsList>

            <TabsContent value="aqua-water" className="space-y-3">
              {topPelangganWater.length > 0 ? (
                topPelangganWater.map((pelanggan, i) => (
                  <div
                    key={i}
                    className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold">
                          {pelanggan.nama}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {pelanggan.alamat}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          Total Transaksi :
                        </p>
                        <p className="text-red-500 font-bold text-lg">
                          {pelanggan.totalTransaksi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada data pelanggan</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="aqua-difire" className="space-y-3">
              {topPelangganDifire.length > 0 ? (
                topPelangganDifire.map((pelanggan, i) => (
                  <div
                    key={i}
                    className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold">
                          {pelanggan.nama}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {pelanggan.alamat}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">
                          Total Transaksi :
                        </p>
                        <p className="text-red-500 font-bold text-lg">
                          {pelanggan.totalTransaksi}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Belum ada data pelanggan</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
