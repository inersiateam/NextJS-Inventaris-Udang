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
import { BoxTick, BoxTime } from "iconsax-react";

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-indigo-50">
              <BoxTime size={32} color="#00B7FE" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Peringatan Stok Minimum
              </p>
              <p className="text-2xl font-sm text-gray-900">300 Produk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-indigo-50">
              <BoxTick size={32} color="#6366F1" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Peringatan Stok Minimum
              </p>
              <p className="text-2xl font-sm text-gray-900">300 Produk</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="p-3 rounded-lg bg-yellow-50">
              <BoxTick size={32} color="#FF6A00" variant="Bold" />
            </div>
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Total Penjualan
              </p>
              <p className="text-2xl font-sm text-gray-900">Rp. 523.000.000</p>
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
        </Card>
      </div>
    </InventarisDashboard>
  );
}
