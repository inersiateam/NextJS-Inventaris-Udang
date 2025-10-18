"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit2, Eye, More, Trash } from "iconsax-react";
import PelangganDialog from "./Dialog";
import { useState } from "react";
import PelangganDetailDialog from "./Detail"; 
import { PelangganWithAdmin } from "@/types/interfaces/IPelanggan";
import { deletePelangganAction, getPelangganDetailAction } from "../actions/pelangganActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useHighlightEffect from '@/hooks/useHighlightEffect';
interface PelangganProps {
  data: PelangganWithAdmin[];
}

export default function Pelanggan({ data }: PelangganProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPelanggan, setSelectedPelanggan] = useState<PelangganWithAdmin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
   const [openDetail, setOpenDetail] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const router = useRouter();

  const handleEdit = (pelanggan: PelangganWithAdmin) => {
    setSelectedPelanggan(pelanggan);
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setSelectedPelanggan(null);
    setOpenDialog(true);
  };

const handleDetail = async (id: number) => {
  try {
    const result = await getPelangganDetailAction(id);

    if (result.success) {
      if ("data" in result) {
        setDetailData(result.data);
        setOpenDetail(true);
      } else {
        toast.error("Gagal memuat detail pelanggan");
      }
    } else {
      // ⬇️ tambahkan pengecekan agar TypeScript paham
      const errMsg = "error" in result ? result.error : "Gagal memuat detail pelanggan";
      toast.error(errMsg);
    }
  } catch (error) {
    console.error("Gagal memuat detail pelanggan:", error);
    toast.error("Terjadi kesalahan saat memuat detail pelanggan");
  }
};


  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pelanggan "${nama}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deletePelangganAction(id);
      
      if (result.success) {
        toast.success(result.success);
        router.refresh();
      } else {
        toast.error(result.success || "Gagal menghapus pelanggan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menghapus pelanggan");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDialogClose = (success: boolean) => {
    setOpenDialog(false);
    setSelectedPelanggan(null);
    if (success) {
      router.refresh();
    }
  };
useHighlightEffect('pelanggan'); 
  return (
    <>
      <div className="flex justify-end mb-4 mt-6">
        <Button 
          onClick={handleAdd}
          className="bg-primary hover:bg-sky-700"
        >
          Tambah Pelanggan
        </Button>
      </div>

      <div className="w-full overflow-x-auto bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 hover:bg-sky-600">
              <TableHead className="text-white whitespace-nowrap px-4">No</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Nama Pelanggan</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Alamat</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Total Pembelian</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4">Admin</TableHead>
              <TableHead className="text-white whitespace-nowrap px-4 text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada data pelanggan
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow key={item.id} id={`pelanggan-${item.id}`}  className="hover:bg-gray-50">
                  <TableCell className="whitespace-nowrap px-4">{index + 1}</TableCell>
                  <TableCell className="whitespace-nowrap px-4 font-medium">{item.nama}</TableCell>
                  <TableCell className="px-4 max-w-xs truncate" title={item.alamat}>
                    {item.alamat}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4">
                    {item.totalPembelian.toLocaleString('id-ID')} unit
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4 text-sm text-gray-600">
                    {item.admin.username}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-4">
                    <div className="flex justify-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-gray-100 transition-colors"
                            disabled={isDeleting}
                          >
                            <More size="20" color="#374151" variant="Outline" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="bottom" align="end" className="w-40">
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer"
                             onClick={() => handleDetail(item.id)}
                          >
                            <Eye size="18" color="#374151" variant="Outline" />
                            <span className="text-sm">Detail</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size="18" color="#374151" variant="Outline" />
                            <span className="text-sm">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => handleDelete(item.id, item.nama)}
                            disabled={isDeleting}
                          >
                            <Trash size="18" color="#dc2626" variant="Outline" />
                            <span className="text-sm">Hapus</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PelangganDialog 
        open={openDialog} 
        onOpenChange={handleDialogClose}
        pelanggan={selectedPelanggan}
      />
      <PelangganDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        data={detailData}
      />
    </>
  );
}