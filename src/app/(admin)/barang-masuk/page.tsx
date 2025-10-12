import { getJabatan } from "@/lib/helpers/globalHelper";
import {
  getBarangMasukList,
  getBarangOptions,
} from "@/lib/services/barangMasukService";
import BarangMasukClient from "./barangMasukClient";

export default async function Page() {
  const jabatan = await getJabatan();

  const [barangMasukList, barangOptions] = await Promise.all([
    getBarangMasukList(jabatan),
    getBarangOptions(jabatan),
  ]);

  return (
    <div className="space-y-6 p-2">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Barang Masuk
        </h1>
        <p className="text-gray-500 text-sm md:text-base mt-1">
          Tambahkan item baru ke sistem, pantau stok lebih rapi
        </p>
      </header>

      <BarangMasukClient
        barangMasukList={barangMasukList}
        barangOptions={barangOptions}
      />
    </div>
  );
}