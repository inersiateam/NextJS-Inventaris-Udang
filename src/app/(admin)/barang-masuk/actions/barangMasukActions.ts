"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import {
  createBarangMasuk,
  updateBarangMasuk,
  deleteBarangMasuk,
} from "@/lib/services/barangMasukService";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { CreateBarangMasukInput, UpdateBarangMasukInput } from "@/types/interfaces/IBarangMasuk";


export async function createBarangMasukAction(input: CreateBarangMasukInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silahkan login terlebih dahulu",
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await createBarangMasuk({
      barangId: input.barangId,
      adminId: parseInt(session.user.id),
      noInvoice: input.noInvoice,
      noSuratJalan: input.noSuratJalan,
      stokMasuk: input.stokMasuk,
      tglMasuk: input.tglMasuk,
      ongkir: input.ongkir,
      status: input.status,
      keterangan: input.keterangan || undefined,
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-masuk");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in createBarangMasukAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updateBarangMasukAction(input: UpdateBarangMasukInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silahkan login terlebih dahulu",
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await updateBarangMasuk({
      id: input.id,
      adminId: parseInt(session.user.id),
      barangId: input.barangId,
      noInvoice: input.noInvoice,
      noSuratJalan: input.noSuratJalan,
      stokMasuk: input.stokMasuk,
      tglMasuk: input.tglMasuk,
      ongkir: input.ongkir,
      status: input.status,
      keterangan: input.keterangan || undefined,
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-masuk");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in updateBarangMasukAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deleteBarangMasukAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silahkan login terlebih dahulu",
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await deleteBarangMasuk({
      id,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/barang-masuk");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in deleteBarangMasukAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}
