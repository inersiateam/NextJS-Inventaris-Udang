export interface IPengeluaran {
  id: number;
  adminId: number;
  keterangan: string;
  jumlah: number;
  totalHarga: number;
  tanggal: Date;
  createdAt: Date;
  updatedAt: Date;
  admin: {
    id: number;
    username: string;
    jabatan: string;
  };
}

export interface IPengeluaranInput {
  keterangan: string;
  jumlah: number;
  totalHarga: number;
  tanggal: string;
}

export interface IPengeluaranQuery {
  page?: number;
  limit?: number;
  bulan?: string;
  tahun?: string;
}

export interface IPengeluaranResponse {
  success: boolean;
  data: IPengeluaran[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalPengeluaran: number;
  };
  jabatan: string;
}

export interface IPengeluaranCreateResponse {
  success: boolean;
  message: string;
  data: IPengeluaran;
}
