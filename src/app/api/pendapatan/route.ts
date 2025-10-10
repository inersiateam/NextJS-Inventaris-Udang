import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const { jabatan } = session.user;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "transaksi";
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (mode === "transaksi") {
      const skip = (page - 1) * limit;
      const where: any = {
        transaksiKeluar: {
          admin: {
            jabatan: jabatan,
          },
        },
      };

      if (bulan && tahun) {
        where.bulan = parseInt(bulan);
        where.tahun = parseInt(tahun);
      }

      const [pendapatan, total] = await Promise.all([
        prisma.pendapatan.findMany({
          where,
          skip,
          take: limit,
          orderBy: { tanggal: "desc" },
          include: {
            transaksiKeluar: {
              include: {
                barangKeluar: {
                  include: {
                    details: {
                      include: {
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
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.pendapatan.count({ where }),
      ]);

      const formattedData = pendapatan.map((item) => {
        const namaBarangList = item.transaksiKeluar.barangKeluar.details
          .map((d) => d.barang.nama)
          .join(", ");

        return {
          id: item.id,
          noInvoice: item.transaksiKeluar.barangKeluar.noInvoice || "-",
          tanggal: item.tanggal,
          bulan: item.bulan,
          tahun: item.tahun,
          namaBarang: namaBarangList || "-",
          namaPelanggan:
            item.transaksiKeluar.barangKeluar.pelanggan.nama || "-",
          labaBerjalan: item.transaksiKeluar.labaBerjalan,
          totalPengeluaran: item.totalPengeluaran,
          labaBersih: item.transaksiKeluar.labaBerjalan - item.totalPengeluaran,
          owner1: item.owner1,
          owner2: item.owner2,
          owner3: item.owner3,
          cv: item.cv,
          totalPembagian: item.owner1 + item.owner2 + item.owner3 + item.cv,
        };
      });

      await prisma.logAktivitas.create({
        data: {
          adminId: parseInt(session.user.id),
          aksi: "READ",
          tabelTarget: "pendapatan",
          dataBaru: JSON.stringify({
            mode: "transaksi",
            count: formattedData.length,
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        mode: "transaksi",
        data: formattedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    if (mode === "bulan") {
      if (!bulan || !tahun) {
        return NextResponse.json(
          { error: "Parameter bulan dan tahun wajib diisi untuk mode bulan" },
          { status: 400 }
        );
      }

      const bulanInt = parseInt(bulan);
      const tahunInt = parseInt(tahun);

      const pendapatanBulan = await prisma.pendapatan.findMany({
        where: {
          bulan: bulanInt,
          tahun: tahunInt,
          transaksiKeluar: {
            admin: {
              jabatan: jabatan as Jabatan,
            },
          },
        },
        include: {
          transaksiKeluar: {
            include: {
              barangKeluar: {
                include: {
                  details: {
                    include: {
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
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { tanggal: "asc" },
      });

      const startDate = new Date(tahunInt, bulanInt - 1, 1);
      const endDate = new Date(tahunInt, bulanInt, 0, 23, 59, 59);

      const totalPengeluaranBulan = await prisma.pengeluaran.aggregate({
        where: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
          admin: {
            jabatan: jabatan as Jabatan,
          },
        },
        _sum: {
          totalHarga: true,
        },
      });

      const totalPengeluaran = totalPengeluaranBulan._sum.totalHarga || 0;
      const totalLabaBerjalan = pendapatanBulan.reduce(
        (sum, item) => sum + item.transaksiKeluar.labaBerjalan,
        0
      );

      const totalLabaBersih = totalLabaBerjalan - totalPengeluaran;
      const totalOwner1 = Math.floor(totalLabaBersih * 0.3);
      const totalOwner2 = Math.floor(totalLabaBersih * 0.3);
      const totalOwner3 = Math.floor(totalLabaBersih * 0.3);
      const totalCV = Math.floor(totalLabaBersih * 0.1);

      const detailTransaksi = pendapatanBulan.map((item) => {
        const namaBarangList = item.transaksiKeluar.barangKeluar.details
          .map((d) => d.barang.nama)
          .join(", ");

        return {
          id: item.id,
          noInvoice: item.transaksiKeluar.barangKeluar.noInvoice || "-",
          tanggal: item.tanggal,
          namaBarang: namaBarangList || "-",
          namaPelanggan:
            item.transaksiKeluar.barangKeluar.pelanggan.nama || "-",
          labaBerjalan: item.transaksiKeluar.labaBerjalan,
          owner1: item.owner1,
          owner2: item.owner2,
          owner3: item.owner3,
          cv: item.cv,
        };
      });

      const summary = {
        bulan: bulanInt,
        tahun: tahunInt,
        namaBulan: new Date(tahunInt, bulanInt - 1).toLocaleString("id-ID", {
          month: "long",
        }),
        totalTransaksi: pendapatanBulan.length,
        totalLabaBerjalan,
        totalPengeluaran,
        totalLabaBersih,
        pembagian: {
          owner1: totalOwner1,
          owner2: totalOwner2,
          owner3: totalOwner3,
          cv: totalCV,
          total: totalOwner1 + totalOwner2 + totalOwner3 + totalCV,
        },
        detailTransaksi,
      };

      await prisma.logAktivitas.create({
        data: {
          adminId: parseInt(session.user.id),
          aksi: "READ",
          tabelTarget: "pendapatan",
          dataBaru: JSON.stringify({
            mode: "bulan",
            bulan: bulanInt,
            tahun: tahunInt,
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        mode: "bulan",
        data: summary,
      });
    }

    if (mode === "tahun") {
      if (!tahun) {
        return NextResponse.json(
          { error: "Parameter tahun wajib diisi untuk mode tahun" },
          { status: 400 }
        );
      }

      const tahunInt = parseInt(tahun);
      const dataPerBulan = [];
      let grandTotalOmset = 0;
      let grandTotalLabaBerjalan = 0;
      let grandTotalPengeluaran = 0;
      let grandTotalLabaBersih = 0;
      let grandTotalOwner1 = 0;
      let grandTotalOwner2 = 0;
      let grandTotalOwner3 = 0;
      let grandTotalCV = 0;
      let grandTotalAquaDifire = 0;
      let grandTotalAquaWater = 0;

      for (let bulanInt = 1; bulanInt <= 12; bulanInt++) {
        const pendapatanBulan = await prisma.pendapatan.findMany({
          where: {
            bulan: bulanInt,
            tahun: tahunInt,
            transaksiKeluar: {
              admin: {
                jabatan: jabatan as Jabatan,
              },
            },
          },
          include: {
            transaksiKeluar: {
              include: {
                barangKeluar: {
                  include: {
                    details: {
                      include: {
                        barang: {
                          select: {
                            nama: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        const startDate = new Date(tahunInt, bulanInt - 1, 1);
        const endDate = new Date(tahunInt, bulanInt, 0, 23, 59, 59);

        const totalPengeluaranBulan = await prisma.pengeluaran.aggregate({
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate,
            },
            admin: {
              jabatan: jabatan as Jabatan,
            },
          },
          _sum: {
            totalHarga: true,
          },
        });

        const totalPengeluaran = totalPengeluaranBulan._sum.totalHarga || 0;
        const barangKeluarIds = pendapatanBulan.map(
          (p) => p.transaksiKeluar.barangKeluarId
        );
        const barangKeluarList = await prisma.barangKeluar.findMany({
          where: {
            id: { in: barangKeluarIds },
          },
          select: {
            totalOmset: true,
          },
        });
        const totalOmset = barangKeluarList.reduce(
          (sum, bk) => sum + bk.totalOmset,
          0
        );

        const totalLabaBerjalan = pendapatanBulan.reduce(
          (sum, item) => sum + item.transaksiKeluar.labaBerjalan,
          0
        );

        const totalLabaBersih = totalLabaBerjalan - totalPengeluaran;
        const totalOwner1 = Math.floor(totalLabaBersih * 0.3);
        const totalOwner2 = Math.floor(totalLabaBersih * 0.3);
        const totalOwner3 = Math.floor(totalLabaBersih * 0.3);
        const totalCV = Math.floor(totalLabaBersih * 0.1);
        let aquaDifire = 0;
        let aquaWater = 0;

        pendapatanBulan.forEach((item) => {
          item.transaksiKeluar.barangKeluar.details.forEach((detail) => {
            const namaBarang = detail.barang.nama.toLowerCase();
            if (namaBarang.includes("difire")) {
              aquaDifire += detail.jmlPembelian;
            } else if (namaBarang.includes("water")) {
              aquaWater += detail.jmlPembelian;
            }
          });
        });

        grandTotalOmset += totalOmset;
        grandTotalLabaBerjalan += totalLabaBerjalan;
        grandTotalPengeluaran += totalPengeluaran;
        grandTotalLabaBersih += totalLabaBersih;
        grandTotalOwner1 += totalOwner1;
        grandTotalOwner2 += totalOwner2;
        grandTotalOwner3 += totalOwner3;
        grandTotalCV += totalCV;
        grandTotalAquaDifire += aquaDifire;
        grandTotalAquaWater += aquaWater;

        const namaBulan = new Date(tahunInt, bulanInt - 1).toLocaleString(
          "id-ID",
          {
            month: "long",
          }
        );

        dataPerBulan.push({
          no: bulanInt,
          bulan: namaBulan,
          omset: totalOmset,
          labaBerjalan: totalLabaBerjalan,
          pengeluaranGlobal: totalPengeluaran,
          labaBersih: totalLabaBersih,
          owner1: totalOwner1,
          owner2: totalOwner2,
          owner3: totalOwner3,
          cvABL: totalCV,
          barangKeluar: {
            aquaDifire,
            aquaWater,
          },
        });
      }

      const summary = {
        tahun: tahunInt,
        dataPerBulan,
        grandTotal: {
          omset: grandTotalOmset,
          labaBerjalan: grandTotalLabaBerjalan,
          pengeluaranGlobal: grandTotalPengeluaran,
          labaBersih: grandTotalLabaBersih,
          owner1: grandTotalOwner1,
          owner2: grandTotalOwner2,
          owner3: grandTotalOwner3,
          cvABL: grandTotalCV,
          barangKeluar: {
            aquaDifire: grandTotalAquaDifire,
            aquaWater: grandTotalAquaWater,
          },
        },
      };

      await prisma.logAktivitas.create({
        data: {
          adminId: parseInt(session.user.id),
          aksi: "READ",
          tabelTarget: "pendapatan",
          dataBaru: JSON.stringify({
            mode: "tahun",
            tahun: tahunInt,
          }),
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          timestamp: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        mode: "tahun",
        data: summary,
      });
    }

    return NextResponse.json(
      { error: "Mode tidak valid. Gunakan 'transaksi', 'bulan', atau 'tahun'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error fetching pendapatan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pendapatan" },
      { status: 500 }
    );
  }
}
