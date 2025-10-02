"use client";

import InventarisDashboard from "@/components/layout/inventaris-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Package, AlertTriangle, DollarSign } from "lucide-react";
import { BoxTick, BoxTime, Calendar } from "iconsax-react";
import { Button } from "@/components/ui/button";

const pieData = [
  { name: "Re-used APIs", value: 36, color: "#E11D48" },
  { name: "Webhooks", value: 38, color: "#3B82F6" },
  { name: "API Calls", value: 25, color: "#9CA3AF" },
];

const lineData = [
  { name: "10:00 AM", value: 3000 },
  { name: "11:30 AM", value: 5000 },
  { name: "12:30 AM", value: 4000 },
  { name: "01:30 PM", value: 7546 },
  { name: "02:30 PM", value: 6700 },
  { name: "03:30 PM", value: 7200 },
];

export default function AblDashboardPage() {
  const user = { name: "Admin ABL", role: "abl" as const };

  return (
    <InventarisDashboard user={user}>
   <div className="flex gap-3 mb-6">
  {/* Card Total Penjualan (fixed width) */}

  {/* Card lainnya fleksibel */}
  <Card className="flex-1 shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div className="p-3 rounded-lg bg-indigo-50">
        <BoxTime size={28} color="#00B7FE" variant="Bold" />
      </div>
      <div>
        <p className="text-gray-500 text-sm mb-1">Peringatan Stok Minimum</p>
        <p className="text-xl font-medium text-gray-900">300 Produk</p>
      </div>
    </CardContent>
  </Card>
  
  <Card className="flex-1 shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div className="p-3 rounded-lg bg-indigo-50">
        <BoxTick size={28} color="#6366F1" variant="Bold" />
      </div>
      <div>
        <p className="text-gray-500 text-sm mb-1">Peringatan Stok Minimum</p>
        <p className="text-xl font-medium text-gray-900">300 Produk</p>
      </div>
    </CardContent>
  </Card>


  <Card className="basis-[408px] shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div className="p-3 rounded-lg bg-yellow-50">
        <BoxTick size={28} color="#FF6A00" variant="Bold" />
      </div>
      <div>
        <p className="text-gray-500 text-sm mb-1">Total Penjualan</p>
        <p className="text-xl font-medium text-gray-900">Rp. 523.000.000</p>
      </div>
    </CardContent>
  </Card>
</div>


      {/* Bagian Chart & Tagihan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Donut Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="p-3 pb-0">
            <CardTitle className="text-sm font-semibold">
              Kuantitas Barang Keluar per Produk (Periode)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tagihan Jatuh Tempo */}
        <Card className="shadow-sm">
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

            {/* Card Item dengan Shadow Biru */}
            <div className="relative cursor-pointer group">
              {/* Shadow Layer */}
              <div className="absolute top-1.5 left-1.5 w-full h-full bg-primary rounded-lg transition-all duration-200 group-hover:top-2 group-hover:left-2 group-active:top-0.5 group-active:left-0.5"></div>
              {/* Main Card */}
              <div className="relative bg-white rounded-lg p-3 border-2 transition-all duration-200 group-hover:translate-y-0.5 group-hover:translate-x-0.5 group-active:translate-y-1 group-active:translate-x-1 hover:shadow-lg">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </InventarisDashboard>
  );
}
