import { Jabatan } from "@prisma/client";
import { cache } from "react";
import prisma from "../prisma";
import { barangSchema } from "../validations/barangValidator";
import {
  BarangWithRelations,
  GetBarangParams,
  CreateBarangParams,
  UpdateBarangParams,
  DeleteBarangParams,
  BarangResponse,
  BarangListResponse,
  DeleteBarangResponse,
} from "@/types/interfaces/IBarang";
import z from "zod";
import { logActivity } from "../fileLogger";

const BARANG_SELECT = {
  id: true,
  nama: true,
  harga: true,
  stok: true,
  createdAt: true,
  updatedAt: true,
  admin: {
    select: {
      id: true,
      username: true,
      jabatan: true,
    },
  },
} as const;

export const getBarangWithPagination = cache(
  async ({
    jabatan,
    page = 1,
    limit = 10,
    search,
  }: GetBarangParams): Promise<BarangListResponse> => {
    try {
      const skip = (page - 1) * limit;

      const where: any = { admin: { jabatan } };

      if (search && search.trim() !== "") {
        where.nama = {
          contains: search.trim(),
          mode: "insensitive",
        };
      }

      const [barang, total] = await Promise.all([
        prisma.barang.findMany({
          where,
          skip,
          take: limit,
          orderBy: { nama: "asc" },
          select: BARANG_SELECT,
        }),
        prisma.barang.count({ where }),
      ]);

      return {
        success: true,
        data: barang as BarangWithRelations[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        jabatan,
      };
    } catch (error) {
      console.error("Error fetching barang:", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang");
    }
  }
);

export const getAllBarang = cache(async (jabatan: Jabatan) => {
  try {
    const barang = await prisma.barang.findMany({
      where: { admin: { jabatan } },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
      },
      orderBy: { nama: "asc" },
    });

    return barang;
  } catch (error) {
    console.error("Error fetching all barang:", error);
    throw new Error("Terjadi kesalahan saat mengambil data barang");
  }
});

export async function createBarang(
  params: CreateBarangParams
): Promise<BarangResponse> {
  try {
    const validatedData = barangSchema.parse({
      nama: params.nama,
      harga: params.harga,
    });

    const existingBarang = await prisma.barang.findFirst({
      where: {
        nama: validatedData.nama,
        admin: {
          jabatan: (
            await prisma.admin.findUnique({ where: { id: params.adminId } })
          )?.jabatan,
        },
      },
    });

    if (existingBarang) {
      throw new Error("Nama barang sudah digunakan");
    }

    const barang = await prisma.barang.create({
      data: {
        nama: validatedData.nama,
        harga: validatedData.harga,
        stok: 0,
        adminId: params.adminId,
      },
      select: BARANG_SELECT,
    });

    logActivity({
      adminId: params.adminId,
      aksi: "CREATE",
      tabelTarget: "barang",
      dataBaru: JSON.stringify({
        id: barang.id,
        nama: barang.nama,
        harga: barang.harga,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang berhasil ditambahkan",
      data: barang as BarangWithRelations,
    };
  } catch (error) {
    console.error("Error creating barang:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function updateBarang(
  params: UpdateBarangParams
): Promise<BarangResponse> {
  try {
    const validatedData = barangSchema.parse({
      nama: params.nama,
      harga: params.harga,
    });

    const existingBarang = await prisma.barang.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
        adminId: true,
      },
    });

    if (!existingBarang) {
      throw new Error("Data barang tidak ditemukan");
    }

    const duplicateBarang = await prisma.barang.findFirst({
      where: {
        nama: validatedData.nama,
        id: { not: params.id },
        admin: {
          jabatan: (
            await prisma.admin.findUnique({ where: { id: params.adminId } })
          )?.jabatan,
        },
      },
    });

    if (duplicateBarang) {
      throw new Error("Nama barang sudah digunakan");
    }

    const updatedBarang = await prisma.barang.update({
      where: { id: params.id },
      data: {
        nama: validatedData.nama,
        harga: validatedData.harga,
      },
      select: BARANG_SELECT,
    });

    logActivity({
      adminId: params.adminId,
      aksi: "UPDATE",
      tabelTarget: "barang",
      dataLama: JSON.stringify({
        id: existingBarang.id,
        nama: existingBarang.nama,
        harga: existingBarang.harga,
      }),
      dataBaru: JSON.stringify({
        id: updatedBarang.id,
        nama: updatedBarang.nama,
        harga: updatedBarang.harga,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang berhasil diperbarui",
      data: updatedBarang as BarangWithRelations,
    };
  } catch (error) {
    console.error("Error updating barang:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function deleteBarang(
  params: DeleteBarangParams
): Promise<DeleteBarangResponse> {
  try {
    const existingBarang = await prisma.barang.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
        _count: {
          select: {
            barangMasuk: true,
            barangKeluarDetail: true,
          },
        },
      },
    });

    if (!existingBarang) {
      throw new Error("Data barang tidak ditemukan");
    }

    if (
      existingBarang._count.barangMasuk > 0 ||
      existingBarang._count.barangKeluarDetail > 0
    ) {
      throw new Error(
        "Barang tidak dapat dihapus karena memiliki riwayat transaksi"
      );
    }

    await prisma.barang.delete({
      where: { id: params.id },
    });

    logActivity({
      adminId: params.adminId,
      aksi: "DELETE",
      tabelTarget: "barang",
      dataLama: JSON.stringify({
        id: existingBarang.id,
        nama: existingBarang.nama,
        harga: existingBarang.harga,
        stok: existingBarang.stok,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting barang:", error);
    throw error;
  }
}
