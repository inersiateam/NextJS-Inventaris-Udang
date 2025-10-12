"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, More, Trash, ArrowLeft2, ArrowRight2 } from "iconsax-react";
import BarangMasukDialog from "./component/Dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteBarangMasukAction } from "@/app/(admin)/barang-masuk/actions/barangMasukActions";
import { useRouter } from "next/navigation";
import { BarangMasukWithRelations, BarangOption } from "@/types/interfaces/IBarangMasuk";

interface BarangMasukClientProps {
  barangMasukList: BarangMasukWithRelations[];
  barangOptions: BarangOption[];
}

export default function BarangMasukClient({
  barangMasukList,
  barangOptions,
}: BarangMasukClientProps) {
  const router = useRouter();
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editData, setEditData] = useState<BarangMasukWithRelations | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(barangMasukList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = barangMasukList.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddNew = () => {
    setDialogMode("create");
    setEditData(null);
    setOpenDialog(true);
  };

  const handleEdit = (item: BarangMasukWithRelations) => {
    setDialogMode("edit");
    setEditData(item);
    setOpenDialog(true);
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteBarangMasukAction(itemToDelete);

      if (!result.success) {
        throw new Error(result.success || "Gagal menghapus barang masuk");
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Menampilkan {startIndex + 1} - {Math.min(endIndex, barangMasukList.length)} dari {barangMasukList.length} data
        </p>
        <Button onClick={handleAddNew} className="w-full sm:w-auto">
          Tambah Data
        </Button>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white hover:bg-sky-600">
              {[
                "Tanggal",
                "Jatuh Tempo",
                "No Invoice",
                "No Surat Jalan",
                "Nama Barang",
                "QTY",
                "Ongkir",
                "Total",
                "Status",
                "Aksi",
              ].map((head) => (
                <TableHead
                  key={head}
                  className="text-white whitespace-nowrap px-4 md:px-6 py-4 text-center font-semibold text-xs md:text-sm"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-12 text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-base md:text-lg font-medium">Belum ada data barang masuk</p>
                    <p className="text-xs md:text-sm">Klik tombol "Tambah Data" untuk menambahkan barang masuk</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-50">
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
                    {formatDate(item.tglMasuk)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
                    {formatDate(item.jatuhTempo)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-medium text-xs md:text-sm">
                    {item.noInvoice}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
                    {item.noSuratJalan}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-medium text-xs md:text-sm">
                    {item.barang.nama}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-xs md:text-sm">
                    {item.stokMasuk}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm">
                    {formatCurrency(item.ongkir)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-sky-700 text-xs md:text-sm">
                    {formatCurrency(item.totalHarga)}
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <Badge
                      variant={
                        item.status === "LUNAS" ? "default" : "secondary"
                      }
                      className="text-white text-xs"
                    >
                      {item.status === "LUNAS" ? "Lunas" : "Belum Lunas"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-md p-1 hover:bg-muted/40">
                          <More size="20" color="#000" variant="Outline" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        side="bottom"
                        align="end"
                        className="w-36"
                      >
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 size="18" />{" "}
                          <span className="text-sm">Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer text-red-500"
                          onClick={() => handleDeleteClick(item.id)}
                        >
                          <Trash size="18" />{" "}
                          <span className="text-sm">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {barangMasukList.length > 0 && (
        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pb-20 md:pb-0">
          <p className="text-xs md:text-sm text-gray-600 order-2 sm:order-1">
            Halaman {currentPage} dari {totalPages}
          </p>
          
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="gap-1 text-xs md:text-sm"
            >
              <ArrowLeft2 size="16" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
              {getPageNumbers().map((page, index) => (
                <Button
                  key={index}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => typeof page === "number" && handlePageClick(page)}
                  disabled={page === "..."}
                  className={`min-w-[32px] md:min-w-[40px] text-xs md:text-sm ${
                    page === "..." ? "cursor-default hover:bg-transparent" : ""
                  }`}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="gap-1 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ArrowRight2 size="16" />
            </Button>
          </div>
        </div>
      )}

      <BarangMasukDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        barangOptions={barangOptions}
        editData={editData}
        mode={dialogMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang Masuk?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Data barang masuk akan dihapus permanen dan stok barang akan dikurangi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}