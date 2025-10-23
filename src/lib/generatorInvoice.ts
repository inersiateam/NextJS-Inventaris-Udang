import { DetailData } from "@/types/interfaces/IBarangKeluar";
import { formatCurrency, formatDate } from "./utils";

const generateInvoicePDF = (data: DetailData) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${data.noInvoice}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      padding: 40px;
      font-size: 12px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
    }
    
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      background: linear-gradient(135deg, #0066cc 0%, #0099ff 50%, #ff6600 100%);
      border-radius: 50%;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      border: 3px solid #0066cc;
    }
    
    .company-name {
      font-size: 11px;
      font-weight: bold;
      color: #0066cc;
    }
    
    .invoice-title {
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    
    .invoice-title h1 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .invoice-number {
      font-size: 14px;
    }
    
    .header-right {
      text-align: left;
      font-size: 11px;
      line-height: 1.8;
      min-width: 200px;
    }
    
    .company-address {
      font-size: 11px;
      line-height: 1.5;
    }
    
    .due-date-box {
      border: 2px solid black;
      padding: 8px 12px;
      text-align: center;
      font-size: 13px;
      width: fit-content;
      display: inline-block;
    }
    
    .due-date-box strong {
      margin-right: 10px;
    }

    /* ✅ GRID ADDRESS + JATUH TEMPO */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: start;
      margin-bottom: 20px;
      gap: 15px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th {
      background-color: #0066cc;
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      border: 1px solid #0066cc;
    }
    
    td {
      padding: 8px;
      border: 1px solid #333;
      text-align: center;
    }
    
    td:first-child {
      width: 50px;
    }
    
    td:nth-child(2) {
      text-align: left;
    }
    
    .total-row {
      background-color: #f0f0f0;
    }
    
    .total-row td {
      font-weight: bold;
      font-size: 14px;
      padding: 12px;
      text-align: center; /* ✅ CENTERED */
    }

    /* ✅ FOOTER GRID 3 KOLOM */
    .footer {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 10px;
      margin-top: 30px;
    }

    .payment-details h3 {
      font-size: 13px;
      margin-bottom: 10px;
    }
    
    .payment-details p {
      font-size: 11px;
      line-height: 1.8;
    }
    
    .signature-section {
      text-align: center;
      flex: 1;
    }
    
    .signature-box {
      margin-top: 10px;
      padding-top: 60px;
      border-bottom: 2px solid #333;
      width: 200px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .signature-label {
      font-size: 11px;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <div class="logo">
        <div>CV AQUA<br/>BERKAH<br/>LESTARI</div>
      </div>
      <div class="company-name">CV Aqua Berkah Lestari</div>
    </div>
    
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-number">No. ${data.noInvoice}</div>
    </div>
    
    <div class="header-right">
      <div>Banyuwangi, ${formatDate(data.tglKeluar)}</div>
      <div>Kepada,</div>
      <div><strong>${data.namaPelanggan}</strong></div>
    </div>
  </div>
  
  <!-- ✅ GRID WRAPPER START -->
  <div class="info-grid">
    <div class="company-address">
      <strong>Perumahan Griya Indah Pakis, Sumberejo,<br/>
      Kab. Banyuwangi, Jawa Timur, 68419</strong>
    </div>

    <div class="due-date-box">
      <strong>Jatuh Tempo :</strong> ${formatDate(data.jatuhTempo)}
    </div>
  </div>
  <!-- ✅ GRID WRAPPER END -->
  
  <table>
    <thead>
      <tr>
        <th>NO</th>
        <th>NAMA BARANG</th>
        <th>QTY</th>
        <th>HARGA</th>
        <th>JUMLAH</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.namaBarang}</td>
          <td>${item.jmlPembelian} ltr</td>
          <td>${formatCurrency(item.hargaJual)}</td>
          <td>${formatCurrency(item.subtotal)}</td>
        </tr>
      `).join('')}
      ${Array.from({ length: Math.max(0, 20 - data.items.length) }, (_, i) => `
        <tr>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `).join('')}
      <tr class="total-row">
        <td colspan="4">TOTAL</td>
        <td>${formatCurrency(data.totalOmset)}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    <div class="payment-details">
      <h3>Detail Pembayaran</h3>
      <p>
        <strong>Nama Bank</strong> : Bank BCA<br/>
        <strong>Nomor Rekening</strong> : 1801608235<br/>
        <strong>Atas Nama</strong> : Jenny Nur Alfian Handayani
      </p>
    </div>
    
    <div class="signature-section">
      <div><strong>Penerima Barang</strong></div>
      <div class="signature-box"></div>
      <div class="signature-label">( Terima Kasih )</div>
    </div>

    <div class="signature-section">
      <div><strong>Hormat Kami</strong></div>
      <div class="signature-box"></div>
      <div class="signature-label">( CV Aqua Berkah Lestari )</div>
    </div>
  </div>
</body>
</html>
`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice_${data.noInvoice.replace(/\//g, "_")}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

export { generateInvoicePDF };
