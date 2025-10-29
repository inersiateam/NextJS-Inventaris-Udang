"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  createBarang,
  updateBarang,
  deleteBarang,
  getBarangWithPagination,
} from "@/lib/services/barangService";
import { revalidatePath } from "next/cache";
import {
  CreateBarangInput,
  UpdateBarangInput,
  GetBarangParams,
} from "@/types/interfaces/IBarang";
import { Jabatan } from "@prisma/client";
import { getRequestHeaders } from "@/lib/helpers/globalHelper";

export async function getBarangAction(
  filters?: Omit<GetBarangParams, "jabatan">
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getBarangWithPagination({
      jabatan: session.user.jabatan as Jabatan,
      page: filters?.page,
      limit: filters?.limit,
      search: filters?.search,
    });

    return result;
  } catch (error) {
    console.error("Error in getBarangAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
    };
  }
}

export async function createBarangAction(input: CreateBarangInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await createBarang({
      nama: input.nama,
      harga: input.harga,
      satuan: input.satuan,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang");
    revalidatePath("/barang-masuk");
    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in createBarangAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updateBarangAction(input: UpdateBarangInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await updateBarang({
      id: input.id,
      nama: input.nama,
      harga: input.harga,
      satuan: input.satuan,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang");
    revalidatePath("/barang-masuk");
    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in updateBarangAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deleteBarangAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await deleteBarang({
      id,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang");
    revalidatePath("/barang-masuk");
    revalidatePath("/barang-keluar");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in deleteBarangAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
