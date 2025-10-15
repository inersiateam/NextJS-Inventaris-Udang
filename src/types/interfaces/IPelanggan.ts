import { Jabatan } from "@prisma/client";

export interface PelangganBase {
  id: number;
  nama: string;
  alamat: string;
  adminId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PelangganAdmin {
  id: number;
  username: string;
  jabatan: Jabatan;
}

export interface PelangganWithAdmin extends PelangganBase {
  admin: PelangganAdmin;
  totalPembelian: number;
}

export interface PelangganDetail extends PelangganBase {
  admin: PelangganAdmin;
  totalPembelian: number;
  jumlahTransaksiLunas: number;
  jumlahTransaksiBelumLunas: number;
  totalTransaksi: number;
  daftarBarang: DaftarBarang[];
}

export interface DaftarBarang {
  namaBarang: string;
  jumlahPembelian: number;
  totalHarga: number;
}

export interface Top5Pelanggan {
  id: number;
  nama: string;
  alamat: string;
  totalPembelian: number;
  jumlahTransaksiLunas: number;
}

// Request params
export interface GetPelangganParams {
  jabatan: Jabatan;
}

export interface GetPelangganDetailParams {
  id: number;
  jabatan: Jabatan;
}

export interface CreatePelangganParams {
  nama: string;
  alamat: string;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdatePelangganParams {
  id: number;
  nama: string;
  alamat: string;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeletePelangganParams {
  id: number;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

// Response types
export interface PelangganResponse {
  success: boolean;
  message: string;
  data?: PelangganWithAdmin;
}

export interface PelangganListResponse {
  success: boolean;
  data: PelangganWithAdmin[];
  jabatan: Jabatan;
}

export interface PelangganDetailResponse {
  success: boolean;
  data: PelangganDetail;
}

export interface Top5PelangganResponse {
  success: boolean;
  data: Top5Pelanggan[];
}

export interface DeletePelangganResponse {
  success: boolean;
  message: string;
}
