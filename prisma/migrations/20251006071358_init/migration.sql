/*
  Warnings:

  - You are about to drop the column `harga` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `harga_jual_produk` on the `barang_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `id_barang_id` on the `barang_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `jml_pembelian` on the `barang_keluar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id_transaksi_keluar_id]` on the table `pendapatan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id_barang_keluar_id]` on the table `transaksi_keluar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `harga_modal` to the `barang` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."barang_keluar" DROP CONSTRAINT "barang_keluar_id_barang_id_fkey";

-- DropIndex
DROP INDEX "public"."barang_keluar_id_barang_id_idx";

-- AlterTable
ALTER TABLE "public"."barang" DROP COLUMN "harga",
ADD COLUMN     "harga_modal" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."barang_keluar" DROP COLUMN "harga_jual_produk",
DROP COLUMN "id_barang_id",
DROP COLUMN "jml_pembelian";

-- AlterTable
ALTER TABLE "public"."pengeluaran" ALTER COLUMN "tanggal" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."barang_keluar_detail" (
    "id" SERIAL NOT NULL,
    "id_barang_keluar" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jml_pembelian" INTEGER NOT NULL,
    "harga_jual" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_keluar_detail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "barang_keluar_detail_id_barang_keluar_idx" ON "public"."barang_keluar_detail"("id_barang_keluar");

-- CreateIndex
CREATE INDEX "barang_keluar_detail_id_barang_idx" ON "public"."barang_keluar_detail"("id_barang");

-- CreateIndex
CREATE UNIQUE INDEX "pendapatan_id_transaksi_keluar_id_key" ON "public"."pendapatan"("id_transaksi_keluar_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_keluar_id_barang_keluar_id_key" ON "public"."transaksi_keluar"("id_barang_keluar_id");

-- AddForeignKey
ALTER TABLE "public"."barang_keluar_detail" ADD CONSTRAINT "barang_keluar_detail_id_barang_keluar_fkey" FOREIGN KEY ("id_barang_keluar") REFERENCES "public"."barang_keluar"("id_barang_keluar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar_detail" ADD CONSTRAINT "barang_keluar_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "public"."barang"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;
