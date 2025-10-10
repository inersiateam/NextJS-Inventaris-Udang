import { Jabatan } from "@prisma/client";

export interface BarangWithAdmin {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  adminId: number;
  createdAt: Date;
  updatedAt: Date;
  admin: {
    username: string;
    jabatan: string;
  };
}

export interface GetBarangParams {
  jabatan: Jabatan;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}