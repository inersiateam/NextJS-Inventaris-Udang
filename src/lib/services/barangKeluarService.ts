import prisma from "@/lib/prisma";
import {
  calculateJatuhTempo,
  generateNoInvoice,
} from "@/lib/helpers/globalHelper";
import {
  IBarangKeluarInput,
  IBarangKeluarResponse,
  IBarangKeluarFilter,
  IBarangKeluarListResponse,
} from "@/types/interfaces/IBarangKeluar";
import { Jabatan } from "@prisma/client";

export class BarangKeluarService {
  static async getBarangKeluar(
    adminId: number,
    jabatan: Jabatan,
    filters: IBarangKeluarFilter = {}
  ): Promise<IBarangKeluarListResponse> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      admin: {
        jabatan: jabatan,
      },
    };

    if (filters.bulan && filters.tahun) {
      const startDate = new Date(filters.tahun, filters.bulan - 1, 1);
      const endDate = new Date();

      where.tglKeluar = {
        gte: startDate,
        lte: endDate,
      };
    } else if (filters.tahun) {
      const startDate = new Date(filters.tahun, 0, 1);
      const endDate = new Date(filters.tahun, 11, 31, 23, 59, 59);

      where.tglKeluar = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (filters.status === "BELUM_LUNAS") {
      where.transaksiKeluar = {
        some: {
          status: "BELUM_LUNAS",
        },
      };
    } else if (filters.status === "LUNAS") {
      where.transaksiKeluar = {
        some: {
          status: "LUNAS",
        },
      };
    }

    const [barangKeluar, total] = await Promise.all([
      prisma.barangKeluar.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tglKeluar: "desc" },
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
          pelanggan: {
            select: {
              id: true,
              nama: true,
              alamat: true,
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
          transaksiKeluar: true,
        },
      }),
      prisma.barangKeluar.count({ where }),
    ]);

    const barangKeluarFormatted: IBarangKeluarResponse[] = barangKeluar.map(
      (item) => {
        const transaksi = item.transaksiKeluar[0];

        return {
          id: item.id,
          noInvoice: item.noInvoice,
          tglKeluar: item.tglKeluar,
          jatuhTempo: item.jatuhTempo,
          namaPelanggan: item.pelanggan.nama,
          alamatPelanggan: item.pelanggan.alamat,
          items: item.details.map((detail) => ({
            namaBarang: detail.barang.nama,
            jmlPembelian: detail.jmlPembelian,
            hargaJual: detail.hargaJual,
            subtotal: detail.subtotal,
          })),
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
  }

  static async createBarangKeluar(
    adminId: number,
    jabatan: Jabatan,
    data: IBarangKeluarInput
  ) {
    const barangIds = data.items.map((item) => item.barangId);
    const barangs = await prisma.barang.findMany({
      where: { id: { in: barangIds } },
    });

    if (barangs.length !== barangIds.length) {
      throw new Error("Ada barang yang tidak ditemukan");
    }

    for (const item of data.items) {
      const barang = barangs.find((b) => b.id === item.barangId);
      if (barang && barang.stok < item.jmlPembelian) {
        throw new Error(
          `Stok ${barang.nama} tidak mencukupi. Stok tersedia: ${barang.stok}`
        );
      }
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: data.pelangganId },
    });

    if (!pelanggan) {
      throw new Error("Pelanggan tidak ditemukan");
    }

    const tglKeluar = new Date(data.tglKeluar);
    const jatuhTempo = calculateJatuhTempo(tglKeluar);
    const noInvoice = await generateNoInvoice(tglKeluar, jabatan);

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
    const totalFee = (30000 + 10000) * totalQuantity;
    const totalBiayaKeluar = totalFee + data.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const bulan = tglKeluar.getMonth() + 1;
    const tahun = tglKeluar.getFullYear();

    const owner1 = Math.floor(labaBerjalan * 0.3);
    const owner2 = Math.floor(labaBerjalan * 0.3);
    const owner3 = Math.floor(labaBerjalan * 0.3);
    const cv = Math.floor(labaBerjalan * 0.1);

    const result = await prisma.$transaction(async (tx) => {
      const barangKeluar = await tx.barangKeluar.create({
        data: {
          pelangganId: data.pelangganId,
          adminId: adminId,
          noInvoice,
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
            data: {
              stok: {
                decrement: item.jmlPembelian,
              },
            },
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

      const pendapatan = await tx.pendapatan.create({
        data: {
          transaksiKeluarId: transaksiKeluar.id,
          bulan,
          tahun,
          owner1,
          owner2,
          owner3,
          cv,
          tanggal: tglKeluar,
        },
      });

      return { barangKeluar, transaksiKeluar, pendapatan };
    });

    return {
      success: true,
      message: "Barang keluar berhasil ditambahkan",
      data: result,
    };
  }

  static async updateBarangKeluar(
    id: number,
    adminId: number,
    jabatan: Jabatan,
    data: IBarangKeluarInput
  ) {
    const existing = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: {
          jabatan: jabatan,
        },
      },
      include: {
        details: true,
        transaksiKeluar: true,
      },
    });

    if (!existing) {
      throw new Error("Data barang keluar tidak ditemukan");
    }

    const barangIds = data.items.map((item) => item.barangId);
    const barangs = await prisma.barang.findMany({
      where: { id: { in: barangIds } },
    });

    if (barangs.length !== barangIds.length) {
      throw new Error("Ada barang yang tidak ditemukan");
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
          `Stok ${
            barang!.nama
          } tidak mencukupi. Stok tersedia: ${availableStok}`
        );
      }
    }

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id: data.pelangganId },
    });

    if (!pelanggan) {
      throw new Error("Pelanggan tidak ditemukan");
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
    const totalFee = (30000 + 10000) * totalQuantity;
    const totalBiayaKeluar = totalFee + data.ongkir;
    const labaBerjalan = labaKotor - totalBiayaKeluar;

    const bulan = tglKeluar.getMonth() + 1;
    const tahun = tglKeluar.getFullYear();
    const owner1 = Math.floor(labaBerjalan * 0.3);
    const owner2 = Math.floor(labaBerjalan * 0.3);
    const owner3 = Math.floor(labaBerjalan * 0.3);
    const cv = Math.floor(labaBerjalan * 0.1);

    const result = await prisma.$transaction(async (tx) => {
      await Promise.all(
        existing.details.map((detail) =>
          tx.barang.update({
            where: { id: detail.barangId },
            data: {
              stok: {
                increment: detail.jmlPembelian,
              },
            },
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
            data: {
              stok: {
                decrement: item.jmlPembelian,
              },
            },
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

      await tx.pendapatan.updateMany({
        where: { transaksiKeluarId: transaksi.id },
        data: {
          bulan,
          tahun,
          owner1,
          owner2,
          owner3,
          cv,
          tanggal: tglKeluar,
        },
      });

      return { barangKeluar, transaksiKeluar };
    });

    return {
      success: true,
      message: "Barang keluar berhasil diperbarui",
      data: result,
    };
  }

  static async getBarangKeluarById(id: number, jabatan: Jabatan) {
    const barangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: {
          jabatan: jabatan,
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
        pelanggan: {
          select: {
            id: true,
            nama: true,
            alamat: true,
          },
        },
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
        transaksiKeluar: true,
      },
    });

    if (!barangKeluar) {
      throw new Error("Data barang keluar tidak ditemukan");
    }

    const transaksi = barangKeluar.transaksiKeluar[0];

    return {
      id: barangKeluar.id,
      noInvoice: barangKeluar.noInvoice,
      tglKeluar: barangKeluar.tglKeluar,
      jatuhTempo: barangKeluar.jatuhTempo,
      namaPelanggan: barangKeluar.pelanggan.nama,
      alamatPelanggan: barangKeluar.pelanggan.alamat,
      items: barangKeluar.details.map((detail) => ({
        namaBarang: detail.barang.nama,
        jmlPembelian: detail.jmlPembelian,
        hargaJual: detail.hargaJual,
        subtotal: detail.subtotal,
      })),
      totalOmset: barangKeluar.totalOmset,
      totalModal: barangKeluar.totalModal,
      labaKotor: barangKeluar.labaKotor,
      totalFee: transaksi?.totalFee || 0,
      ongkir: transaksi?.ongkir || 0,
      totalBiayaKeluar: transaksi?.totalBiayaKeluar || 0,
      labaBerjalan: transaksi?.labaBerjalan || 0,
      status: transaksi?.status || "BELUM_LUNAS",
    };
  }

  static async getBarangKeluarByIdForEdit(id: number, jabatan: Jabatan) {
    const barangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: {
          jabatan: jabatan,
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
        pelanggan: {
          select: {
            id: true,
            nama: true,
            alamat: true,
          },
        },
        transaksiKeluar: true,
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
      namaPelanggan: barangKeluar.pelanggan.nama,
      alamatPelanggan: barangKeluar.pelanggan.alamat,
      ongkir: transaksi?.ongkir || 0,
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
  }

  static async updateStatus(
    id: number,
    status: "LUNAS" | "BELUM_LUNAS",
    jabatan: Jabatan
  ) {
    const barangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: {
          jabatan: jabatan,
        },
      },
      include: {
        transaksiKeluar: true,
      },
    });

    if (!barangKeluar) {
      throw new Error("Data barang keluar tidak ditemukan");
    }

    const transaksi = barangKeluar.transaksiKeluar[0];
    if (!transaksi) {
      throw new Error("Transaksi tidak ditemukan");
    }

    const updated = await prisma.transaksiKeluar.update({
      where: { id: transaksi.id },
      data: { status },
    });

    return {
      success: true,
      message: "Status berhasil diupdate",
      data: updated,
    };
  }

  static async deleteBarangKeluar(id: number, jabatan: Jabatan) {
    const barangKeluar = await prisma.barangKeluar.findFirst({
      where: {
        id,
        admin: {
          jabatan: jabatan,
        },
      },
      include: {
        details: true,
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
            data: {
              stok: {
                increment: detail.jmlPembelian,
              },
            },
          })
        )
      );

      await tx.pendapatan.deleteMany({
        where: {
          transaksiKeluar: {
            barangKeluarId: id,
          },
        },
      });

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

    return {
      success: true,
      message: "Barang keluar berhasil dihapus",
    };
  }
}
