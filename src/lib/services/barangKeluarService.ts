import { cache } from "react";
import prisma from "@/lib/prisma";
import {
  calculateJatuhTempo,
  generateNoInvoice,
  generateNoSuratJalan,
  getDateRange,
} from "@/lib/helpers/globalHelper";
import {
  IBarangKeluarResponse,
  IBarangKeluarFilter,
  IBarangKeluarListResponse,
  CreateBarangKeluarParams,
  UpdateBarangKeluarParams,
  DeleteBarangKeluarParams,
} from "@/types/interfaces/IBarangKeluar";
import { Jabatan } from "@prisma/client";
import { logActivity } from "../fileLogger";

const BARANG_KELUAR_SELECT = {
  id: true,
  noInvoice: true,
  noSuratJalan: true,
  noPo: true,
  tglKeluar: true,
  jatuhTempo: true,
  totalOmset: true,
  totalModal: true,
  labaKotor: true,
  details: {
    select: {
      jmlPembelian: true,
      hargaJual: true,
      subtotal: true,
      barang: {
        select: {
          nama: true,
          harga: true,
          satuan: true,
        },
      },
    },
  },
  pelanggan: {
    select: {
      nama: true,
      alamat: true,
    },
  },
  transaksiKeluar: {
    select: {
      totalFee: true,
      ongkir: true,
      totalBiayaKeluar: true,
      labaBerjalan: true,
      status: true,
    },
  },
} as const;

export const getBarangKeluarWithPagination = cache(
  async (
    jabatan: Jabatan,
    filters: IBarangKeluarFilter = {}
  ): Promise<IBarangKeluarListResponse> => {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {
        admin: { jabatan },
      };

      if (filters.filterBulan && filters.filterBulan > 0) {
        const { startDate, endDate } = getDateRange(filters.filterBulan);
        where.tglKeluar = { gte: startDate, lte: endDate };
      }

      if (filters.status === "BELUM_LUNAS" || filters.status === "LUNAS") {
        where.transaksiKeluar = {
          some: { status: filters.status },
        };
      }

      const [barangKeluar, total] = await Promise.all([
        prisma.barangKeluar.findMany({
          where,
          skip,
          take: limit,
          orderBy: { noInvoice: "desc" },
          select: BARANG_KELUAR_SELECT,
        }),
        prisma.barangKeluar.count({ where }),
      ]);

      const barangKeluarFormatted: IBarangKeluarResponse[] = barangKeluar.map(
        (item) => {
          const transaksi = item.transaksiKeluar[0];

          return {
            id: item.id,
            noInvoice: item.noInvoice,
            noSuratJalan: item.noSuratJalan,
            tglKeluar: item.tglKeluar,
            jatuhTempo: item.jatuhTempo,
            namaPelanggan: item.pelanggan.nama,
            alamatPelanggan: item.pelanggan.alamat,
            items: item.details.map((detail) => {
              const hargaModal = detail.barang.harga || 0;
              const subtotalModal = hargaModal * detail.jmlPembelian;
              return {
                namaBarang: detail.barang.nama,
                jmlPembelian: detail.jmlPembelian,
                hargaJual: detail.hargaJual,
                subtotal: detail.subtotal,
                subtotalModal: subtotalModal,
                satuan: detail.barang.satuan,
              };
            }),
            totalOmset: item.totalOmset,
            totalModal: item.totalModal,
            labaKotor: item.labaKotor,
            totalFee: transaksi?.totalFee || 0,
            ongkir: transaksi?.ongkir || 0,
            totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
            labaBerjalan: transaksi?.labaBerjalan || 0,
            status: transaksi?.status || "BELUM_LUNAS",
          };
        }
      );

      return {
        success: true,
        data: barangKeluarFormatted,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        jabatan,
      };
    } catch (error) {
      console.error("Error fetching barang keluar:", error);
      throw new Error("Terjadi kesalahan saat mengambil data barang keluar");
    }
  }
);

