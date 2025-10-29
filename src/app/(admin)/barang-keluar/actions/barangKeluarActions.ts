"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  getBarangKeluarWithPagination,
  getBarangKeluarByIdForEdit,
  getBarangKeluarById,
  createBarangKeluar,
  updateBarangKeluar,
  deleteBarangKeluar,
} from "@/lib/services/barangKeluarService";
import { IBarangKeluarInput } from "@/types/interfaces/IBarangKeluar";
import { barangKeluarSchema } from "@/lib/validations/barangKeluarValidator";
import { revalidatePath } from "next/cache";
import { Jabatan } from "@prisma/client";
import { getRequestHeaders } from "@/lib/helpers/globalHelper";
import prisma from "@/lib/prisma";

export async function getBarangKeluarAction(filters?: {
  page?: number;
  limit?: number;
  filterBulan?: number;
  status?: "BELUM_LUNAS" | "LUNAS";
}) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getBarangKeluarWithPagination(
      session.user.jabatan as Jabatan,
      {
        page: filters?.page,
        limit: filters?.limit,
        filterBulan: filters?.filterBulan,
        status: filters?.status,
      }
    );

    return result;
  } catch (error) {
    console.error("Error fetching barang keluar:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data barang keluar",
    };
  }
}

export async function getBarangListAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const barangs = await prisma.barang.findMany({
      where: {
        stok: { gt: 0 },
      },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
        satuan: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return {
      success: true,
      data: barangs,
    };
  } catch (error) {
    console.error("Error fetching barang list:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data barang",
    };
  }
}

export async function getPelangganListAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const pelanggans = await prisma.pelanggan.findMany({
      select: {
        id: true,
        nama: true,
        alamat: true,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return {
      success: true,
      data: pelanggans,
    };
  } catch (error) {
    console.error("Error fetching pelanggan list:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data pelanggan",
    };
  }
}

export async function createBarangKeluarAction(data: IBarangKeluarInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const validatedData = barangKeluarSchema.parse(data);
    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await createBarangKeluar({
      adminId: parseInt(session.user.id),
      jabatan: session.user.jabatan as Jabatan,
      data: validatedData,
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error: any) {
    console.error("Error creating barang keluar:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error:
          "Validasi gagal: " +
          error.issues.map((e: any) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error.message || "Terjadi kesalahan saat menambahkan barang keluar",
    };
  }
}

export async function updateBarangKeluarAction(
  data: IBarangKeluarInput & { id: number }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const validatedData = barangKeluarSchema.parse(data);
    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await updateBarangKeluar({
      id: data.id,
      adminId: parseInt(session.user.id),
      jabatan: session.user.jabatan as Jabatan,
      data: validatedData,
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error: any) {
    console.error("Error updating barang keluar:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error:
          "Validasi gagal: " +
          error.issues.map((e: any) => e.message).join(", "),
      };
    }

    return {
      success: false,
      error:
        error.message || "Terjadi kesalahan saat memperbarui barang keluar",
    };
  }
}

export async function getBarangKeluarByIdAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getBarangKeluarByIdForEdit(
      id,
      session.user.jabatan as Jabatan
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error fetching barang keluar detail:", error);
    return {
      success: false,
      error:
        error.message ||
        "Terjadi kesalahan saat mengambil detail barang keluar",
    };
  }
}

export async function getBarangKeluarDetailAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getBarangKeluarById(
      id,
      session.user.jabatan as Jabatan
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    console.error("Error fetching barang keluar detail:", error);
    return {
      success: false,
      error:
        error.message ||
        "Terjadi kesalahan saat mengambil detail barang keluar",
    };
  }
}

export async function deleteBarangKeluarAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();
    const result = await deleteBarangKeluar({
      id,
      jabatan: session.user.jabatan as Jabatan,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error: any) {
    console.error("Error deleting barang keluar:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat menghapus barang keluar",
    };
  }
}