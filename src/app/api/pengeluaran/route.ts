import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/prisma";
import { pengeluaranSchema } from "@/lib/validations/pengeluaranValidator";
import { Jabatan } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filterBulan = searchParams.get("bulan");
    const filterTahun = searchParams.get("tahun");

    const skip = (page - 1) * limit;
    const where: any = {
      admin: {
        jabatan: jabatan as Jabatan,
      },
    };

    // Filter bulan dan tahun
    if (filterBulan && filterTahun) {
      const bulan = parseInt(filterBulan);
      const tahun = parseInt(filterTahun);
      const startDate = new Date(tahun, bulan - 1, 1);
      const endDate = new Date(tahun, bulan, 0, 23, 59, 59);

      where.tanggal = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [pengeluaran, total] = await Promise.all([
      prisma.pengeluaran.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tanggal: "desc" },
        include: {
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
    ]);

    // Hitung total pengeluaran untuk summary
    const totalPengeluaranAggregate = await prisma.pengeluaran.aggregate({
      where,
      _sum: {
        totalHarga: true,
      },
    });

    const summary = {
      totalPengeluaran: totalPengeluaranAggregate._sum.totalHarga || 0,
    };

    await prisma.logAktivitas.create({
      data: {
        adminId: parseInt(session.user.id),
        aksi: "READ",
        tabelTarget: "pengeluaran",
        dataBaru: JSON.stringify({
          count: pengeluaran.length,
          totalPengeluaran: summary.totalPengeluaran,
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
      data: pengeluaran,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
      jabatan,
    });
  } catch (error) {
    console.error("Error fetching pengeluaran:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat mengambil data pengeluaran" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - Silahkan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = pengeluaranSchema.parse(body);

    const pengeluaran = await prisma.pengeluaran.create({
      data: {
        adminId: parseInt(session.user.id),
        keterangan: validatedData.keterangan,
        jumlah: validatedData.jumlah,
        totalHarga: validatedData.totalHarga,
        tanggal: new Date(validatedData.tanggal),
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
        tabelTarget: "pengeluaran",
        dataBaru: JSON.stringify(pengeluaran),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        timestamp: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Pengeluaran berhasil ditambahkan",
        data: pengeluaran,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pengeluaran:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validasi gagal", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
