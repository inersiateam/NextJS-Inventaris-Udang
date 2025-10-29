"use client";

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
import { Edit2, More, Trash } from "iconsax-react";
import DialogBarang from "./Dialog";
import { useEffect, useState } from "react";
import { getBarangAction, deleteBarangAction } from "../actions/barangActions";
import { BarangWithRelations } from "@/types/interfaces/IBarang";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/utils";

interface BarangClientProps {
  initialData?: BarangWithRelations[];
  initialPage?: number;
  initialTotalPages?: number;
}

export default function BarangClient({
  initialData = [],
  initialPage = 1,
  initialTotalPages = 1,
}: BarangClientProps) {
  const [barangList, setBarangList] =
    useState<BarangWithRelations[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBarang = async (resetPage = false) => {
    setLoading(true);
    try {
      const currentPage = resetPage ? 1 : page;
      if (resetPage) setPage(1);

      const result = await getBarangAction({
        page: currentPage,
        limit: 10,
        search: search.trim() || undefined,
      });

      if (result.success && "data" in result && result.data) {
        setBarangList(result.data);
        if ("pagination" in result && result.pagination) {
          setTotalPages(result.pagination.totalPages);
        }
      } else {
        const errorMsg =
          "error" in result ? result.error : "Gagal mengambil data";
        toast.error(errorMsg || "Gagal mengambil data");
      }
    } catch (error) {
      console.error("Error fetching barang:", error);
      toast.error("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page !== initialPage) {
      fetchBarang();
    }
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBarang(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      const result = await deleteBarangAction(deleteId);

      if (result.success) {
        toast.success(result.message);
        fetchBarang();
      } else {
        toast.error(result.error || "Gagal menghapus barang");
      }
    } catch (error) {
      console.error("Error deleting barang:", error);
      toast.error("Terjadi kesalahan saat menghapus data");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <DialogBarang onSuccess={() => fetchBarang()} />
      </div>

      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary text-white hover:bg-primary">
              <TableHead className="text-white text-center whitespace-nowrap px-4">
                Barang
              </TableHead>
              <TableHead className="text-white text-center whitespace-nowrap px-4">
                Harga
              </TableHead>
              <TableHead className="text-white text-center whitespace-nowrap px-4">
                Stok
              </TableHead>
              <TableHead className="text-white text-center whitespace-nowrap px-4">
                Satuan
              </TableHead>
              <TableHead className="text-white text-center whitespace-nowrap px-4">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : barangList.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {search
                    ? "Tidak ada data yang sesuai pencarian"
                    : "Tidak ada data barang"}
                </TableCell>
              </TableRow>
            ) : (
              barangList.map((barang) => (
                <TableRow key={barang.id}>
                  <TableCell className="font-medium text-center">
                    {barang.nama}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(barang.harga)}
                  </TableCell>
                  <TableCell className="text-center">{barang.stok}</TableCell>
                  <TableCell className="text-center">{barang.satuan}</TableCell>
                  <TableCell className="text-center">
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
                        <DialogBarang
                          mode="edit"
                          barang={barang}
                          onSuccess={() => fetchBarang()}
                          trigger={
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Edit2 size="20" color="#000" variant="Outline" />
                              <span className="text-sm">Edit</span>
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer text-red-500"
                          onSelect={() => setDeleteId(barang.id)}
                        >
                          <Trash
                            size="18"
                            color="#ff0000ff"
                            variant="Outline"
                          />
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

      {/* Pagination */}
      {!loading && barangList.length > 0 && totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm">
              Halaman {page} dari {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus barang ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
