import { Jabatan } from "@prisma/client";

export interface IBarangKeluarItem {
  barangId: number;
  jmlPembelian: number;
  hargaJual: number;
}

export interface IBarangKeluarInput {
  pelangganId: number;
  tglKeluar: string;
  ongkir: number;
  items: IBarangKeluarItem[];
  status?: "LUNAS" | "BELUM_LUNAS";
  noPo?: string;
}

export interface IBarangKeluarDetail {
  namaBarang: string;
  jmlPembelian: number;
  hargaJual: number;
  subtotal: number;
  subtotalModal: number;
}

export interface IBarangKeluarResponse {
  id: number;
  noInvoice: string;
  noSuratJalan: string;
  tglKeluar: Date;
  jatuhTempo: Date;
  namaPelanggan: string;
  alamatPelanggan: string;
  items: IBarangKeluarDetail[];
  totalOmset: number;
  totalModal: number;
  labaKotor: number;
  totalFee: number;
  ongkir: number;
  totalBiayaKeluar: number;
  labaBerjalan: number;
  status: "LUNAS" | "BELUM_LUNAS";
}

export interface IBarangKeluarPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IBarangKeluarListResponse {
  success: boolean;
  data: IBarangKeluarResponse[];
  pagination: IBarangKeluarPagination;
  jabatan: string;
}

export interface IBarangKeluarFilter {
  page?: number;
  limit?: number;
  filterBulan?: number;
  status?: "BELUM_LUNAS" | "LUNAS";
}

export interface DetailItem {
  namaBarang: string;
  jmlPembelian: number;
  hargaJual: number;
  subtotal: number;
  subtotalModal: number;
  satuan: "KG" | "LITER";
}

export interface DetailData {
  noInvoice: string;
  noPo?: string;
  noSuratJalan: string;
  tglKeluar: Date;
  jatuhTempo: Date;
  namaPelanggan: string;
  alamatPelanggan: string;
  items: DetailItem[];
  totalOmset: number;
  totalModal: number;
  labaKotor: number;
  totalFee: number;
  ongkir: number;
  totalBiayaKeluar: number;
  labaBerjalan: number;
  status: string;
  satuan: "KG" | "LITER";
}

export interface CreateBarangKeluarParams {
  adminId: number;
  jabatan: Jabatan;
  data: IBarangKeluarInput;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateBarangKeluarParams {
  id: number;
  adminId: number;
  jabatan: Jabatan;
  data: IBarangKeluarInput;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeleteBarangKeluarParams {
  id: number;
  jabatan: Jabatan;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}
