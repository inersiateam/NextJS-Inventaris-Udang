/*
  Warnings:

  - You are about to drop the column `tanggal` on the `transaksi_keluar` table. All the data in the column will be lost.
  - Added the required column `jatuh_tempo` to the `barang_keluar` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."transaksi_keluar_tanggal_idx";

-- AlterTable
ALTER TABLE "public"."barang_keluar" ADD COLUMN     "jatuh_tempo" DATE NOT NULL;

-- AlterTable
ALTER TABLE "public"."transaksi_keluar" DROP COLUMN "tanggal";
