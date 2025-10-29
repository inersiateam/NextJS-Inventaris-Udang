import { Jabatan } from "@prisma/client";
import { cache } from "react";
import prisma from "../prisma";
import { calculateJatuhTempo, getDateRange } from "../helpers/globalHelper";
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
import { logActivity } from "../fileLogger";

const BARANG_MASUK_SELECT = {
  id: true,
  noInvoice: true,
  noSuratJalan: true,
  tglMasuk: true,
  jatuhTempo: true,
  stokMasuk: true,
  ongkir: true,
  totalHarga: true,
  status: true,
  keterangan: true,
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
} as const;

export const getBarangMasukWithPagination = cache(
  async ({
    jabatan,
    page = 1,
    limit = 5,
    filterBulan,
    statusFilter = null,
  }: GetBarangMasukParams): Promise<BarangMasukListResponse> => {
    try {
      const skip = (page - 1) * limit;

      const where: any = { admin: { jabatan } };

      if (filterBulan && filterBulan > 0) {
        const { startDate, endDate } = getDateRange(filterBulan);
        where.tglMasuk = { gte: startDate, lte: endDate };
      }

      if (statusFilter === "BELUM_LUNAS" || statusFilter === "LUNAS") {
        where.status = statusFilter;
      }

      const [barangMasuk, total] = await Promise.all([
        prisma.barangMasuk.findMany({
          where,
          skip,
          take: limit,
          orderBy: { tglMasuk: "desc" },
          select: BARANG_MASUK_SELECT,
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
);

export const getBarangOptions = cache(
  async (jabatan: Jabatan): Promise<BarangOption[]> => {
    try {
      const barangList = await prisma.barang.findMany({
        where: { admin: { jabatan } },
        select: {
          id: true,
          nama: true,
          harga: true,
          stok: true,
          satuan: true,
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

const getBarangById = cache(async (id: number) => {
  return prisma.barang.findUnique({
    where: { id },
    select: { id: true, harga: true },
  });
});

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

    const barang = await getBarangById(validatedData.barangId);

    if (!barang) {
      throw new Error("Barang tidak ditemukan");
    }

    const tglMasuk = new Date(validatedData.tglMasuk);
    const jatuhTempo = calculateJatuhTempo(tglMasuk);
    const totalHarga =
      validatedData.stokMasuk * barang.harga + validatedData.ongkir;

    const result = await prisma.$transaction(async (tx) => {
      const barangMasuk = await tx.barangMasuk.create({
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
        select: BARANG_MASUK_SELECT,
      });

      await tx.barang.update({
        where: { id: validatedData.barangId },
        data: { stok: { increment: validatedData.stokMasuk } },
      });

      return barangMasuk;
    });

    logActivity({
      adminId: params.adminId,
      aksi: "CREATE",
      tabelTarget: "barang_masuk",
      dataBaru: JSON.stringify({
        id: result.id,
        noInvoice: result.noInvoice,
        barangId: result.barang.id,
        barangNama: result.barang.nama,
        stokMasuk: result.stokMasuk,
        totalHarga: result.totalHarga,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang masuk berhasil ditambahkan",
      data: result as BarangMasukWithRelations,
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

    const [existingBarangMasuk, barang] = await Promise.all([
      prisma.barangMasuk.findUnique({
        where: { id: params.id },
        select: { id: true, barangId: true, stokMasuk: true },
      }),
      getBarangById(validatedData.barangId),
    ]);

    if (!existingBarangMasuk) {
      throw new Error("Data barang masuk tidak ditemukan");
    }

    if (!barang) {
      throw new Error("Barang tidak ditemukan");
    }

    const tglMasuk = new Date(validatedData.tglMasuk);
    const jatuhTempo = calculateJatuhTempo(tglMasuk);
    const totalHarga =
      validatedData.stokMasuk * barang.harga + validatedData.ongkir;

    const result = await prisma.$transaction(async (tx) => {
      await tx.barang.update({
        where: { id: existingBarangMasuk.barangId },
        data: { stok: { decrement: existingBarangMasuk.stokMasuk } },
      });

      const updatedBarangMasuk = await tx.barangMasuk.update({
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
        select: BARANG_MASUK_SELECT,
      });

      await tx.barang.update({
        where: { id: validatedData.barangId },
        data: { stok: { increment: validatedData.stokMasuk } },
      });

      return updatedBarangMasuk;
    });

    logActivity({
      adminId: params.adminId,
      aksi: "UPDATE",
      tabelTarget: "barang_masuk",
      dataLama: JSON.stringify({
        id: existingBarangMasuk.id,
        stokMasuk: existingBarangMasuk.stokMasuk,
      }),
      dataBaru: JSON.stringify({
        id: result.id,
        stokMasuk: result.stokMasuk,
        totalHarga: result.totalHarga,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang masuk berhasil diperbarui",
      data: result as BarangMasukWithRelations,
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
      select: {
        id: true,
        barangId: true,
        stokMasuk: true,
        noInvoice: true,
      },
    });

    if (!existingBarangMasuk) {
      throw new Error("Data barang masuk tidak ditemukan");
    }

    await prisma.$transaction(async (tx) => {
      await tx.barangMasuk.delete({ where: { id: params.id } });
      await tx.barang.update({
        where: { id: existingBarangMasuk.barangId },
        data: { stok: { decrement: existingBarangMasuk.stokMasuk } },
      });
    });

    logActivity({
      adminId: params.adminId,
      aksi: "DELETE",
      tabelTarget: "barang_masuk",
      dataLama: JSON.stringify(existingBarangMasuk),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
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
