import { Jabatan } from "@prisma/client";

export interface CreateBarangInput {
  nama: string;
  harga: number;
}

export interface UpdateBarangInput extends CreateBarangInput {
  id: number;
}

export interface CreateBarangParams extends CreateBarangInput {
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface UpdateBarangParams extends UpdateBarangInput {
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeleteBarangParams {
  id: number;
  adminId: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface GetBarangParams {
  jabatan: Jabatan;
  page?: number;
  limit?: number;
  search?: string;
}

export interface BarangWithRelations {
  id: number;
  nama: string;
  harga: number;
  stok: number;
  createdAt: Date;
  updatedAt: Date;
  admin: {
    id: number;
    username: string;
    jabatan: Jabatan;
  };
}

export interface BarangResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: BarangWithRelations;
}

export interface BarangListResponse {
  success: boolean;
  data: BarangWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  jabatan: Jabatan;
}

export interface DeleteBarangResponse {
  success: boolean;
  message?: string;
  error?: string;
}