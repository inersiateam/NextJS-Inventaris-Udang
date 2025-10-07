/*
  Warnings:

  - You are about to drop the column `id_pengeluaran_id` on the `pendapatan` table. All the data in the column will be lost.
  - Added the required column `tahun` to the `pendapatan` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `bulan` on the `pendapatan` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "public"."pendapatan_bulan_idx";

-- AlterTable
ALTER TABLE "public"."pendapatan" DROP COLUMN "id_pengeluaran_id",
ADD COLUMN     "tahun" INTEGER NOT NULL,
ADD COLUMN     "total_pengeluaran" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "bulan",
ADD COLUMN     "bulan" INTEGER NOT NULL,
ALTER COLUMN "tanggal" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "pendapatan_bulan_tahun_idx" ON "public"."pendapatan"("bulan", "tahun");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_barang_keluar_id_idx" ON "public"."transaksi_keluar"("id_barang_keluar_id");

-- AddForeignKey
ALTER TABLE "public"."transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_barang_keluar_id_fkey" FOREIGN KEY ("id_barang_keluar_id") REFERENCES "public"."barang_keluar"("id_barang_keluar") ON DELETE CASCADE ON UPDATE CASCADE;
