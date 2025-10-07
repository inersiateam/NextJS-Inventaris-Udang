-- CreateEnum
CREATE TYPE "public"."Jabatan" AS ENUM ('ABL', 'ATM');

-- CreateEnum
CREATE TYPE "public"."StatusTransaksi" AS ENUM ('LUNAS', 'BELUM_LUNAS');

-- CreateTable
CREATE TABLE "public"."admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "jabatan" "public"."Jabatan" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."barang" (
    "id_barang" SERIAL NOT NULL,
    "nama_barang" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_pkey" PRIMARY KEY ("id_barang")
);

-- CreateTable
CREATE TABLE "public"."barang_masuk" (
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
    "status" "public"."StatusTransaksi" NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_masuk_pkey" PRIMARY KEY ("id_barang_masuk")
);

-- CreateTable
CREATE TABLE "public"."barang_keluar" (
    "id_barang_keluar" SERIAL NOT NULL,
    "id_barang_id" INTEGER NOT NULL,
    "id_pelanggan_id" INTEGER NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "no_invoice" TEXT NOT NULL,
    "jml_pembelian" INTEGER NOT NULL,
    "harga_jual_produk" INTEGER NOT NULL,
    "total_omset" INTEGER NOT NULL,
    "total_modal" INTEGER NOT NULL,
    "total_laba_kotor" INTEGER NOT NULL,
    "tgl_keluar" DATE NOT NULL,
    "jatuh_tempo" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barang_keluar_pkey" PRIMARY KEY ("id_barang_keluar")
);

-- CreateTable
CREATE TABLE "public"."pelanggan" (
    "id_pelanggan" SERIAL NOT NULL,
    "nama_pelanggan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelanggan_pkey" PRIMARY KEY ("id_pelanggan")
);

-- CreateTable
CREATE TABLE "public"."transaksi_keluar" (
    "id_transaksi_keluar" SERIAL NOT NULL,
    "id_barang_keluar_id" INTEGER NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "total_fee" INTEGER NOT NULL,
    "ongkir" INTEGER NOT NULL,
    "total_biaya_keluar" INTEGER NOT NULL,
    "laba_berjalan" INTEGER NOT NULL,
    "status" "public"."StatusTransaksi" NOT NULL DEFAULT 'BELUM_LUNAS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaksi_keluar_pkey" PRIMARY KEY ("id_transaksi_keluar")
);

-- CreateTable
CREATE TABLE "public"."pengeluaran" (
    "id_pengeluaran" SERIAL NOT NULL,
    "id_admin_id" INTEGER NOT NULL,
    "keterangan" TEXT NOT NULL,
    "jumlah_barang" INTEGER NOT NULL,
    "total_harga" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengeluaran_pkey" PRIMARY KEY ("id_pengeluaran")
);

-- CreateTable
CREATE TABLE "public"."pendapatan" (
    "id_pendapat" SERIAL NOT NULL,
    "id_transaksi_keluar_id" INTEGER NOT NULL,
    "id_pengeluaran_id" INTEGER NOT NULL,
    "bulan" TEXT NOT NULL,
    "owner1" INTEGER NOT NULL,
    "owner2" INTEGER NOT NULL,
    "owner3" INTEGER NOT NULL,
    "cv" INTEGER NOT NULL,
    "tanggal" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendapatan_pkey" PRIMARY KEY ("id_pendapat")
);

-- CreateTable
CREATE TABLE "public"."log_aktivitas" (
    "id_log" SERIAL NOT NULL,
    "id_admin" INTEGER NOT NULL,
    "aksi" TEXT NOT NULL,
    "tabel_target" TEXT NOT NULL,
    "data_lama" TEXT,
    "data_baru" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_aktivitas_pkey" PRIMARY KEY ("id_log")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_username_key" ON "public"."admin"("username");

-- CreateIndex
CREATE INDEX "barang_id_admin_idx" ON "public"."barang"("id_admin");

-- CreateIndex
CREATE INDEX "barang_masuk_id_barang_id_idx" ON "public"."barang_masuk"("id_barang_id");

-- CreateIndex
CREATE INDEX "barang_masuk_id_admin_id_idx" ON "public"."barang_masuk"("id_admin_id");

-- CreateIndex
CREATE INDEX "barang_masuk_tgl_masuk_idx" ON "public"."barang_masuk"("tgl_masuk");

-- CreateIndex
CREATE INDEX "barang_keluar_id_barang_id_idx" ON "public"."barang_keluar"("id_barang_id");

-- CreateIndex
CREATE INDEX "barang_keluar_id_pelanggan_id_idx" ON "public"."barang_keluar"("id_pelanggan_id");

-- CreateIndex
CREATE INDEX "barang_keluar_id_admin_id_idx" ON "public"."barang_keluar"("id_admin_id");

-- CreateIndex
CREATE INDEX "barang_keluar_tgl_keluar_idx" ON "public"."barang_keluar"("tgl_keluar");

-- CreateIndex
CREATE INDEX "pelanggan_id_admin_idx" ON "public"."pelanggan"("id_admin");

-- CreateIndex
CREATE INDEX "transaksi_keluar_id_admin_id_idx" ON "public"."transaksi_keluar"("id_admin_id");

-- CreateIndex
CREATE INDEX "pengeluaran_id_admin_id_idx" ON "public"."pengeluaran"("id_admin_id");

-- CreateIndex
CREATE INDEX "pengeluaran_tanggal_idx" ON "public"."pengeluaran"("tanggal");

-- CreateIndex
CREATE INDEX "pendapatan_id_transaksi_keluar_id_idx" ON "public"."pendapatan"("id_transaksi_keluar_id");

-- CreateIndex
CREATE INDEX "pendapatan_bulan_idx" ON "public"."pendapatan"("bulan");

-- CreateIndex
CREATE INDEX "log_aktivitas_id_admin_idx" ON "public"."log_aktivitas"("id_admin");

-- CreateIndex
CREATE INDEX "log_aktivitas_timestamp_idx" ON "public"."log_aktivitas"("timestamp");

-- AddForeignKey
ALTER TABLE "public"."barang" ADD CONSTRAINT "barang_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_masuk" ADD CONSTRAINT "barang_masuk_id_barang_id_fkey" FOREIGN KEY ("id_barang_id") REFERENCES "public"."barang"("id_barang") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_masuk" ADD CONSTRAINT "barang_masuk_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar" ADD CONSTRAINT "barang_keluar_id_barang_id_fkey" FOREIGN KEY ("id_barang_id") REFERENCES "public"."barang"("id_barang") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar" ADD CONSTRAINT "barang_keluar_id_pelanggan_id_fkey" FOREIGN KEY ("id_pelanggan_id") REFERENCES "public"."pelanggan"("id_pelanggan") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."barang_keluar" ADD CONSTRAINT "barang_keluar_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pelanggan" ADD CONSTRAINT "pelanggan_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaksi_keluar" ADD CONSTRAINT "transaksi_keluar_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pengeluaran" ADD CONSTRAINT "pengeluaran_id_admin_id_fkey" FOREIGN KEY ("id_admin_id") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pendapatan" ADD CONSTRAINT "pendapatan_id_transaksi_keluar_id_fkey" FOREIGN KEY ("id_transaksi_keluar_id") REFERENCES "public"."transaksi_keluar"("id_transaksi_keluar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."log_aktivitas" ADD CONSTRAINT "log_aktivitas_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "public"."admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
