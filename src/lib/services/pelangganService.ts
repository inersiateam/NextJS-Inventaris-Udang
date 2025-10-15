import { cache } from "react";
import prisma from "../prisma";
import { pelangganSchema } from "../validations/pelangganValidator";
import {
  PelangganWithAdmin,
  PelangganDetail,
  Top5Pelanggan,
  GetPelangganParams,
  GetPelangganDetailParams,
  CreatePelangganParams,
  UpdatePelangganParams,
  DeletePelangganParams,
  PelangganResponse,
  PelangganListResponse,
  PelangganDetailResponse,
  Top5PelangganResponse,
  DeletePelangganResponse,
} from "@/types/interfaces/IPelanggan";
import z from "zod";
import { logActivity } from "../fileLogger";

const PELANGGAN_SELECT = {
  id: true,
  nama: true,
  alamat: true,
  adminId: true,
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

export const getPelangganList = cache(
  async ({ jabatan }: GetPelangganParams): Promise<PelangganListResponse> => {
    try {
      const pelanggan = await prisma.pelanggan.findMany({
        where: {
          admin: {
            jabatan,
          },
        },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
          barangKeluar: {
            where: {
              admin: {
                jabatan,
              },
            },
            include: {
              details: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const pelangganWithTotalPembelian = await Promise.all(
        pelanggan.map(async (p) => {
          const barangKeluarIds = p.barangKeluar.map((bk) => bk.id);

          const transaksiLunas = await prisma.transaksiKeluar.findMany({
            where: {
              barangKeluarId: {
                in: barangKeluarIds,
              },
              status: "LUNAS",
              admin: {
                jabatan,
              },
            },
          });

          const totalPembelian = p.barangKeluar
            .filter((bk) =>
              transaksiLunas.some((t) => t.barangKeluarId === bk.id)
            )
            .reduce((sum, bk) => {
              const detailSum = bk.details.reduce(
                (detailSum, detail) => detailSum + detail.jmlPembelian,
                0
              );
              return sum + detailSum;
            }, 0);

          return {
            id: p.id,
            nama: p.nama,
            alamat: p.alamat,
            totalPembelian,
            adminId: p.adminId,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
            admin: p.admin,
          };
        })
      );

      return {
        success: true,
        data: pelangganWithTotalPembelian,
        jabatan,
      };
    } catch (error) {
      console.error("Error fetching pelanggan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data pelanggan");
    }
  }
);

export const getTop5Pelanggan = cache(
  async ({ jabatan }: GetPelangganParams): Promise<Top5PelangganResponse> => {
    try {
      const topPelanggan = await prisma.pelanggan.findMany({
        where: {
          admin: {
            jabatan,
          },
        },
        include: {
          barangKeluar: {
            where: {
              admin: {
                jabatan,
              },
            },
            include: {
              admin: true,
              details: true,
            },
          },
        },
      });

      const pelangganWithStats = await Promise.all(
        topPelanggan.map(async (pelanggan) => {
          const barangKeluarIds = pelanggan.barangKeluar.map((bk) => bk.id);

          const transaksiLunas = await prisma.transaksiKeluar.findMany({
            where: {
              barangKeluarId: {
                in: barangKeluarIds,
              },
              status: "LUNAS",
              admin: {
                jabatan,
              },
            },
          });

          const totalPembelian = pelanggan.barangKeluar
            .filter((bk) =>
              transaksiLunas.some((t) => t.barangKeluarId === bk.id)
            )
            .reduce((sum, bk) => {
              const detailSum = bk.details.reduce(
                (detailSum, detail) => detailSum + detail.jmlPembelian,
                0
              );
              return sum + detailSum;
            }, 0);

          return {
            id: pelanggan.id,
            nama: pelanggan.nama,
            alamat: pelanggan.alamat,
            totalPembelian,
            jumlahTransaksiLunas: transaksiLunas.length,
          };
        })
      );

      const top5 = pelangganWithStats
        .filter((p) => p.totalPembelian > 0)
        .sort((a, b) => b.totalPembelian - a.totalPembelian)
        .slice(0, 5);

      return {
        success: true,
        data: top5,
      };
    } catch (error) {
      console.error("Error fetching top 5 pelanggan:", error);
      throw new Error("Terjadi kesalahan saat mengambil data top pelanggan");
    }
  }
);

export const getPelangganDetail = cache(
  async ({
    id,
    jabatan,
  }: GetPelangganDetailParams): Promise<PelangganDetailResponse> => {
    try {
      const pelanggan = await prisma.pelanggan.findFirst({
        where: {
          id,
          admin: {
            jabatan,
          },
        },
        include: {
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
          barangKeluar: {
            where: {
              admin: {
                jabatan,
              },
            },
            include: {
              details: {
                include: {
                  barang: {
                    select: {
                      id: true,
                      nama: true,
                      harga: true,
                    },
                  },
                },
              },
              transaksiKeluar: true,
            },
            orderBy: {
              tglKeluar: "desc",
            },
          },
        },
      });

      if (!pelanggan) {
        throw new Error("Pelanggan tidak ditemukan");
      }

      // Agregasi pembelian per barang (hanya dari transaksi lunas)
      const barangMap = new Map<
        number,
        {
          namaBarang: string;
          jumlahPembelian: number;
          totalHarga: number;
        }
      >();

      pelanggan.barangKeluar
        .filter((bk) => bk.transaksiKeluar?.[0]?.status === "LUNAS")
        .forEach((bk) => {
          bk.details.forEach((detail) => {
            const existing = barangMap.get(detail.barangId);
            if (existing) {
              existing.jumlahPembelian += detail.jmlPembelian;
              existing.totalHarga += detail.subtotal;
            } else {
              barangMap.set(detail.barangId, {
                namaBarang: detail.barang.nama,
                jumlahPembelian: detail.jmlPembelian,
                totalHarga: detail.subtotal,
              });
            }
          });
        });

      const daftarBarang = Array.from(barangMap.values());

      // Hitung total pembelian keseluruhan (dari semua transaksi, tidak hanya lunas)
      const totalPembelian = pelanggan.barangKeluar.reduce((sum, bk) => {
        const detailSum = bk.details.reduce(
          (detailSum, detail) => detailSum + detail.subtotal,
          0
        );
        return sum + detailSum;
      }, 0);

      // Hitung jumlah transaksi per status
      const jumlahTransaksiLunas = pelanggan.barangKeluar.filter(
        (bk) => bk.transaksiKeluar?.[0].status === "LUNAS"
      ).length;

      const jumlahTransaksiBelumLunas = pelanggan.barangKeluar.filter(
        (bk) =>
          !bk.transaksiKeluar ||
          bk.transaksiKeluar?.[0].status === "BELUM_LUNAS"
      ).length;

      const totalTransaksi = pelanggan.barangKeluar.length;

      return {
        success: true,
        data: {
          id: pelanggan.id,
          nama: pelanggan.nama,
          alamat: pelanggan.alamat,
          totalPembelian,
          jumlahTransaksiLunas,
          jumlahTransaksiBelumLunas,
          totalTransaksi,
          admin: pelanggan.admin,
          adminId: pelanggan.adminId,
          createdAt: pelanggan.createdAt,
          updatedAt: pelanggan.updatedAt,
          daftarBarang,
        },
      };
    } catch (error) {
      console.error("Error fetching pelanggan detail:", error);
      throw error;
    }
  }
);

export async function createPelanggan(
  params: CreatePelangganParams
): Promise<PelangganResponse> {
  try {
    const validatedData = pelangganSchema.parse({
      nama: params.nama,
      alamat: params.alamat,
    });

    const adminWithJabatan = await prisma.admin.findUnique({
      where: { id: params.adminId },
      select: { jabatan: true },
    });

    if (!adminWithJabatan) {
      throw new Error("Admin tidak ditemukan");
    }

    const existingPelanggan = await prisma.pelanggan.findFirst({
      where: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
        admin: {
          jabatan: adminWithJabatan.jabatan,
        },
      },
    });

    if (existingPelanggan) {
      throw new Error("Pelanggan dengan nama dan alamat yang sama sudah ada");
    }

    const pelanggan = await prisma.pelanggan.create({
      data: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
        adminId: params.adminId,
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    logActivity({
      adminId: params.adminId,
      aksi: "CREATE",
      tabelTarget: "pelanggan",
      dataBaru: JSON.stringify({
        id: pelanggan.id,
        nama: pelanggan.nama,
        alamat: pelanggan.alamat,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Pelanggan berhasil ditambahkan",
      data: {
        ...pelanggan,
        totalPembelian: 0,
      },
    };
  } catch (error) {
    console.error("Error creating pelanggan:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function updatePelanggan(
  params: UpdatePelangganParams
): Promise<PelangganResponse> {
  try {
    const validatedData = pelangganSchema.parse({
      nama: params.nama,
      alamat: params.alamat,
    });

    const existingPelanggan = await prisma.pelanggan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nama: true,
        alamat: true,
        adminId: true,
      },
    });

    if (!existingPelanggan) {
      throw new Error("Data pelanggan tidak ditemukan");
    }

    const adminWithJabatan = await prisma.admin.findUnique({
      where: { id: params.adminId },
      select: { jabatan: true },
    });

    if (!adminWithJabatan) {
      throw new Error("Admin tidak ditemukan");
    }

    const duplicatePelanggan = await prisma.pelanggan.findFirst({
      where: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
        admin: {
          jabatan: adminWithJabatan.jabatan,
        },
        id: {
          not: params.id,
        },
      },
    });

    if (duplicatePelanggan) {
      throw new Error("Pelanggan dengan nama dan alamat yang sama sudah ada");
    }

    const updatedPelanggan = await prisma.pelanggan.update({
      where: { id: params.id },
      data: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
      },
      include: {
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
        barangKeluar: {
          include: {
            details: true,
          },
        },
      },
    });

    const barangKeluarIds = updatedPelanggan.barangKeluar.map((bk) => bk.id);
    const transaksiLunas = await prisma.transaksiKeluar.findMany({
      where: {
        barangKeluarId: {
          in: barangKeluarIds,
        },
        status: "LUNAS",
        admin: {
          jabatan: adminWithJabatan.jabatan,
        },
      },
    });

    const totalPembelian = updatedPelanggan.barangKeluar
      .filter((bk) => transaksiLunas.some((t) => t.barangKeluarId === bk.id))
      .reduce((sum, bk) => {
        const detailSum = bk.details.reduce(
          (detailSum, detail) => detailSum + detail.jmlPembelian,
          0
        );
        return sum + detailSum;
      }, 0);

    logActivity({
      adminId: params.adminId,
      aksi: "UPDATE",
      tabelTarget: "pelanggan",
      dataLama: JSON.stringify({
        id: existingPelanggan.id,
        nama: existingPelanggan.nama,
        alamat: existingPelanggan.alamat,
      }),
      dataBaru: JSON.stringify({
        id: updatedPelanggan.id,
        nama: updatedPelanggan.nama,
        alamat: updatedPelanggan.alamat,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Pelanggan berhasil diperbarui",
      data: {
        id: updatedPelanggan.id,
        nama: updatedPelanggan.nama,
        alamat: updatedPelanggan.alamat,
        adminId: updatedPelanggan.adminId,
        createdAt: updatedPelanggan.createdAt,
        updatedAt: updatedPelanggan.updatedAt,
        admin: updatedPelanggan.admin,
        totalPembelian,
      },
    };
  } catch (error) {
    console.error("Error updating pelanggan:", error);
    if (error instanceof z.ZodError) {
      throw new Error(`Validasi gagal: ${error.issues[0].message}`);
    }
    throw error;
  }
}

export async function deletePelanggan(
  params: DeletePelangganParams
): Promise<DeletePelangganResponse> {
  try {
    const existingPelanggan = await prisma.pelanggan.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        nama: true,
        alamat: true,
        barangKeluar: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingPelanggan) {
      throw new Error("Data pelanggan tidak ditemukan");
    }

    if (existingPelanggan.barangKeluar.length > 0) {
      throw new Error(
        "Tidak dapat menghapus pelanggan yang memiliki riwayat transaksi"
      );
    }

    await prisma.pelanggan.delete({
      where: { id: params.id },
    });

    logActivity({
      adminId: params.adminId,
      aksi: "DELETE",
      tabelTarget: "pelanggan",
      dataLama: JSON.stringify({
        id: existingPelanggan.id,
        nama: existingPelanggan.nama,
        alamat: existingPelanggan.alamat,
      }),
      ipAddress: params.ipAddress || "unknown",
      userAgent: params.userAgent || "unknown",
    });

    return {
      success: true,
      message: "Pelanggan berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting pelanggan:", error);
    throw error;
  }
}