export const getBarangList = cache(async (jabatan: Jabatan) => {
  try {
    return prisma.barang.findMany({
      where: {
        admin: { jabatan },
        stok: { gt: 0 },
      },
      select: {
        id: true,
        nama: true,
        harga: true,
        stok: true,
        satuan: true,
      },
      orderBy: { nama: "desc" },
    });
  } catch (error) {
    console.error("Error fetching barang list:", error);
    throw new Error("Terjadi kesalahan saat mengambil data barang");
  }
});

export const getPelangganList = cache(async (jabatan: Jabatan) => {
  try {
    return prisma.pelanggan.findMany({
      where: {
        admin: { jabatan },
      },
      select: {
        id: true,
        nama: true,
        alamat: true,
      },
      orderBy: { nama: "desc" },
    });
  } catch (error) {
    console.error("Error fetching pelanggan list:", error);
    throw new Error("Terjadi kesalahan saat mengambil data pelanggan");
  }
});

export const getBarangKeluarById = cache(
  async (id: number, jabatan: Jabatan) => {
    try {
      const barangKeluar = await prisma.barangKeluar.findFirst({
        where: {
          id,
          admin: { jabatan },
        },
        select: BARANG_KELUAR_SELECT,
      });

      if (!barangKeluar) {
        throw new Error("Data barang keluar tidak ditemukan");
      }

      const transaksi = barangKeluar.transaksiKeluar[0];

      return {
        id: barangKeluar.id,
        noInvoice: barangKeluar.noInvoice,
        noPo: barangKeluar.noPo,
        noSuratJalan: barangKeluar.noSuratJalan,
        tglKeluar: barangKeluar.tglKeluar,
        jatuhTempo: barangKeluar.jatuhTempo,
        namaPelanggan: barangKeluar.pelanggan.nama,
        alamatPelanggan: barangKeluar.pelanggan.alamat,
        items: barangKeluar.details.map((detail) => {
          const hargaModal = detail.barang.harga || 0;
          const subtotalModal = hargaModal * detail.jmlPembelian;
          return {
            namaBarang: detail.barang.nama,
            jmlPembelian: detail.jmlPembelian,
            hargaJual: detail.hargaJual,
            subtotal: detail.subtotal,
            subtotalModal: subtotalModal,
            satuan: detail.barang.satuan,
          };
        }),
        totalOmset: barangKeluar.totalOmset,
        totalModal: barangKeluar.totalModal,
        labaKotor: barangKeluar.labaKotor,
        totalFee: transaksi?.totalFee || 0,
        ongkir: transaksi?.ongkir || 0,
        totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
        labaBerjalan: transaksi?.labaBerjalan || 0,
        status: transaksi?.status || "BELUM_LUNAS",
      };
    } catch (error) {
      console.error("Error fetching barang keluar detail:", error);
      throw error;
    }
  }
);

