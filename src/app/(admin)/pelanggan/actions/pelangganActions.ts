"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import { Jabatan } from "@prisma/client";
import { getRequestHeaders } from "@/lib/helpers/globalHelper";
import { PelangganInput } from "@/lib/validations/pelangganValidator";
import { createPelanggan, deletePelanggan, getPelangganDetail, getPelangganList, getTop5Pelanggan, updatePelanggan } from "@/lib/services/pelangganService";

export async function getPelangganAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getPelangganList({
      jabatan: session.user.jabatan as Jabatan,
    })

    return result;
  } catch (error) {
    console.error("Error in getPelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
    };
  }
}

export async function getTop5PelangganAction() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await getTop5Pelanggan({
      jabatan: session.user.jabatan as Jabatan,
    });

    return result;
  } catch (error) {
    console.error("Error in getTop5PelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil data",
    };
  }
}

export async function getPelangganDetailAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    if (isNaN(id)) {
      return {
        success: false,
        error: "ID pelanggan tidak valid",
      };
    }

    const result = await getPelangganDetail({
      id,
      jabatan: session.user.jabatan as Jabatan,
    });

    return result;
  } catch (error) {
    console.error("Error in getPelangganDetailAction:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengambil detail pelanggan",
    };
  }
}

export async function createPelangganAction(input: PelangganInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await createPelanggan({
      nama: input.nama,
      alamat: input.alamat,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/pelanggan");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in createPelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function updatePelangganAction(id: number, input: PelangganInput) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    if (isNaN(id)) {
      return {
        success: false,
        error: "ID pelanggan tidak valid",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await updatePelanggan({
      id,
      nama: input.nama,
      alamat: input.alamat,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/pelanggan");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in updatePelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}

export async function deletePelangganAction(id: number) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    if (isNaN(id)) {
      return {
        success: false,
        error: "ID pelanggan tidak valid",
      };
    }

    const { ipAddress, userAgent } = await getRequestHeaders();

    const result = await deletePelanggan({
      id,
      adminId: parseInt(session.user.id),
      ipAddress,
      userAgent,
    });

    revalidatePath("/pelanggan");
    revalidatePath("/dashboard");

    return result;
  } catch (error) {
    console.error("Error in deletePelangganAction:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Terjadi kesalahan server",
    };
  }
}