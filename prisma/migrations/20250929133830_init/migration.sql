/*
  Warnings:

  - You are about to drop the column `email` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `no_telp` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `satuan` on the `barang` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `barang_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `barang_masuk` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `pelanggan` table. All the data in the column will be lost.
  - You are about to drop the column `no_telp` on the `pelanggan` table. All the data in the column will be lost.
  - You are about to drop the column `bukti_file` on the `pengeluaran` table. All the data in the column will be lost.
  - You are about to drop the column `kategori_pengeluaran` on the `pengeluaran` table. All the data in the column will be lost.
  - You are about to drop the column `catatan` on the `transaksi_keluar` table. All the data in the column will be lost.
  - You are about to drop the column `metode_pembayaran` on the `transaksi_keluar` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."admin_email_key";

-- AlterTable
ALTER TABLE "public"."admin" DROP COLUMN "email",
DROP COLUMN "no_telp";

-- AlterTable
ALTER TABLE "public"."barang" DROP COLUMN "kategori",
DROP COLUMN "satuan";

-- AlterTable
ALTER TABLE "public"."barang_keluar" DROP COLUMN "catatan";

-- AlterTable
ALTER TABLE "public"."barang_masuk" DROP COLUMN "catatan";

-- AlterTable
ALTER TABLE "public"."pelanggan" DROP COLUMN "email",
DROP COLUMN "no_telp";

-- AlterTable
ALTER TABLE "public"."pengeluaran" DROP COLUMN "bukti_file",
DROP COLUMN "kategori_pengeluaran";

-- AlterTable
ALTER TABLE "public"."transaksi_keluar" DROP COLUMN "catatan",
DROP COLUMN "metode_pembayaran";
