import { Jabatan } from "@prisma/client";

export interface CreateBarangMasukInput {
  barangId: number;
  noInvoice: string;
  noSuratJalan: string;
  stokMasuk: number;
  tglMasuk: string;
  ongkir?: number;
  status?: "LUNAS" | "BELUM_LUNAS";
  keterangan?: string;
}

export interface UpdateBarangMasukInput extends CreateBarangMasukInput {
  id: number;
}

export interface CreateBarangMasukParams extends CreateBarangMasukInput {
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateBarangMasukParams extends UpdateBarangMasukInput {
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeleteBarangMasukParams {
  id: number;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetBarangMasukParams {
  jabatan: Jabatan;
  page?: number;
  limit?: number;
  filterBulan?: number;
  statusFilter?: "BELUM_LUNAS" | "LUNAS" | null;
}

export interface BarangMasukWithRelations {
  id: number;
  noInvoice: string;
  noSuratJalan: string;
  tglMasuk: Date;
  jatuhTempo: Date;
  stokMasuk: number;
  ongkir: number;
  totalHarga: number;
  status: string;
  keterangan: string | null;
  barang: {
    id: number;
    nama: string;
    harga: number;
    stok: number;
  };
  admin: {
    id: number;
    username: string;
    jabatan: Jabatan;
  };
}

export interface BarangOption {
  id: number;
  nama: string;
  harga: number;
  stok: number;
}

export interface PelangganOption {
  id: number;
  nama: string;
  alamat: string;
}

export interface BarangMasukResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: BarangMasukWithRelations;
}

export interface BarangMasukListResponse {
  success: boolean;
  data: BarangMasukWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  jabatan: Jabatan;
}

export interface DeleteBarangMasukResponse {
  success: boolean;
  message?: string;
  error?: string;
}
