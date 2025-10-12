import { Jabatan } from "@prisma/client";

export interface ChartBarangItem {
  id: number;
  nama: string;
  labels: string[];
  data: number[];
}

export interface ChartStatistikData {
  labels: string[];
  pendapatan: number[];
  pengeluaran: number[];
}

export interface TagihanJatuhTempo {
  id: number;
  namaBarang: string;
  noInvoice: string;
  jatuhTempo: Date;
  totalBiaya: number;
  status: "Masuk" | "Keluar";
}

export interface DashboardStats {
  total: number;
  stokRendah: number;
  totalNilai: number;
  totalOmset: number;
  percentageChange: number;
}

export interface BarangWithAdmin {
  id: number;
  nama: string;
  stok: number;
  harga: number;
  createdAt: Date;
  admin: {
    username: string;
    jabatan: Jabatan;
  };
}

export interface DashboardData {
  barangList: BarangWithAdmin[];
  stats: DashboardStats;
  stokBarang: BarangWithAdmin[];
}

export interface WeeklyData {
  pendapatan: number;
  pengeluaran: number;
}

export interface GetBarangParams {
  jabatan: Jabatan;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DashboardClientProps {
  chartStatistik: {
    labels: string[];
    pendapatan: number[];
    pengeluaran: number[];
  };
  chartBarang: ChartBarangItem[];
  tagihanJatuhTempo: Array<{
    id: number;
    namaBarang: string;
    noInvoice: string;
    jatuhTempo: Date;
    totalBiaya: number;
    status: "Masuk" | "Keluar";
  }>;
}
