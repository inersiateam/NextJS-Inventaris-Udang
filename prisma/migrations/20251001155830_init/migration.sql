/*
  Warnings:

  - You are about to drop the column `manager` on the `transaksi_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `teknisi` on the `transaksi_keluar` table. All the data in the column will be lost.
  - Added the required column `no_invoice` to the `barang_keluar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_modal` to the `barang_keluar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_surat_jalan` to the `barang_masuk` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_biaya_keluar` to the `transaksi_keluar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_fee` to the `transaksi_keluar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."barang_keluar" ADD COLUMN     "no_invoice" TEXT NOT NULL,
ADD COLUMN     "total_modal" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."barang_masuk" ADD COLUMN     "no_surat_jalan" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."pelanggan" ADD COLUMN     "total_pembelian" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."transaksi_keluar" DROP COLUMN "manager",
DROP COLUMN "teknisi",
ADD COLUMN     "total_biaya_keluar" INTEGER NOT NULL,
ADD COLUMN     "total_fee" INTEGER NOT NULL;
