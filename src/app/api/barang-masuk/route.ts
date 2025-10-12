// import { authOptions } from "@/lib/authOptions";
// import { calculateJatuhTempo } from "@/lib/helpers/globalHelper";
// import prisma from "@/lib/prisma";
// import { barangMasukSchema } from "@/lib/validations/barangMasukValidator";
// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";
// import z from "zod";

// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { error: "Unauthorized - Silakan login terlebih dahulu" },
//         { status: 401 }
//       );
//     }

//     const { jabatan } = session.user;
//     const { searchParams } = new URL(request.url);
//     const page = parseInt(searchParams.get("page") || "1");
//     const limit = parseInt(searchParams.get("limit") || "10");
//     const filterBulan = searchParams.get("filterBulan") || "1";
//     const statusFilter = searchParams.get("status");

//     const skip = (page - 1) * limit;
//     const where: any = {
//       admin: {
//         jabatan: jabatan,
//       },
//     };

//     const bulan = parseInt(filterBulan);
//     const now = new Date();
//     const startDate = new Date(now);

//     if (bulan === 1) {
//       startDate.setMonth(now.getMonth() - 1);
//     } else if (bulan === 3) {
//       startDate.setMonth(now.getMonth() - 3);
//     } else if (bulan === 6) {
//       startDate.setMonth(now.getMonth() - 6);
//     } else if (bulan === 12) {
//       startDate.setFullYear(now.getFullYear() - 1);
//     }

//     where.tglMasuk = {
//       gte: startDate,
//       lte: now,
//     };

//     if (statusFilter === "BELUM_LUNAS") {
//       where.status = "BELUM_LUNAS";
//     }

//     const [barangMasuk, total] = await Promise.all([
//       prisma.barangMasuk.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { tglMasuk: "desc" },
//         include: {
//           barang: {
//             select: {
//               id: true,
//               nama: true,
//               harga: true,
//               stok: true,
//             },
//           },
//           admin: {
//             select: {
//               id: true,
//               username: true,
//               jabatan: true,
//             },
//           },
//         },
//       }),
//       prisma.barangMasuk.count({ where }),
//     ]);

//     await prisma.logAktivitas.create({
//       data: {
//         adminId: parseInt(session.user.id),
//         aksi: "READ",
//         tabelTarget: "barang_masuk",
//         dataBaru: JSON.stringify(barangMasuk),
//         ipAddress:
//           request.headers.get("x-forwarded-for") ||
//           request.headers.get("x-real-ip") ||
//           "unknown",
//         userAgent: request.headers.get("user-agent") || "unknown",
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       data: barangMasuk,
//       pagination: {
//         page,
//         limit,
//         total,
//         totalPages: Math.ceil(total / limit),
//       },
//       jabatan,
//     });
//   } catch (error) {
//     console.error("Error fetching barang masuk:", error);
//     return NextResponse.json(
//       { error: "Terjadi kesalahan saat mengambil data barang masuk" },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session || !session.user) {
//       return NextResponse.json(
//         { error: "Unauthorized - Silahkan login terlebih dahulu" },
//         { status: 401 }
//       );
//     }

//     const body = await request.json();
//     const validatedData = barangMasukSchema.parse(body);

//     const barang = await prisma.barang.findUnique({
//       where: { id: validatedData.barangId },
//     });

//     if (!barang) {
//       return NextResponse.json(
//         { error: "Barang tidak ditemukan" },
//         { status: 404 }
//       );
//     }

//     const tglMasuk = new Date(validatedData.tglMasuk);
//     const jatuhTempo = calculateJatuhTempo(tglMasuk);
//     const totalHarga =
//       validatedData.stokMasuk * barang.harga + validatedData.ongkir;

//     const barangMasuk = await prisma.barangMasuk.create({
//       data: {
//         barangId: validatedData.barangId,
//         adminId: parseInt(session.user.id),
//         noInvoice: validatedData.noInvoice,
//         noSuratJalan: validatedData.noSuratJalan,
//         stokMasuk: validatedData.stokMasuk,
//         tglMasuk,
//         jatuhTempo,
//         ongkir: validatedData.ongkir,
//         totalHarga,
//         keterangan: validatedData.keterangan,
//         status: validatedData.status || "BELUM_LUNAS",
//       },
//       include: {
//         barang: {
//           select: {
//             id: true,
//             nama: true,
//             harga: true,
//           },
//         },
//         admin: {
//           select: {
//             id: true,
//             username: true,
//             jabatan: true,
//           },
//         },
//       },
//     });

//     await prisma.barang.update({
//       where: { id: validatedData.barangId },
//       data: {
//         stok: {
//           increment: validatedData.stokMasuk,
//         },
//       },
//     });

//     await prisma.logAktivitas.create({
//       data: {
//         adminId: parseInt(session.user.id),
//         aksi: "CREATE",
//         tabelTarget: "barang_masuk",
//         dataBaru: JSON.stringify(barangMasuk),
//         ipAddress:
//           request.headers.get("x-forwarded-for") ||
//           request.headers.get("x-real-ip") ||
//           "unknown",
//         userAgent: request.headers.get("user-agent") || "unknown",
//         timestamp: new Date(),
//       },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Barang masuk berhasil ditambahkan",
//         data: barangMasuk,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating barang masuk: ", error);
//     if (error instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Validasi gagal", details: error.issues },
//         { status: 400 }
//       );
//     }
//     return NextResponse.json(
//       { error: "Terjadi kesalahan server" },
//       { status: 500 }
//     );
//   }
// }
