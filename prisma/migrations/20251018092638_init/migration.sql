/*
  Warnings:

  - You are about to drop the `log_aktivitas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pendapatan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."log_aktivitas" DROP CONSTRAINT "log_aktivitas_id_admin_fkey";

-- DropForeignKey
ALTER TABLE "public"."pendapatan" DROP CONSTRAINT "pendapatan_id_transaksi_keluar_id_fkey";

-- DropTable
DROP TABLE "public"."log_aktivitas";

-- DropTable
DROP TABLE "public"."pendapatan";
