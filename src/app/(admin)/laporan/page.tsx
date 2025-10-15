"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyWallet, Sort } from "iconsax-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
        <div className="items-end justify-end">
          <Button>
            <Sort size={24} color="#fff" variant="Outline" />
            Filter
          </Button>
        </div>
      </div>
      {/* Bagian atas card*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card Total Omset */}
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Omset</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20% ▲</p>
            <p className="text-xl font-bold mt-1">Rp. 15.000.000</p>
            <p className="text-xs text-gray-500">Januari - Juli 2025</p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Laba Berjalan</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20% ▲</p>
            <p className="text-xl font-bold mt-1">Rp. 15.000.000</p>
            <p className="text-xs text-gray-500">Januari - Juli 2025</p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Pengeluaran</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20% ▲</p>
            <p className="text-xl font-bold mt-1">Rp. 15.000.000</p>
            <p className="text-xs text-gray-500">Januari - Juli 2025</p>
          </CardContent>
        </Card>
        <Card className="shadow-md rounded-xl h-[160px] hover:shadow-xl hover:-translate-y-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ease-out">
          <CardContent className="pt-0 pb-4 px-5">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-3 rounded-full">
                <EmptyWallet size={24} color="#fff" variant="Bold" />
              </div>
              <h2 className="text-lg font-bold">Laba Bersih</h2>
            </div>
            <p className="text-sm text-green-600 mt-3">+12.20% ▲</p>
            <p className="text-xl font-bold mt-1">Rp. 15.000.000</p>
            <p className="text-xs text-gray-500">Januari - Juli 2025</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Kolom 1: Statistik (2/3 layar) --- */}
        <Card className="shadow-sm w-full hover:shadow-xl lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Statistic</CardTitle>

            <Select defaultValue="6bulan" onValueChange={(v) => console.log(v)}>
              <SelectTrigger className="w-[120px] rounded-full border-gray-300 text-sm font-medium shadow-none focus:ring-1 focus:ring-gray-300">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1bulan">1 Bulan</SelectItem>
                <SelectItem value="3bulan">3 Bulan</SelectItem>
                <SelectItem value="6bulan">6 Bulan</SelectItem>
                <SelectItem value="12bulan">12 Bulan</SelectItem>
              </SelectContent>
            </Select>
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
              />
            </div>
          </CardContent>
        </Card>

        {/* --- Kolom 2: Donut Chart (1/3 layar) --- */}
        <Card className="shadow-sm w-full hover:shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-0 flex flex-row items-center justify-between mt-0 md:mt-4">
            <div>
              <CardTitle className="text-xl font-bold">
                Transaksi Barang {selected} (Periode)
              </CardTitle>
            </div>
            <button
              onClick={toggleProduct}
              className="p-1 rounded hover:bg-gray-100"
            >
              <ArrowSwapHorizontal size="24" color="black" />
            </button>
          </CardHeader>

          <CardContent className="flex flex-col items-center justify-center pt-0 pb-2 rounded-b-lg mt-4">
            {/* Donut */}
            <div className="w-40 h-40 md:w-52 md:h-52 -mt-2">
              <Doughnut
                data={chartData[selected]}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: false },
                  },
                  cutout: "70%",
                }}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-1 text-xs mt-10 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-sm bg-red-500"></span>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* --- Kolom 1:  (2/3 layar) --- */}

        <Card className="p-4 lg:col-span-2">
          <Table>
            <TableHeader>
              {/* Header besar yang di-merge */}
              <TableRow>
                <TableHead
                  colSpan={4}
                  className="bg-primary text-white text-center font-semibold text-lg"
                >
                  Sharing Provite
                </TableHead>
              </TableRow>

              {/* Header kolom biasa */}
              <TableRow className="bg-primary text-white">
                <TableHead className="text-white whitespace-nowrap px-4">
                  Owner 1
                </TableHead>
                <TableHead className="text-white whitespace-nowrap px-4">
                  Owner 2
                </TableHead>
                <TableHead className="text-white whitespace-nowrap px-4">
                  Owner 3
                </TableHead>
                <TableHead className="text-white whitespace-nowrap px-4">
                  Kas
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              <TableRow>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
                <TableCell className="whitespace-nowrap px-4">
                  Rp. 33.000.000
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>

        {/* --- Kolom 2: (1/3 layar) --- */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="text-lg font-semibold">Daftar Top Pelanggan</h3>
          <Tabs defaultValue="aqua-water">
            <TabsList className="flex gap-2 mb-4">
              <TabsTrigger
                value="aqua-water"
                className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Aqua Water
              </TabsTrigger>
              <TabsTrigger
                value="aqua-difire"
                className="px-4 py-2 rounded-md border border-gray-300 data-[state=active]:bg-primary data-[state=active]:text-white"
              >
                Aqua Difire
              </TabsTrigger>
            </TabsList>

            {/* --- Tab Aqua Water --- */}
            <TabsContent value="aqua-water" className="space-y-3">
              {[1, 2, 3, 4].map((_, i) => (
                <div
                  key={i}
                  className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold">CV. SUMA</h4>
                      <p className="text-sm text-gray-600">Probolinggo</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Transaksi :</p>
                      <p className="text-red-500 font-bold text-lg">1.000</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* --- Tab Aqua Difire --- */}
            <TabsContent value="aqua-difire" className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <div
                  key={i}
                  className="cursor-pointer bg-white rounded-lg p-3 border border-gray-200 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-bold">CV. DIFIRE</h4>
                      <p className="text-sm text-gray-600">Banyuwangi</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Total Transaksi :</p>
                      <p className="text-red-500 font-bold text-lg">2.500</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
