import { DetailData } from "@/types/interfaces/IBarangKeluar";
import { formatCurrency, formatDate } from "./utils";

const ADMIN_CONFIG = {
  ABL: {
    companyName: "CV Aqua Berkah Lestari",
    companyShort: "CV AQUA\nBERKAH\nLESTARI",
    logo: "/ABL.png",
    address:
      "Perumahan Griya Indah Pakis, Sumberejo,\nKab. Banyuwangi, Jawa Timur, 68419",
    bank: "Bank BCA",
    accountNumber: "1801608235",
    accountName: "Jenny Nur Alfian Handayani",
    primaryColor: "#0066cc",
    secondaryColor: "#0099ff",
    accentColor: "#ff6600",
    signatureName: "Affan NR",
  },
  ATM: {
    companyName: "CV Anugrah Tirta Makmur",
    companyShort: "CV ANUGRAH\nTIRTA\nMAKMUR",
    logo: "/ATM.png",
    address:
      "Perumahan Griya Indah Pakis, Sumberejo,\nKab. Banyuwangi, Jawa Timur, 68419",
    bank: "Bank BCA",
    accountNumber: "1801608235",
    accountName: "Jenny Nur Alfian Handayani",
    primaryColor: "#0066cc",
    secondaryColor: "#0099ff",
    accentColor: "#ff6600",
    signatureName: "Affan NR",
  },
};

type Jabatan = "ABL" | "ATM";

const generateInvoicePDF = (data: DetailData, jabatan: Jabatan = "ABL") => {
  const config = ADMIN_CONFIG[jabatan];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.noInvoice}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 40px;
      }
      
      @page {
        size: A4;
      }
      
      th {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }
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
    }
    
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: -35px;
    }
    
    .logo {
      width: 160px;
      height: 160px;
      object-fit: cover;
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
      white-space: pre-line;
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

    .info-grid {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: end;
      margin-bottom: 20px;
      gap: 15px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th {
      background-color: ${config.primaryColor};
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bolder;
      border: 1px solid #333;
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
      text-align: center;
    }

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

    /* Mobile Responsive */
    @media screen and (max-width: 768px) {
      body {
        padding: 20px;
        font-size: 10px;
      }

      .header {
        flex-direction: column;
        gap: 15px;
      }

      .logo-section {
        margin-top: 0;
        width: 100%;
      }

      .logo {
        width: 120px;
        height: 120px;
      }

      .invoice-title {
        padding: 10px 0;
      }

      .invoice-title h1 {
        font-size: 24px;
      }

      .invoice-number {
        font-size: 12px;
      }

      .header-right {
        width: 100%;
        font-size: 10px;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .company-address {
        font-size: 10px;
      }

      .due-date-box {
        font-size: 11px;
        padding: 6px 10px;
      }

      table {
        font-size: 9px;
      }

      th {
        padding: 6px 4px;
        font-size: 9px;
      }

      td {
        padding: 5px 3px;
        font-size: 9px;
      }

      .total-row td {
        font-size: 11px;
        padding: 8px;
      }

      .footer {
        grid-template-columns: 1fr;
        gap: 20px;
        margin-top: 20px;
      }

      .payment-details h3 {
        font-size: 11px;
      }

      .payment-details p {
        font-size: 9px;
      }

      .signature-box {
        width: 150px;
        padding-top: 50px;
      }

      .signature-label {
        font-size: 9px;
      }
    }

    @media screen and (max-width: 480px) {
      body {
        padding: 15px;
        font-size: 9px;
      }

      .logo {
        width: 100px;
        height: 100px;
      }

      .invoice-title h1 {
        font-size: 20px;
      }

      table {
        font-size: 8px;
      }

      th, td {
        padding: 4px 2px;
        font-size: 8px;
      }

      .total-row td {
        font-size: 10px;
        padding: 6px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <img src="${config.logo}" alt="${config.companyName}" class="logo" />
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
  
  <div class="info-grid">
    <div class="company-address">
      <strong>${config.address}</strong>
    </div>

    <div class="due-date-box">
      <strong>Jatuh Tempo :</strong> ${formatDate(data.jatuhTempo)}
    </div>
  </div>
  
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
      ${data.items
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.namaBarang}</td>
          <td>${item.jmlPembelian} </td>
          <td>${formatCurrency(item.hargaJual)}</td>
          <td>${formatCurrency(item.subtotal)}</td>
        </tr>
      `
        )
        .join("")}
      ${Array.from(
        { length: Math.max(0, 15 - data.items.length) },
        (_, i) => `
        <tr>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      `
      ).join("")}
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
        <strong>Nama Bank</strong> : ${config.bank}<br/>
        <strong>Nomor Rekening</strong> : ${config.accountNumber}<br/>
        <strong>Atas Nama</strong> : ${config.accountName}
      </p>
    </div>
    
    <div class="signature-section">
      <div><strong>Penerima Barang</strong></div>
      <div class="signature-box"></div>
      <div class="signature-label">( ${data.namaPelanggan} )</div>
    </div>

    <div class="signature-section">
      <div><strong>Hormat Kami</strong></div>
      <div class="signature-box"></div>
      <div class="signature-label">( ${config.signatureName} )</div>
    </div>
  </div>

</body>
</html>
`;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    let printWindow = window.open("", "_blank");

    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();

      let isPrintStarted = false;

      printWindow.onbeforeprint = () => {
        isPrintStarted = true;
      };

      const handleFocus = () => {
        if (isPrintStarted && !printWindow?.closed) {
          setTimeout(() => {
            printWindow?.close();
          }, 100);
        }
        window.removeEventListener("focus", handleFocus);
      };

      window.addEventListener("focus", handleFocus);

      const checkClosed = setInterval(() => {
        if (!printWindow || printWindow.closed) {
          clearInterval(checkClosed);
          window.removeEventListener("focus", handleFocus);
        }
      }, 500);

      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
          window.removeEventListener("focus", handleFocus);
          clearInterval(checkClosed);
        }
      }, 20000);

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow?.focus();
          printWindow?.print();
        }, 250);
      };
    }

    return;
  }

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";

  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;

  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();

          const handleAfterPrint = () => {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 100);
          };

          iframe.contentWindow.onafterprint = handleAfterPrint;
          iframe.contentWindow.onbeforeunload = handleAfterPrint;

          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 3000);
        }
      }, 250);
    };
  }
};

export { generateInvoicePDF };