export const getBarangKeluarByIdForEdit = cache(
  async (id: number, jabatan: Jabatan) => {
    try {
      const barangKeluar = await prisma.barangKeluar.findFirst({
        where: {
          id,
          admin: { jabatan },
        },
        select: {
          id: true,
          pelangganId: true,
          tglKeluar: true,
          jatuhTempo: true,
          noInvoice: true,
          noSuratJalan: true,
          noPo: true,
          totalOmset: true,
          totalModal: true,
          labaKotor: true,
          details: {
            select: {
              barangId: true,
              jmlPembelian: true,
              hargaJual: true,
              subtotal: true,
              barang: {
                select: {
                  nama: true,
                },
              },
            },
          },
          pelanggan: {
            select: {
              nama: true,
              alamat: true,
            },
          },
          transaksiKeluar: {
            select: {
              ongkir: true,
              status: true,
              totalFee: true,
              totalBiayaKeluar: true,
              labaBerjalan: true,
            },
          },
        },
      });

      if (!barangKeluar) {
        throw new Error("Data barang keluar tidak ditemukan");
      }

      const transaksi = barangKeluar.transaksiKeluar[0];

      return {
        id: barangKeluar.id,
        pelangganId: barangKeluar.pelangganId,
        tglKeluar: barangKeluar.tglKeluar,
        jatuhTempo: barangKeluar.jatuhTempo,
        noInvoice: barangKeluar.noInvoice,
        noSuratJalan: barangKeluar.noSuratJalan,
        noPo: barangKeluar.noPo,
        namaPelanggan: barangKeluar.pelanggan.nama,
        alamatPelanggan: barangKeluar.pelanggan.alamat,
        ongkir: transaksi?.ongkir || 0,
        feeTeknisi: transaksi?.totalFee || 0,
        status: transaksi?.status || "BELUM_LUNAS",
        items: barangKeluar.details.map((detail) => ({
          barangId: detail.barangId,
          namaBarang: detail.barang.nama,
          jmlPembelian: detail.jmlPembelian,
          hargaJual: detail.hargaJual,
          subtotal: detail.subtotal,
        })),
        totalOmset: barangKeluar.totalOmset,
        totalModal: barangKeluar.totalModal,
        labaKotor: barangKeluar.labaKotor,
        totalFee: transaksi?.totalFee || 0,
        totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
        labaBerjalan: transaksi?.labaBerjalan || 0,
      };
    } catch (error) {
      console.error("Error fetching barang keluar for edit:", error);
      throw error;
    }
  }
);

