import { Jabatan } from "@prisma/client";
import prisma from "../prisma";
import { cache } from "react";
import { calculateJatuhTempo } from "../helpers/globalHelper";
import { barangMasukSchema } from "../validations/barangMasukValidator";
import {
  BarangMasukWithRelations,
  BarangOption,
  GetBarangMasukParams,
  CreateBarangMasukParams,
  UpdateBarangMasukParams,
  DeleteBarangMasukParams,
  BarangMasukResponse,
  BarangMasukListResponse,
  DeleteBarangMasukResponse,
} from "@/types/interfaces/IBarangMasuk";
import z from "zod";

export const getBarangMasukList = cache(
  async (jabatan: Jabatan): Promise<BarangMasukWithRelations[]> => {
    try {
      const barangMasuk = await prisma.barangMasuk.findMany({
        where: {
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        orderBy: { tglMasuk: "desc" },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              harga: true,
              stok: true,
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
        },
      });

      return barangMasuk as BarangMasukWithRelations[];
    } catch (error) {
      console.error("Error fetching barang masuk list:", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang masuk");
    }
  }
);

export async function getBarangMasukWithPagination({
  jabatan,
  page = 1,
  limit = 10,
  filterBulan = 1,
  statusFilter = null,
}: GetBarangMasukParams): Promise<BarangMasukListResponse> {
  try {
    const skip = (page - 1) * limit;
    const where: any = {
      admin: {
        jabatan: jabatan,
      },
    };

    const now = new Date();
    const startDate = new Date(now);

    if (filterBulan === 1) {
      startDate.setMonth(now.getMonth() - 1);
    } else if (filterBulan === 3) {
      startDate.setMonth(now.getMonth() - 3);
    } else if (filterBulan === 6) {
      startDate.setMonth(now.getMonth() - 6);
    } else if (filterBulan === 12) {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    where.tglMasuk = {
      gte: startDate,
      lte: now,
    };

    if (statusFilter === "BELUM_LUNAS") {
      where.status = "BELUM_LUNAS";
    }

    const [barangMasuk, total] = await Promise.all([
      prisma.barangMasuk.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tglMasuk: "desc" },
        include: {
          barang: {
            select: {
              id: true,
              nama: true,
              harga: true,
              stok: true,
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
        },
      }),
      prisma.barangMasuk.count({ where }),
    ]);

    return {
      success: true,
      data: barangMasuk as BarangMasukWithRelations[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      jabatan,
    };
  } catch (error) {
    console.error("Error fetching barang masuk:", error);
    throw new Error("Terjadi kesalahan saat mengambil data barang masuk");
  }
}

export async function getBarangMasukById(
  id: number
): Promise<BarangMasukWithRelations> {
  try {
    const barangMasuk = await prisma.barangMasuk.findUnique({
      where: { id },
      include: {
        barang: {
          select: {
            id: true,
            nama: true,
            harga: true,
            stok: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    if (!barangMasuk) {
      throw new Error("Data barang masuk tidak ditemukan");
    }

    return barangMasuk as BarangMasukWithRelations;
  } catch (error) {
    console.error("Error fetching barang masuk by id:", error);
    throw error;
  }
}

export async function createBarangMasuk(
  params: CreateBarangMasukParams
): Promise<BarangMasukResponse> {
  try {
    const validatedData = barangMasukSchema.parse({
      barangId: params.barangId,
      noInvoice: params.noInvoice,
      noSuratJalan: params.noSuratJalan,
      stokMasuk: params.stokMasuk,
      tglMasuk: params.tglMasuk,
      ongkir: params.ongkir || 0,
      status: params.status || "BELUM_LUNAS",
      keterangan: params.keterangan || undefined,
    });

    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.barangId },
    });

    if (!barang) {
      throw new Error("Barang tidak ditemukan");
    }

    const tglMasuk = new Date(validatedData.tglMasuk);
    const jatuhTempo = calculateJatuhTempo(tglMasuk);
    const totalHarga =
      validatedData.stokMasuk * barang.harga + validatedData.ongkir;

    const barangMasuk = await prisma.barangMasuk.create({
      data: {
        barangId: validatedData.barangId,
        adminId: params.adminId,
        noInvoice: validatedData.noInvoice,
        noSuratJalan: validatedData.noSuratJalan,
        stokMasuk: validatedData.stokMasuk,
        tglMasuk,
        jatuhTempo,
        ongkir: validatedData.ongkir,
        totalHarga,
        keterangan: validatedData.keterangan || null,
        status: validatedData.status || "BELUM_LUNAS",
      },
      include: {
        barang: {
          select: {
            id: true,
            nama: true,
            harga: true,
            stok: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    await prisma.barang.update({
      where: { id: validatedData.barangId },
      data: {
        stok: {
          increment: validatedData.stokMasuk,
        },
      },
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: params.adminId,
        aksi: "CREATE",
        tabelTarget: "barang_masuk",
        dataBaru: JSON.stringify(barangMasuk),
        ipAddress: params.ipAddress || "unknown",
        userAgent: params.userAgent || "unknown",
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      message: "Barang masuk berhasil ditambahkan",
      data: barangMasuk as BarangMasukWithRelations,
    };
  } catch (error) {
    console.error("Error creating barang masuk: ", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}


export async function updateBarangMasuk(
  params: UpdateBarangMasukParams
): Promise<BarangMasukResponse> {
  try {
    const validatedData = barangMasukSchema.parse({
      barangId: params.barangId,
      noInvoice: params.noInvoice,
      noSuratJalan: params.noSuratJalan,
      stokMasuk: params.stokMasuk,
      tglMasuk: params.tglMasuk,
      ongkir: params.ongkir || 0,
      status: params.status || "BELUM_LUNAS",
      keterangan: params.keterangan || undefined,
    });

    const existingBarangMasuk = await prisma.barangMasuk.findUnique({
      where: { id: params.id },
    });

    if (!existingBarangMasuk) {
      throw new Error("Data barang masuk tidak ditemukan");
    }

    const barang = await prisma.barang.findUnique({
      where: { id: validatedData.barangId },
    });

    if (!barang) {
      throw new Error("Barang tidak ditemukan");
    }

    const tglMasuk = new Date(validatedData.tglMasuk);
    const jatuhTempo = calculateJatuhTempo(tglMasuk);
    const totalHarga =
      validatedData.stokMasuk * barang.harga + validatedData.ongkir;

    const updatedBarangMasuk = await prisma.barangMasuk.update({
      where: { id: params.id },
      data: {
        barangId: validatedData.barangId,
        noInvoice: validatedData.noInvoice,
        noSuratJalan: validatedData.noSuratJalan,
        stokMasuk: validatedData.stokMasuk,
        tglMasuk,
        jatuhTempo,
        ongkir: validatedData.ongkir,
        totalHarga,
        keterangan: validatedData.keterangan || null,
        status: validatedData.status || "BELUM_LUNAS",
      },
      include: {
        barang: {
          select: {
            id: true,
            nama: true,
            harga: true,
            stok: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    await prisma.barang.update({
      where: { id: existingBarangMasuk.barangId },
      data: {
        stok: {
          decrement: existingBarangMasuk.stokMasuk,
        },
      },
    });

    await prisma.barang.update({
      where: { id: validatedData.barangId },
      data: {
        stok: {
          increment: validatedData.stokMasuk,
        },
      },
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: params.adminId,
        aksi: "UPDATE",
        tabelTarget: "barang_masuk",
        dataLama: JSON.stringify(existingBarangMasuk),
        dataBaru: JSON.stringify(updatedBarangMasuk),
        ipAddress: params.ipAddress || "unknown",
        userAgent: params.userAgent || "unknown",
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      message: "Barang masuk berhasil diperbarui",
      data: updatedBarangMasuk as BarangMasukWithRelations,
    };
  } catch (error) {
    console.error("Error updating barang masuk: ", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function deleteBarangMasuk(
  params: DeleteBarangMasukParams
): Promise<DeleteBarangMasukResponse> {
  try {
    const existingBarangMasuk = await prisma.barangMasuk.findUnique({
      where: { id: params.id },
      include: {
        barang: true,
      },
    });

    if (!existingBarangMasuk) {
      throw new Error("Data barang masuk tidak ditemukan");
    }

    await prisma.barangMasuk.delete({
      where: { id: params.id },
    });

    await prisma.barang.update({
      where: { id: existingBarangMasuk.barangId },
      data: {
        stok: {
          decrement: existingBarangMasuk.stokMasuk,
        },
      },
    });

    await prisma.logAktivitas.create({
      data: {
        adminId: params.adminId,
        aksi: "DELETE",
        tabelTarget: "barang_masuk",
        dataLama: JSON.stringify(existingBarangMasuk),
        ipAddress: params.ipAddress || "unknown",
        userAgent: params.userAgent || "unknown",
        timestamp: new Date(),
      },
    });

    return {
      success: true,
      message: "Barang masuk berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting barang masuk: ", error);
    throw error;
  }
}

export const getBarangOptions = cache(
  async (jabatan: Jabatan): Promise<BarangOption[]> => {
    try {
      const barangList = await prisma.barang.findMany({
        where: {
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        select: {
          id: true,
          nama: true,
          harga: true,
          stok: true,
        },
        orderBy: { nama: "asc" },
      });

      return barangList;
    } catch (error) {
      console.error("Error fetching barang options:", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang");
    }
  }
);
