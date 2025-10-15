"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { pengeluaranService } from "@/lib/services/pengeluaranService";
import {
  IPengeluaranInput,
  IPengeluaranQuery,
  IPengeluaranResponse,
  IPengeluaranCreateResponse,
} from "@/types/interfaces/IPengeluaran";
import { Jabatan } from "@prisma/client";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function getPengeluaranAction(
  query: IPengeluaranQuery = {}
): Promise<IPengeluaranResponse | { error: string; status: number }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        error: "Unauthorized - Silakan login terlebih dahulu",
        status: 401,
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await pengeluaranService.getPengeluaran(
      parseInt(session.user.id),
      session.user.jabatan as Jabatan,
      query,
      ipAddress,
      userAgent
    );

    return result;
  } catch (error) {
    console.error("Error fetching pengeluaran:", error);
    return {
      error: "Terjadi kesalahan saat mengambil data pengeluaran",
      status: 500,
    };
  }
}

export async function createPengeluaranAction(
  data: IPengeluaranInput
): Promise<IPengeluaranCreateResponse | { error: string; status: number }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        error: "Unauthorized - Silahkan login terlebih dahulu",
        status: 401,
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await pengeluaranService.createPengeluaran(
      parseInt(session.user.id),
      data,
      ipAddress,
      userAgent
    );

    revalidatePath("/pengeluaran");
    return result;
  } catch (error) {
    console.error("Error creating pengeluaran:", error);
    if (error instanceof z.ZodError) {
      return {
        error:
          "Validasi gagal: " + error.issues.map((e) => e.message).join(", "),
        status: 400,
      };
    }
    return {
      error: "Terjadi kesalahan server",
      status: 500,
    };
  }
}

export async function updatePengeluaranAction(
  id: number,
  data: IPengeluaranInput
): Promise<IPengeluaranCreateResponse | { error: string; status: number }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        error: "Unauthorized - Silahkan login terlebih dahulu",
        status: 401,
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await pengeluaranService.updatePengeluaran(
      id,
      parseInt(session.user.id),
      data,
      ipAddress,
      userAgent
    );

    revalidatePath("/pengeluaran");
    return result;
  } catch (error) {
    console.error("Error updating pengeluaran:", error);
    if (error instanceof z.ZodError) {
      return {
        error:
          "Validasi gagal: " + error.issues.map((e) => e.message).join(", "),
        status: 400,
      };
    }
    return {
      error: "Terjadi kesalahan server",
      status: 500,
    };
  }
}

export async function deletePengeluaranAction(
  id: number
): Promise<
  { success: boolean; message: string } | { error: string; status: number }
> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        error: "Unauthorized - Silahkan login terlebih dahulu",
        status: 401,
      };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const result = await pengeluaranService.deletePengeluaran(
      id,
      parseInt(session.user.id),
      ipAddress,
      userAgent
    );

    revalidatePath("/pengeluaran");
    return result;
  } catch (error) {
    console.error("Error deleting pengeluaran:", error);
    return {
      error: "Terjadi kesalahan server",
      status: 500,
    };
  }
}
