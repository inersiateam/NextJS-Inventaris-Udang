-- CreateEnum
CREATE TYPE "Jabatan" AS ENUM ('ABL', 'ATM');

-- CreateEnum
CREATE TYPE "StatusTransaksi" AS ENUM ('LUNAS', 'BELUM_LUNAS');

-- CreateEnum
CREATE TYPE "Satuan" AS ENUM ('KG', 'LITER');

-- CreateTable
CREATE TABLE "admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jabatan" "Jabatan" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barang" (
    "id_barang" SERIAL NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "harga_modal" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "satuan" "Satuan" NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id_barang")
);

-- CreateTable
CREATE TABLE "barang_masuk" (
    "id_barang_masuk" SERIAL NOT NULL,
    "id_barang_id" INTEGER NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "no_invoice" TEXT NOT NULL,
    "no_surat_jalan" TEXT NOT NULL,
    "stok_masuk" INTEGER NOT NULL,
    "tgl_masuk" DATE NOT NULL,
    "jatuh_tempo" DATE NOT NULL,
    "ongkir" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    "keterangan" TEXT,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_masuk_pkey" PRIMARY KEY ("id_barang_masuk")
);

-- CreateTable
CREATE TABLE "barang_keluar" (
    "id_barang_keluar" SERIAL NOT NULL,
    "id_pelanggan_id" INTEGER NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "no_invoice" TEXT NOT NULL,
    "no_surat_jalan" TEXT NOT NULL,
    "no_po" TEXT,
    "total_omset" INTEGER NOT NULL,
    "total_modal" INTEGER NOT NULL,
    "total_laba_kotor" INTEGER NOT NULL,
    "tgl_keluar" DATE NOT NULL,
    "jatuh_tempo" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_keluar_pkey" PRIMARY KEY ("id_barang_keluar")
);

-- CreateTable
CREATE TABLE "barang_keluar_detail" (
    "id" SERIAL NOT NULL,
    "id_barang_keluar" INTEGER NOT NULL,
    "id_barang" INTEGER NOT NULL,
    "jml_pembelian" INTEGER NOT NULL,
    "harga_jual" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_keluar_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelanggan" (
    "id_pelanggan" SERIAL NOT NULL,
    "nama_pelanggan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "transaksi_keluar" (
    "id_transaksi_keluar" SERIAL NOT NULL,
    "id_barang_keluar_id" INTEGER NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "total_fee" INTEGER NOT NULL,
    "ongkir" INTEGER NOT NULL,
    "total_biaya_keluar" INTEGER NOT NULL,
    "laba_berjalan" INTEGER NOT NULL,
    "status" "StatusTransaksi" NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_keluar_pkey" PRIMARY KEY ("id_transaksi_keluar")
);

-- CreateTable
CREATE TABLE "pengeluaran" (
    "id_pengeluaran" SERIAL NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "jumlah_barang" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengeluaran_pkey" PRIMARY KEY ("id_pengeluaran")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "admin"("username");

-- CreateIndex
CREATE INDEX "barang_id_admin_idx" ON "barang"("id_admin");

-- CreateIndex
CREATE INDEX "barang_masuk_id_barang_id_idx" ON "barang_masuk"("id_barang_id");

-- CreateIndex
CREATE INDEX "barang_masuk_id_admin_id_idx" ON "barang_masuk"("id_admin_id");

-- CreateIndex
CREATE INDEX "barang_masuk_tgl_masuk_idx" ON "barang_masuk"("tgl_masuk");

-- CreateIndex
CREATE INDEX "barang_keluar_id_pelanggan_id_idx" ON "barang_keluar"("id_pelanggan_id");

-- CreateIndex
CREATE INDEX "barang_keluar_id_admin_id_idx" ON "barang_keluar"("id_admin_id");

-- CreateIndex
CREATE INDEX "barang_keluar_tgl_keluar_idx" ON "barang_keluar"("tgl_keluar");

-- CreateIndex
CREATE INDEX "barang_keluar_no_po_idx" ON "barang_keluar"("no_po");

-- CreateIndex
CREATE INDEX "barang_keluar_detail_id_barang_keluar_idx" ON "barang_keluar_detail"("id_barang_keluar");

-- CreateIndex
CREATE INDEX "barang_keluar_detail_id_barang_idx" ON "barang_keluar_detail"("id_barang");

-- CreateIndex
CREATE INDEX "pelanggan_id_admin_idx" ON "pelanggan"("id_admin");

-- CreateIndex
CREATE UNIQUE INDEX "transaksi_keluar_id_barang_keluar_id_key" ON "transaksi_keluar"("id_barang_keluar_id");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_barang_keluar_id_idx" ON "transaksi_keluar"("id_barang_keluar_id");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_admin_id_idx" ON "transaksi_keluar"("id_admin_id");

-- CreateIndex
CREATE INDEX "pengeluaran_id_admin_id_idx" ON "pengeluaran"("id_admin_id");

-- CreateIndex
CREATE INDEX "pengeluaran_tanggal_idx" ON "pengeluaran"("tanggal");

-- AddForeignKey
ALTER TABLE "barang" ADD CONSTRAINT "barang_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_masuk" ADD CONSTRAINT "barang_masuk_id_barang_id_fkey" FOREIGN KEY ("id_barang_id") REFERENCES "barang"("id_barang") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_masuk" ADD CONSTRAINT "barang_masuk_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_keluar" ADD CONSTRAINT "barang_keluar_id_pelanggan_id_fkey" FOREIGN KEY ("id_pelanggan_id") REFERENCES "pelanggan"("id_pelanggan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_keluar" ADD CONSTRAINT "barang_keluar_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_keluar_detail" ADD CONSTRAINT "barang_keluar_detail_id_barang_keluar_fkey" FOREIGN KEY ("id_barang_keluar") REFERENCES "barang_keluar"("id_barang_keluar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_keluar_detail" ADD CONSTRAINT "barang_keluar_detail_id_barang_fkey" FOREIGN KEY ("id_barang") REFERENCES "barang"("id_barang") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pelanggan" ADD CONSTRAINT "pelanggan_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_barang_keluar_id_fkey" FOREIGN KEY ("id_barang_keluar_id") REFERENCES "barang_keluar"("id_barang_keluar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengeluaran" ADD CONSTRAINT "pengeluaran_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
