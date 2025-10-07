import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { pelangganSchema } from "@/lib/validations/pelangganValidator";
import { Jabatan } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const top = searchParams.get("top");

    if (top === "5") {
      const topPelanggan = await prisma.pelanggan.findMany({
        where: {
          admin: {
            jabatan: session.user.jabatan as Jabatan,
          },
        },
        include: {
          barangKeluar: {
            where: {
              admin: {
                jabatan: session.user.jabatan as Jabatan,
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
                jabatan: session.user.jabatan as Jabatan,
              },
            },
          });

          // Hitung total pembelian dari semua details
          const totalPembelian = pelanggan.barangKeluar
            .filter((bk) =>
              transaksiLunas.some((t) => t.barangKeluarId === bk.id)
            )
            .reduce((sum, bk) => {
              // Sum semua jmlPembelian dari details
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

      return NextResponse.json({
        success: true,
        data: top5,
      });
    }

    const pelanggan = await prisma.pelanggan.findMany({
      where: {
        admin: {
          jabatan: session.user.jabatan as Jabatan,
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
              jabatan: session.user.jabatan as Jabatan,
            },
          },
          include: {
            details: true, // Include details untuk hitung total pembelian
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
              jabatan: session.user.jabatan as Jabatan,
            },
          },
        });

        // Hitung total pembelian dari semua details
        const totalPembelian = p.barangKeluar
          .filter((bk) =>
            transaksiLunas.some((t) => t.barangKeluarId === bk.id)
          )
          .reduce((sum, bk) => {
            // Sum semua jmlPembelian dari details
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

    return NextResponse.json({
      success: true,
      data: pelangganWithTotalPembelian,
      jabatan: session.user.jabatan,
    });
  } catch (error) {
    console.error("GET pelanggan error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat mengambil data pelanggan",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validatedData = pelangganSchema.parse(body);
    console.log(session.user.jabatan);
    const existingPelanggan = await prisma.pelanggan.findFirst({
      where: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
        admin: {
          jabatan: session.user.jabatan as Jabatan,
        },
      },
    });

    if (existingPelanggan) {
      return NextResponse.json(
        {
          success: false,
          message: "Pelanggan dengan nama dan alamat yang sama sudah ada",
        },
        { status: 400 }
      );
    }

    const pelanggan = await prisma.pelanggan.create({
      data: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
        adminId: parseInt(session.user.id),
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

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "CREATE",
        tabelTarget: "pelanggan",
        dataBaru: JSON.stringify(pelanggan),
        ipAddress:
          req.headers.get("x-forwarded-for") ||
          req.headers.get("x-real-ip") ||
          "unknown",
        userAgent: req.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pelanggan berhasil ditambahkan",
        data: pelanggan,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST pelanggan error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validasi gagal",
          errors: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menambahkan pelanggan",
      },
      { status: 500 }
    );
  }
}
