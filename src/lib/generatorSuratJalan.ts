import { DetailData } from "@/types/interfaces/IBarangKeluar";

const ADMIN_CONFIG = {
  ABL: {
    companyName: "CV Aqua Berkah Lestari",
    logo: "/ABL.png",
    address:
      "Perumahan Griya Indah Pakis, Blok A No. 19, Sumberejo,\nKab. Banyuwangi, Jawa Timur, 68419",
    primaryColor: "#16548a",
    signatureName: "Affan NR",
  },
  ATM: {
    companyName: "CV Anugrah Tirta Makmur",
    logo: "/ATM.png",
    address:
      "Perumahan Griya Indah Pakis, Blok A No. 19, Sumberejo,\nKab. Banyuwangi, Jawa Timur, 68419",
    primaryColor: "#16548a",
    signatureName: "Affan NR",
  },
};

type Jabatan = "ABL" | "ATM";

const generateSuratJalanPDF = (data: DetailData, jabatan: Jabatan = "ABL") => {
  const config = ADMIN_CONFIG[jabatan];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surat Jalan ${data.noInvoice}</title>
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
      margin-bottom: 30px;
    }
    
    .logo-section {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      margin-top: -35px;
    }
    
    .logo {
      width: 120px;
      height: 120px;
      object-fit: cover;
      margin-bottom: 10px;
    }
    
    .company-address {
      font-size: 10px;
      line-height: 1.5;
      white-space: pre-line;
      max-width: 300px;
    }
    
    .title-section {
      text-align: center;
      flex: 1;
      padding: 0 20px;
    }
    
    .title-section h1 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .doc-number {
      font-size: 12px;
      margin-bottom: 10px;
    }
    
    .recipient-info {
      text-align: right;
      font-size: 11px;
      line-height: 1.6;
      min-width: 200px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    th {
      background-color: ${config.primaryColor};
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bold;
      border: 1px solid ${config.primaryColor};
      font-size: 11px;
    }
    
    td {
      padding: 8px;
      border: 1px solid #333;
      text-align: center;
      font-size: 11px;
    }
    
    td:first-child {
      width: 60px;
    }
    
    td:nth-child(2) {
      text-align: left;
    }
    
    td:last-child {
      width: 100px;
    }
    
    .total-row {
      font-weight: bold;
    }

    .total-row td {
      font-weight: bold;
      text-align: center;
    }

    .note-section {
      margin-bottom: 30px;
      font-size: 11px;
    }

    .note-section strong {
      font-style: italic;
    }

    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 50px;
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
        margin-bottom: 20px;
      }

      .logo {
        width: 60px;
        height: 60px;
      }

      .company-address {
        font-size: 9px;
      }

      .title-section {
        padding: 10px 0;
      }

      .title-section h1 {
        font-size: 16px;
      }

      .doc-number {
        font-size: 10px;
      }

      .recipient-info {
        width: 100%;
        text-align: left;
        font-size: 10px;
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

      .note-section {
        font-size: 9px;
      }

      .footer {
        flex-direction: column;
        gap: 30px;
        margin-top: 30px;
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
      }

      .logo {
        width: 50px;
        height: 50px;
      }

      .title-section h1 {
        font-size: 14px;
      }

      table {
        font-size: 8px;
      }

      th, td {
        padding: 4px 2px;
        font-size: 8px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-section">
      <img src="${config.logo}" alt="${config.companyName}" class="logo" />
      <div class="company-address">${config.address}</div>
    </div>
    
    <div class="title-section">
      <h1>SURAT JALAN</h1>
      <div class="doc-number">No. ${data.noSuratJalan}</div>
    </div>
    
    <div class="recipient-info">
      <div>Kepada</div>
      <div>${data.namaPelanggan}</div>
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>NO</th>
        <th>NAMA BARANG</th>
        <th>QTY</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.namaBarang}</td>
          <td>${item.jmlPembelian}</td>
        </tr>
      `
        )
        .join("")}
      ${Array.from(
        { length: Math.max(0, 8 - data.items.length) },
        (_, i) => `
        <tr>
          <td>&nbsp;</td>
          <td></td>
          <td></td>
        </tr>
      `
      ).join("")}
      <tr class="total-row">
        <td colspan="2">TOTAL</td>
        <td>${data.items.reduce((sum, item) => sum + item.jmlPembelian, 0)}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="note-section">
    <strong>Note:</strong><br/>
    Barang yang sudah dibeli tidak bisa dikembalikan
  </div>

  <div class="footer">
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

export { generateSuratJalanPDF };
