/*
  Warnings:

  - You are about to drop the column `id_pelanggan_id` on the `transaksi_keluar` table. All the data in the column will be lost.
  - Added the required column `jatuh_tempo` to the `barang_masuk` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."transaksi_keluar" DROP CONSTRAINT "transaksi_keluar_id_pelanggan_id_fkey";

-- DropIndex
DROP INDEX "public"."transaksi_keluar_id_pelanggan_id_idx";

-- AlterTable
ALTER TABLE "public"."barang_masuk" ADD COLUMN     "jatuh_tempo" DATE NOT NULL;

-- AlterTable
ALTER TABLE "public"."transaksi_keluar" DROP COLUMN "id_pelanggan_id";
