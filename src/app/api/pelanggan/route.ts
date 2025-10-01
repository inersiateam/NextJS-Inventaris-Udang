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
            include: {
              admin: true,
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
            },
          });

          const totalPembelian = pelanggan.barangKeluar
            .filter((bk) =>
              transaksiLunas.some((t) => t.barangKeluarId === bk.id)
            )
            .reduce((sum, bk) => sum + bk.jmlPembelian, 0);

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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: pelanggan,
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
    const existingPelanggan = await prisma.pelanggan.findFirst({
      where: {
        nama: validatedData.nama,
        alamat: validatedData.alamat,
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
