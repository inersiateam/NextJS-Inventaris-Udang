import prisma from "../prisma";
import { Jabatan } from "@prisma/client";
import { pengeluaranSchema } from "../validations/pengeluaranValidator";
import {
  IPengeluaran,
  IPengeluaranInput,
  IPengeluaranQuery,
  IPengeluaranResponse,
  IPengeluaranCreateResponse,
} from "@/types/interfaces/IPengeluaran";

export class PengeluaranService {
  async getPengeluaran(
    adminId: number,
    jabatan: Jabatan,
    query: IPengeluaranQuery,
    ipAddress: string,
    userAgent: string
  ): Promise<IPengeluaranResponse> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const filterBulan = query.bulan;
    const filterTahun = query.tahun;

    const skip = (page - 1) * limit;
    const where: any = {
      admin: {
        jabatan: jabatan,
      },
    };

    // Optimize date filtering
    if (filterBulan && filterTahun) {
      const bulan = parseInt(filterBulan);
      const tahun = parseInt(filterTahun);
      const startDate = new Date(tahun, bulan - 1, 1);
      const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

      where.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [pengeluaran, total, totalPengeluaranAggregate] = await Promise.all([
      prisma.pengeluaran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: "desc" },
        select: {
          id: true,
          adminId: true,
          keterangan: true,
          jumlah: true,
          totalHarga: true,
          tanggal: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
        },
      }),
      prisma.pengeluaran.count({ where }),
      prisma.pengeluaran.aggregate({
        where,
        _sum: {
          totalHarga: true,
        },
      }),
    ]);

    const summary = {
      totalPengeluaran: totalPengeluaranAggregate._sum.totalHarga || 0,
    };

    prisma.logAktivitas
      .create({
        data: {
          adminId: adminId,
          aksi: "READ",
          tabelTarget: "pengeluaran",
          dataBaru: JSON.stringify({
            count: pengeluaran.length,
            totalPengeluaran: summary.totalPengeluaran,
          }),
          ipAddress: ipAddress,
          userAgent: userAgent,
          timestamp: new Date(),
        },
      })
      .catch((error) => {
        console.error("Failed to log activity:", error);
      });

    return {
      success: true,
      data: pengeluaran as IPengeluaran[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
      jabatan,
    };
  }

  async createPengeluaran(
    adminId: number,
    data: IPengeluaranInput,
    ipAddress: string,
    userAgent: string
  ): Promise<IPengeluaranCreateResponse> {
    const validatedData = pengeluaranSchema.parse(data);

    const pengeluaran = await prisma.pengeluaran.create({
      data: {
        adminId: adminId,
        keterangan: validatedData.keterangan,
        jumlah: validatedData.jumlah,
        totalHarga: validatedData.totalHarga,
        tanggal: new Date(validatedData.tanggal),
      },
      select: {
        id: true,
        adminId: true,
        keterangan: true,
        jumlah: true,
        totalHarga: true,
        tanggal: true,
        createdAt: true,
        admin: {
          select: {
            id: true,
            username: true,
            jabatan: true,
          },
        },
      },
    });

    prisma.logAktivitas
      .create({
        data: {
          adminId: adminId,
          aksi: "CREATE",
          tabelTarget: "pengeluaran",
          dataBaru: JSON.stringify(pengeluaran),
          ipAddress: ipAddress,
          userAgent: userAgent,
          timestamp: new Date(),
        },
      })
      .catch((error) => {
        console.error("Failed to log activity:", error);
      });

    return {
      success: true,
      message: "Pengeluaran berhasil ditambahkan",
      data: pengeluaran as IPengeluaran,
    };
  }

  async updatePengeluaran(
    id: number,
    adminId: number,
    data: IPengeluaranInput,
    ipAddress: string,
    userAgent: string
  ): Promise<IPengeluaranCreateResponse> {
    const validatedData = pengeluaranSchema.parse(data);

    const [existingPengeluaran, pengeluaran] = await prisma.$transaction([
      prisma.pengeluaran.findUniqueOrThrow({
        where: { id },
        select: {
          id: true,
          adminId: true,
          keterangan: true,
          jumlah: true,
          totalHarga: true,
          tanggal: true,
        },
      }),
      prisma.pengeluaran.update({
        where: { id },
        data: {
          keterangan: validatedData.keterangan,
          jumlah: validatedData.jumlah,
          totalHarga: validatedData.totalHarga,
          tanggal: new Date(validatedData.tanggal),
        },
        select: {
          id: true,
          adminId: true,
          keterangan: true,
          jumlah: true,
          totalHarga: true,
          tanggal: true,
          createdAt: true,
          admin: {
            select: {
              id: true,
              username: true,
              jabatan: true,
            },
          },
        },
      }),
    ]);

    prisma.logAktivitas
      .create({
        data: {
          adminId: adminId,
          aksi: "UPDATE",
          tabelTarget: "pengeluaran",
          dataLama: JSON.stringify(existingPengeluaran),
          dataBaru: JSON.stringify(pengeluaran),
          ipAddress: ipAddress,
          userAgent: userAgent,
          timestamp: new Date(),
        },
      })
      .catch((error) => {
        console.error("Failed to log activity:", error);
      });

    return {
      success: true,
      message: "Pengeluaran berhasil diperbarui",
      data: pengeluaran as IPengeluaran,
    };
  }

  async deletePengeluaran(
    id: number,
    adminId: number,
    ipAddress: string,
    userAgent: string
  ): Promise<{ success: boolean; message: string }> {
    const [existingPengeluaran] = await prisma.$transaction([
      prisma.pengeluaran.findUniqueOrThrow({
        where: { id },
      }),
      prisma.pengeluaran.delete({
        where: { id },
      }),
    ]);

    prisma.logAktivitas
      .create({
        data: {
          adminId: adminId,
          aksi: "DELETE",
          tabelTarget: "pengeluaran",
          dataLama: JSON.stringify(existingPengeluaran),
          ipAddress: ipAddress,
          userAgent: userAgent,
          timestamp: new Date(),
        },
      })
      .catch((error) => {
        console.error("Failed to log activity:", error);
      });

    return {
      success: true,
      message: "Pengeluaran berhasil dihapus",
    };
  }
}

export const pengeluaranService = new PengeluaranService();
