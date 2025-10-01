"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import InventarisDashboard from "@/components/layout/inventaris-dashboard";
import AppNavbar from "@/components/layout/navbar-layout";

export default function FormBarangMasuk() {
  const user = { name: "Admin ABL", role: "abl" as const };
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    barangId: "",
    stokMasuk: "",
    tglMasuk: "",
    ongkir: "0",
    keterangan: "",
  });

  const [barangList, setBarangList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch daftar barang saat component mount
  useEffect(() => {
    fetchBarang();
  }, []);

  const fetchBarang = async () => {
    try {
      const res = await fetch("/api/barang");
      const data = await res.json();
      if (data.success) {
        setBarangList(data.data);
      }
    } catch (error) {
      console.error("Error fetching barang:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        barangId: parseInt(formData.barangId),
        stokMasuk: parseInt(formData.stokMasuk),
        tglMasuk: formData.tglMasuk,
        ongkir: parseInt(formData.ongkir),
        keterangan: formData.keterangan,
      };

      const res = await fetch("/api/barang-masuk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        alert("Barang masuk berhasil ditambahkan!");
        // Reset form
        setFormData({
          barangId: "",
          stokMasuk: "",
          tglMasuk: "",
          ongkir: "0",
          keterangan: "",
        });
      } else {
        alert(data.error || "Terjadi kesalahan");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan saat menambah barang masuk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <InventarisDashboard user={user} title="Barang Masuk">
     
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Form Barang Masuk</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username - Read Only (Auto-fill dari session) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username Admin
            </label>
            <input
              type="text"
              value={session?.user?.username || "-"}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Otomatis terisi dari akun yang login
            </p>
          </div>

          {/* Jabatan - Read Only (Auto-fill dari session) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jabatan
            </label>
            <input
              type="text"
              value={session?.user?.jabatan || "-"}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Otomatis terisi dari akun yang login
            </p>
          </div>

          {/* Pilih Barang */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Barang <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.barangId}
              onChange={(e) =>
                setFormData({ ...formData, barangId: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Pilih Barang --</option>
              {barangList.map((barang: any) => (
                <option key={barang.id} value={barang.id}>
                  {barang.nama} - Stok: {barang.stok} - Rp{" "}
                  {barang.harga.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          {/* Stok Masuk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stok Masuk <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.stokMasuk}
              onChange={(e) =>
                setFormData({ ...formData, stokMasuk: e.target.value })
              }
              required
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan jumlah stok"
            />
          </div>

          {/* Tanggal Masuk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Masuk <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tglMasuk}
              onChange={(e) =>
                setFormData({ ...formData, tglMasuk: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Ongkir */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ongkir
            </label>
            <input
              type="number"
              value={formData.ongkir}
              onChange={(e) =>
                setFormData({ ...formData, ongkir: e.target.value })
              }
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan ongkir (opsional)"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          {/* Info Otomatis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">
              ℹ️ Info Otomatis:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• No Invoice akan di-generate otomatis oleh sistem</li>
              <li>• Jatuh tempo: 1 bulan dari tanggal masuk</li>
              <li>• Status: Belum Lunas (default)</li>
              <li>• Total Harga = (Stok Masuk × Harga Barang) + Ongkir</li>
            </ul>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Tambah Barang Masuk"}
          </button>
        </form>
      </div>
    </InventarisDashboard>
  );
}
