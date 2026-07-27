import type { ReceiptPrintModel } from "@/print/types/ReceiptPrintModel";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateReceiptHTML(model: ReceiptPrintModel): string {
  const w = 32;

  const allItems = [
    ...model.fixedItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
    })),
    ...model.dynamicItems.map((item) => ({
      name: item.name,
      qty: item.quantity,
    })),
  ];

  const itemRows = allItems
    .map((item) => {
      const name = item.name.length > w - 5 ? item.name.slice(0, w - 5) : item.name;
      return `<tr><td>${escapeHtml(name)}</td><td class="dots"></td><td class="qty">${item.qty}</td></tr>`;
    })
    .join("");

  const notesSection = model.notes
    ? `<div class="section-title">CATATAN</div><div class="notes-block">${escapeHtml(model.notes).replace(/\n/g, "<br/>")}</div>`
    : "";

  const footerSection = model.footer
    ? `<div class="footer-block">${escapeHtml(model.footer).replace(/\n/g, "<br/>")}</div>`
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${model.receiptNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Consolas', 'Courier New', monospace;
      font-size: 11px;
      width: 58mm;
      padding: 3mm;
      color: #000;
      background: #fff;
      line-height: 1.3;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .outlet-name { font-size: 14px; font-weight: bold; text-align: center; margin-bottom: 1px; }
    .tx-number { font-size: 10px; text-align: center; margin-bottom: 3px; }
    .separator { border-top: 1px dashed #000; margin: 4px 0; }
    .info-row { margin-bottom: 1px; }
    .info-label { font-size: 10px; color: #333; }
    .info-value { font-size: 10px; font-weight: bold; }
    .section-title { font-size: 9px; font-weight: bold; margin-top: 4px; margin-bottom: 2px; text-transform: uppercase; }
    .item-table { width: 100%; border-collapse: collapse; font-size: 11px; table-layout: fixed; }
    .item-table td { padding: 1px 0; vertical-align: top; overflow: hidden; }
    .item-table td:nth-child(1) { width: 65%; }
    .item-table td:nth-child(2) { width: 20%; }
    .item-table td:nth-child(3) { width: 15%; }
    .dots { border-bottom: 1px dotted #999; }
    .qty { text-align: right; font-weight: bold; padding-left: 4px; }
    .total-row { margin-top: 4px; font-weight: bold; font-size: 13px; border-top: 1px dashed #000; padding-top: 3px; display: flex; justify-content: space-between; }
    .notes-block { font-size: 10px; margin-top: 3px; white-space: pre-wrap; }
    .footer-block { font-size: 9px; margin-top: 4px; color: #333; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="outlet-name">${escapeHtml(model.outletName)}</div>
  <div class="tx-number">${escapeHtml(model.receiptNumber)}</div>
  <div class="separator"></div>
  <div class="info-row"><span class="info-label">Pelanggan</span> <span class="info-value">${escapeHtml(model.customerName)}</span></div>
  <div class="info-row"><span class="info-label">Tanggal</span> <span class="info-value">${escapeHtml(formatDate(model.transactionDate))}</span></div>
  <div class="separator"></div>
  <div class="section-title">DAFTAR ITEM</div>
  <table class="item-table">${itemRows}</table>
  <div class="total-row"><span>TOTAL ITEM</span><span>${String(model.totalItemCount)}</span></div>
  ${notesSection}
  ${footerSection}
</body>
</html>`.trim();
}
