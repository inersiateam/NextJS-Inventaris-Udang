import { Jabatan } from "@prisma/client";

export interface LaporanStats {
  omset: number;
  labaBerjalan: number;
  modal: number;
  pengeluaran: number;
  labaBersih: number;
  percentageChange: {
    omset: number;
    labaBerjalan: number;
    modal: number;
    pengeluaran: number;
    labaBersih: number;
  };
  periodeLabel: string;
}

export interface ChartLaporanData {
  labels: string[];
  pengeluaran: number[];
  pendapatan: number[];
}

export interface ChartBarangItem {
  nama: string;
  labels: string[];
  data: number[];
}

export interface TopPelanggan {
  nama: string;
  alamat: string;
  totalTransaksi: number;
  barangNama: string;
}

export interface PembagianProvit {
  bulan: string;
  owner1: number;
  owner2: number;
  owner3: number;
  kas: number;
}

export interface GetLaporanParams {
  jabatan: Jabatan;
  bulan?: number;
  tahun?: number;
}

export interface GetChartLaporanParams {
  jabatan: Jabatan;
  periode?: number;
}

export interface GetTopPelangganParams {
  jabatan: Jabatan;
  barangNama?: string;
}

export interface GetPembagianProvitParams {
  jabatan: Jabatan;
  bulan?: number;
  tahun?: number;
}

export interface LaporanStatsResponse {
  success: boolean;
  data?: LaporanStats;
  error?: string;
}

export interface ChartLaporanResponse {
  success: boolean;
  data?: ChartLaporanData;
  error?: string;
}

export interface ChartBarangResponse {
  success: boolean;
  data?: ChartBarangItem[];
  error?: string;
}

export interface TopPelangganResponse {
  success: boolean;
  data?: TopPelanggan[];
  error?: string;
}

export interface PembagianProvitResponse {
  success: boolean;
  data?: PembagianProvit[];
  error?: string;
}

export interface LaporanClientProps {
  chartLaporan: ChartLaporanData;
  chartBarang: ChartBarangItem[];
  topPelangganWater: TopPelanggan[];
  topPelangganDifire: TopPelanggan[];
}

export interface LaporanCardProps {
  title: string;
  amount: number;
  percentageChange: number;
  periode: string;
}

export interface PembagianCardProps {
  owner1: number;
  owner2: number;
  owner3: number;
  kas: number;
}

export interface TopPelangganItemProps {
  nama: string;
  alamat: string;
  totalTransaksi: number;
}

export interface EmptyStateProps {
  message: string;
}
