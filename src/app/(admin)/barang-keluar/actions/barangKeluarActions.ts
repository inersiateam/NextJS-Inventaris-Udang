"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { BarangKeluarService } from "@/lib/services/barangKeluarService";
import {
  IBarangKeluarInput,
  IBarangKeluarFilter,
} from "@/types/interfaces/IBarangKeluar";
import { barangKeluarSchema } from "@/lib/validations/barangKeluarValidator";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Jabatan } from "@prisma/client";

export async function getBarangKeluarAction(filters?: IBarangKeluarFilter) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await BarangKeluarService.getBarangKeluar(
      parseInt(session.user.id),
      session.user.jabatan as Jabatan,
      filters
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "READ",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(result.data),
        ipAddress: "server-action",
        userAgent: "server-action",
        timestamp: new Date(),
      },
    });

    return result;
  } catch (error) {
    console.error("Error fetching barang keluar:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat mengambil data barang keluar",
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

    const result = await BarangKeluarService.createBarangKeluar(
      parseInt(session.user.id),
      session.user.jabatan as Jabatan,
      validatedData
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "CREATE",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(result.data),
        ipAddress: "server-action",
        userAgent: "server-action",
        timestamp: new Date(),
      },
    });

    revalidatePath("/barang-keluar");

    return result;
  } catch (error: any) {
    console.error("Error creating barang keluar:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Validasi gagal",
        details: error.issues,
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

    const result = await BarangKeluarService.updateBarangKeluar(
      data.id,
      parseInt(session.user.id),
      session.user.jabatan as Jabatan,
      validatedData
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "UPDATE",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify(result.data),
        ipAddress: "server-action",
        userAgent: "server-action",
        timestamp: new Date(),
      },
    });

    revalidatePath("/barang-keluar");

    return result;
  } catch (error: any) {
    console.error("Error updating barang keluar:", error);

    if (error.name === "ZodError") {
      return {
        success: false,
        error: "Validasi gagal",
        details: error.issues,
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

    const result = await BarangKeluarService.getBarangKeluarByIdForEdit(
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

export async function updateStatusBarangKeluarAction(
  id: number,
  status: "LUNAS" | "BELUM_LUNAS"
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return {
        success: false,
        error: "Unauthorized - Silakan login terlebih dahulu",
      };
    }

    const result = await BarangKeluarService.updateStatus(
      id,
      status,
      session.user.jabatan as Jabatan
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "UPDATE",
        tabelTarget: "transaksi_keluar",
        dataBaru: JSON.stringify({ id, status }),
        ipAddress: "server-action",
        userAgent: "server-action",
        timestamp: new Date(),
      },
    });

    revalidatePath("/barang-keluar");

    return result;
  } catch (error: any) {
    console.error("Error updating status:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat mengupdate status",
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

    const result = await BarangKeluarService.deleteBarangKeluar(
      id,
      session.user.jabatan as Jabatan
    );

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "DELETE",
        tabelTarget: "barang_keluar",
        dataBaru: JSON.stringify({ id }),
        ipAddress: "server-action",
        userAgent: "server-action",
        timestamp: new Date(),
      },
    });

    revalidatePath("/barang-keluar");

    return result;
  } catch (error: any) {
    console.error("Error deleting barang keluar:", error);
    return {
      success: false,
      error: error.message || "Terjadi kesalahan saat menghapus barang keluar",
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
        stok: {
          gt: 0,
        },
      },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
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