export async function createBarangKeluar(params: CreateBarangKeluarParams) {
  try {
    const { adminId, jabatan, data, ipAddress, userAgent } = params;
    const barangIds = data.items.map((item) => item.barangId);

    const [barangs, pelanggan] = await Promise.all([
      prisma.barang.findMany({
        where: { id: { in: barangIds } },
        select: { id: true, nama: true, harga: true, stok: true, satuan: true },
      }),
      prisma.pelanggan.findUnique({
        where: { id: data.pelangganId },
        select: { id: true, nama: true },
      }),
    ]);

    if (barangs.length !== barangIds.length) {
      throw new Error("Ada barang yang tidak ditemukan");
    }

    if (!pelanggan) {
      throw new Error("Pelanggan tidak ditemukan");
    }

    for (const item of data.items) {
      const barang = barangs.find((b) => b.id === item.barangId);
      if (barang && barang.stok < item.jmlPembelian) {
        throw new Error(
          `Stok ${barang.nama} tidak mencukupi. Stok tersedia: ${barang.stok}`
        );
      }
    }

    const tglKeluar = new Date(data.tglKeluar);
    const jatuhTempo = calculateJatuhTempo(tglKeluar);
    const noInvoice = await generateNoInvoice(tglKeluar, jabatan, data.noPo);
    const noSuratJalan = await generateNoSuratJalan(tglKeluar, jabatan);

    let totalOmset = 0;
    let totalModal = 0;
    const detailsData = data.items.map((item) => {
      const barang = barangs.find((b) => b.id === item.barangId)!;
      const subtotal = item.hargaJual * item.jmlPembelian;
      const modalPerItem = barang.harga * item.jmlPembelian;

      totalOmset += subtotal;
      totalModal += modalPerItem;

      return {
        barangId: item.barangId,
        jmlPembelian: item.jmlPembelian,
        hargaJual: item.hargaJual,
        subtotal,
      };
    });

    const labaKotor = totalOmset - totalModal;
    const totalQuantity = data.items.reduce(
      (sum, item) => sum + item.jmlPembelian,
      0
    );

    const totalFee = data.feeTeknisi * totalQuantity;
    const totalBiayaKeluar = totalFee + data.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const result = await prisma.$transaction(async (tx) => {
      const barangKeluar = await tx.barangKeluar.create({
        data: {
          pelangganId: data.pelangganId,
          adminId: adminId,
          noInvoice,
          noSuratJalan,
          noPo: data.noPo || null,
          totalOmset,
          totalModal,
          labaKotor,
          tglKeluar,
          jatuhTempo,
        },
      });

      await tx.barangKeluarDetail.createMany({
        data: detailsData.map((detail) => ({
          barangKeluarId: barangKeluar.id,
          ...detail,
        })),
      });

      await Promise.all(
        data.items.map((item) =>
          tx.barang.update({
            where: { id: item.barangId },
            data: { stok: { decrement: item.jmlPembelian } },
          })
        )
      );

      const transaksiKeluar = await tx.transaksiKeluar.create({
        data: {
          barangKeluarId: barangKeluar.id,
          adminId: adminId,
          totalFee,
          ongkir: data.ongkir,
          totalBiayaKeluar,
          labaBerjalan,
          status: data.status || "BELUM_LUNAS",
        },
      });

      return { barangKeluar, transaksiKeluar };
    });

    logActivity({
      adminId,
      aksi: "CREATE",
      tabelTarget: "barang_keluar",
      dataBaru: JSON.stringify({
        id: result.barangKeluar.id,
        noInvoice: result.barangKeluar.noInvoice,
        noSuratJalan: result.barangKeluar.noSuratJalan,
        noPo: result.barangKeluar.noPo,
        pelangganId: data.pelangganId,
        totalOmset: result.barangKeluar.totalOmset,
        totalModal: result.barangKeluar.totalModal,
        labaKotor: result.barangKeluar.labaKotor,
      }),
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang keluar berhasil ditambahkan",
      data: result,
    };
  } catch (error) {
    console.error("Error creating barang keluar:", error);
    throw error;
  }
}

export async function updateBarangKeluar(params: UpdateBarangKeluarParams) {
  try {
    const { id, adminId, jabatan, data, ipAddress, userAgent } = params;
    const barangIds = data.items.map((item) => item.barangId);

    const [existing, barangs, pelanggan] = await Promise.all([
      prisma.barangKeluar.findFirst({
        where: {
          id,
          admin: { jabatan },
        },
        include: {
          details: { select: { barangId: true, jmlPembelian: true } },
          transaksiKeluar: { select: { id: true } },
        },
      }),
      prisma.barang.findMany({
        where: { id: { in: barangIds } },
        select: { id: true, nama: true, harga: true, stok: true, satuan: true },
      }),
      prisma.pelanggan.findUnique({
        where: { id: data.pelangganId },
        select: { id: true },
      }),
    ]);

    if (!existing) {
      throw new Error("Data barang keluar tidak ditemukan");
    }

    if (barangs.length !== barangIds.length) {
      throw new Error("Ada barang yang tidak ditemukan");
    }

    if (!pelanggan) {
      throw new Error("Pelanggan tidak ditemukan");
    }

    for (const item of data.items) {
      const barang = barangs.find((b) => b.id === item.barangId);
      const oldDetail = existing.details.find(
        (d) => d.barangId === item.barangId
      );
      const oldQty = oldDetail?.jmlPembelian || 0;
      const availableStok = barang!.stok + oldQty;

      if (availableStok < item.jmlPembelian) {
        throw new Error(
          `Stok ${barang!.nama} tidak mencukupi. Stok tersedia: ${availableStok}`
        );
      }
    }

    const tglKeluar = new Date(data.tglKeluar);
    const jatuhTempo = calculateJatuhTempo(tglKeluar);

    let totalOmset = 0;
    let totalModal = 0;
    const detailsData = data.items.map((item) => {
      const barang = barangs.find((b) => b.id === item.barangId)!;
      const subtotal = item.hargaJual * item.jmlPembelian;
      const modalPerItem = barang.harga * item.jmlPembelian;

      totalOmset += subtotal;
      totalModal += modalPerItem;

      return {
        barangId: item.barangId,
        jmlPembelian: item.jmlPembelian,
        hargaJual: item.hargaJual,
        subtotal,
      };
    });

    const labaKotor = totalOmset - totalModal;
    const totalQuantity = data.items.reduce(
      (sum, item) => sum + item.jmlPembelian,
      0
    );
    
    const totalFee = data.feeTeknisi * totalQuantity;
    const totalBiayaKeluar = totalFee + data.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const result = await prisma.$transaction(async (tx) => {
      await Promise.all(
        existing.details.map((detail) =>
          tx.barang.update({
            where: { id: detail.barangId },
            data: { stok: { increment: detail.jmlPembelian } },
          })
        )
      );

      await tx.barangKeluarDetail.deleteMany({
        where: { barangKeluarId: id },
      });

      const barangKeluar = await tx.barangKeluar.update({
        where: { id },
        data: {
          pelangganId: data.pelangganId,
          noPo: data.noPo || null,
          totalOmset,
          totalModal,
          labaKotor,
          tglKeluar,
          jatuhTempo,
        },
      });

      await tx.barangKeluarDetail.createMany({
        data: detailsData.map((detail) => ({
          barangKeluarId: id,
          ...detail,
        })),
      });

      await Promise.all(
        data.items.map((item) =>
          tx.barang.update({
            where: { id: item.barangId },
            data: { stok: { decrement: item.jmlPembelian } },
          })
        )
      );

      const transaksi = existing.transaksiKeluar[0];
      const transaksiKeluar = await tx.transaksiKeluar.update({
        where: { id: transaksi.id },
        data: {
          totalFee,
          ongkir: data.ongkir,
          totalBiayaKeluar,
          labaBerjalan,
          status: data.status || "BELUM_LUNAS",
        },
      });

      return { barangKeluar, transaksiKeluar };
    });

    logActivity({
      adminId,
      aksi: "UPDATE",
      tabelTarget: "barang_keluar",
      dataLama: JSON.stringify({
        id: existing.id,
        totalOmset: existing.totalOmset,
        totalModal: existing.totalModal,
      }),
      dataBaru: JSON.stringify({
        id: result.barangKeluar.id,
        noPo: result.barangKeluar.noPo,
        totalOmset: result.barangKeluar.totalOmset,
        totalModal: result.barangKeluar.totalModal,
        labaKotor: result.barangKeluar.labaKotor,
      }),
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang keluar berhasil diperbarui",
      data: result,
    };
  } catch (error) {
    console.error("Error updating barang keluar:", error);
    throw error;
  }
}

export async function deleteBarangKeluar(params: DeleteBarangKeluarParams) {
  try {
    const { id, jabatan, adminId, ipAddress, userAgent } = params;

    const barangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: { jabatan },
      },
      select: {
        id: true,
        noInvoice: true,
        totalOmset: true,
        details: {
          select: {
            barangId: true,
            jmlPembelian: true,
          },
        },
      },
    });

    if (!barangKeluar) {
      throw new Error("Data barang keluar tidak ditemukan");
    }

    await prisma.$transaction(async (tx) => {
      await Promise.all(
        barangKeluar.details.map((detail) =>
          tx.barang.update({
            where: { id: detail.barangId },
            data: { stok: { increment: detail.jmlPembelian } },
          })
        )
      );

      await tx.transaksiKeluar.deleteMany({
        where: { barangKeluarId: id },
      });

      await tx.barangKeluarDetail.deleteMany({
        where: { barangKeluarId: id },
      });

      await tx.barangKeluar.delete({
        where: { id },
      });
    });

    logActivity({
      adminId,
      aksi: "DELETE",
      tabelTarget: "barang_keluar",
      dataLama: JSON.stringify({
        id: barangKeluar.id,
        noInvoice: barangKeluar.noInvoice,
        totalOmset: barangKeluar.totalOmset,
      }),
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
    });

    return {
      success: true,
      message: "Barang keluar berhasil dihapus",
    };
  } catch (error) {
    console.error("Error deleting barang keluar:", error);
    throw error;
  }
}
