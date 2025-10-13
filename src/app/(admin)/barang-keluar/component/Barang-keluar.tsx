"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit2,
  Eye,
  More,
  Trash,
  ArrowLeft2,
  ArrowRight2,
  Filter,
} from "iconsax-react";
import { useState } from "react";
import BarangKeluarDialog from "./Dialog";

export default function BarangKeluarTable({ data }: { data: any[] }) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Menampilkan {startIndex + 1} - {endIndex} dari {pagination?.total} data
        </p>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto gap-2">
                <Filter size="18" />
                <span>{getFilterLabel(currentFilterPeriod)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleFilterChange("all")}
                className={currentFilterPeriod === "all" ? "bg-sky-50" : ""}
              >
                Semua Data
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("thisMonth")}
                className={
                  currentFilterPeriod === "thisMonth" ? "bg-sky-50" : ""
                }
              >
                Bulan Ini
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("3months")}
                className={currentFilterPeriod === "3months" ? "bg-sky-50" : ""}
              >
                3 Bulan Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("6months")}
                className={currentFilterPeriod === "6months" ? "bg-sky-50" : ""}
              >
                6 Bulan Terakhir
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleFilterChange("1year")}
                className={currentFilterPeriod === "1year" ? "bg-sky-50" : ""}
              >
                1 Tahun Terakhir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleAddNew} className="w-full sm:w-auto">
            Tambah Data
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-sky-600 text-white hover:bg-sky-600">
              {[
                "No Invoice",
                "Tanggal Keluar",
                "Jatuh Tempo",
                "Pelanggan",
                "Alamat",
                "Total Omset",
                "Laba Berjalan",
                "Status",
                "Aksi",
              ].map((head) => (
                <TableHead key={head} className="text-white whitespace-nowrap px-6">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="px-6">{item.invoice}</TableCell>
                <TableCell className="px-6">{item.tanggal}</TableCell>
                <TableCell className="px-6">{item.namaBarang}</TableCell>
                <TableCell className="px-6">{item.pelanggan}</TableCell>
                <TableCell className="px-6">{item.alamat}</TableCell>
                <TableCell className="px-6">
                  <Badge variant={"default"} className="text-white">
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label="Open actions"
                        className="inline-flex items-center justify-end rounded-md p-1 hover:bg-muted/40"
                      >
                        <More size="20" color="#000" variant="Outline" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end" className="w-36">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Edit2 size="18" /> <span className="text-sm">Edit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Eye size="18" /> <span className="text-sm">Detail</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Trash size="18" /> <span className="text-sm">Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <BarangKeluarDialog open={openDialog} onOpenChange={setOpenDialog} />
    </>
  );
}
