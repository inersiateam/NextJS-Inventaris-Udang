"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DetailData } from "@/types/interfaces/IBarangKeluar";

interface DetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DetailData | null;
  adminName?: string;
  adminRole?: string;
}

export default function DetailDialog({
  open,
  onOpenChange,
  data,
  adminName = "Admin",
  adminRole = "Administrator",
}: DetailDialogProps) {
  if (!data) return null;

  const handleDownload = async () => {
    try {
      const jsPDF = (await import("jspdf")).default;
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      let yPos = 20;
      doc.setFontSize(10);
      doc.setTextColor(82, 109, 184);
      doc.text("No. Invoice", margin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(": " + data.noInvoice, margin + 32, yPos);

      yPos += 8;
      doc.setTextColor(82, 109, 184);
      doc.text("Tanggal Keluar", margin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(": " + formatDate(data.tglKeluar), margin + 32, yPos);

      yPos += 8;
      doc.setTextColor(82, 109, 184);
      doc.text("Jatuh Tempo", margin, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(": " + formatDate(data.jatuhTempo), margin + 32, yPos);

      yPos = 20;
      const rightCol = pageWidth / 2 + 5;

      doc.setTextColor(82, 109, 184);
      doc.text("Nama Barang", rightCol, yPos);
      doc.setTextColor(0, 0, 0);
      const namaBarang = data.items[0]?.namaBarang || "-";
      doc.text(": " + namaBarang, rightCol + 32, yPos);

      yPos += 8;
      doc.setTextColor(82, 109, 184);
      doc.text("Nama Pelanggan", rightCol, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(": " + data.namaPelanggan, rightCol + 32, yPos);

      yPos += 15;
      const tableData = data.items.map((item) => [
        item.namaBarang,
        item.jmlPembelian.toString(),
        formatCurrency(item.hargaJual),
        formatCurrency(data.ongkir),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Nama Barang", "Jumlah Barang", "Harga Per Produk", "Ongkir"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [23, 115, 133],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 10,
          halign: "center",
          cellPadding: 8,
        },
        bodyStyles: {
          fontSize: 10,
          halign: "center",
          cellPadding: 8,
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: {
            halign: "center",
            textColor: [0, 0, 0],
          },
          1: {
            halign: "center",
            textColor: [0, 0, 0],
          },
          2: {
            halign: "center",
            textColor: [0, 0, 0],
          },
          3: {
            halign: "center",
            textColor: [6, 182, 212],
            fontStyle: "bold",
          },
        },
        styles: {
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);

      const summaryData = [
        {
          label: "Total Harga:",
          value: formatCurrency(data.totalOmset),
          color: [6, 182, 212],
        },
      ];

      summaryData.forEach((item) => {
        doc.setTextColor(82, 109, 184);
        doc.setFont("Quicksand", "normal");
        doc.text(item.label, margin, yPos);

        doc.setTextColor(...(item.color as [number, number, number]));
        doc.setFont("Quicksand", "bold");
        doc.text(item.value, pageWidth - margin, yPos, { align: "right" });
        yPos += 8;
      });

      yPos += 2;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);

      yPos += 10;
      doc.setFontSize(11);
      doc.setTextColor(82, 109, 184);
      doc.setFont("Quicksand", "bold");
      doc.text("Laba Berjalan:", margin, yPos);

      doc.setTextColor(34, 197, 94);
      doc.setFont("Quicksand", "bold");
      doc.setFontSize(12);
      doc.text(formatCurrency(data.labaBerjalan), pageWidth - margin, yPos, {
        align: "right",
      });

      yPos = pageHeight - 45;
      doc.setFontSize(10);
      doc.setFont("Quicksand", "normal");
      doc.setTextColor(0, 0, 0);

      doc.text("Hormat Kami,", pageWidth - margin - 40, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(adminRole, pageWidth - margin - 40, yPos);

      yPos += 18;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text("(___________________)", pageWidth - margin - 45, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.text(adminName, pageWidth - margin - 40, yPos);

      doc.save(`Invoice-${data.noInvoice}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        "Gagal mengunduh invoice. Pastikan library jsPDF terinstall:\nnpm install jspdf jspdf-autotable"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl rounded-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">
            Detail Barang Keluar
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-xs sm:text-sm">
            Lihat detail anda disini, unduh untuk invoice nya!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Info Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-600 sm:min-w-[120px] font-medium sm:font-normal">
                  No. Invoice
                </span>
                <span className="text-gray-600 hidden sm:inline">:</span>
                <span className="font-medium text-gray-900 break-all mt-1 sm:mt-0">
                  {data.noInvoice}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-600 sm:min-w-[120px] font-medium sm:font-normal">
                  Tanggal Keluar
                </span>
                <span className="text-gray-600 hidden sm:inline">:</span>
                <span className="font-medium text-gray-900 mt-1 sm:mt-0">
                  {formatDate(data.tglKeluar)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-600 sm:min-w-[120px] font-medium sm:font-normal">
                  Jatuh Tempo
                </span>
                <span className="text-gray-600 hidden sm:inline">:</span>
                <span className="font-medium text-gray-900 mt-1 sm:mt-0">
                  {formatDate(data.jatuhTempo)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-600 sm:min-w-[140px] font-medium sm:font-normal">
                  Nama Barang
                </span>
                <span className="text-gray-600 hidden sm:inline">:</span>
                <span className="font-medium text-gray-900 break-words mt-1 sm:mt-0">
                  {data.items[0]?.namaBarang || "-"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <span className="text-gray-600 sm:min-w-[140px] font-medium sm:font-normal">
                  Nama Pelanggan
                </span>
                <span className="text-gray-600 hidden sm:inline">:</span>
                <span className="font-medium text-gray-900 break-words mt-1 sm:mt-0">
                  {data.namaPelanggan}
                </span>
              </div>
            </div>
          </div>

          {/* Table Section - Better Mobile Handling */}
          <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[600px] px-4 sm:px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-sky-600 hover:bg-sky-600">
                    <TableHead className="text-white text-center font-semibold text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                      Nama Barang
                    </TableHead>
                    <TableHead className="text-white text-center font-semibold text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                      Jumlah Barang
                    </TableHead>
                    <TableHead className="text-white text-center font-semibold text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                      Harga Per Produk
                    </TableHead>
                    <TableHead className="text-white text-center font-semibold text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                      Ongkir
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="text-center text-xs sm:text-sm font-medium px-2 sm:px-4">
                        {item.namaBarang}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm px-2 sm:px-4">
                        {item.jmlPembelian}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4">
                        {formatCurrency(item.hargaJual)}
                      </TableCell>
                      <TableCell className="text-center text-xs sm:text-sm font-semibold text-sky-700 whitespace-nowrap px-2 sm:px-4">
                        {formatCurrency(data.ongkir)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary Section - Responsive Layout */}
          <div className="border-t pt-4 space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-600">Total Omset:</span>
              <span className="font-semibold text-sky-700 whitespace-nowrap text-right">
                {formatCurrency(data.totalOmset)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-600">Total Modal:</span>
              <span className="font-semibold whitespace-nowrap text-right">
                {formatCurrency(data.totalModal)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-600">Laba Kotor:</span>
              <span className="font-semibold whitespace-nowrap text-right">
                {formatCurrency(data.labaKotor)}
              </span>
            </div>
            <div className="flex justify-between items-start sm:items-center gap-2">
              <span className="text-gray-600 max-w-[60%] sm:max-w-none">
                Total Discount (fee manager/teknisi):
              </span>
              <span className="font-semibold whitespace-nowrap text-right">
                {formatCurrency(data.totalFee)}
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-gray-600">Total Biaya Keluar:</span>
              <span className="font-semibold whitespace-nowrap text-right">
                {formatCurrency(data.totalBiayaKeluar)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t gap-2">
              <span className="text-gray-900 font-semibold">
                Laba Berjalan:
              </span>
              <span className="font-bold text-base sm:text-lg text-green-600 whitespace-nowrap text-right">
                {formatCurrency(data.labaBerjalan)}
              </span>
            </div>
          </div>

          {/* Action Buttons - Responsive */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              Keluar
            </Button>
            <Button
              type="button"
              onClick={handleDownload}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm gap-2"
            >
              Unduh Invoice
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
