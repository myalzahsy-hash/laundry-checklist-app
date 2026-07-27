import type { ReceiptPrintModel } from "@/print/types/ReceiptPrintModel";

// Kapasitas fisik 1 baris kertas thermal 58mm (font normal ESC/POS, RONGTA).
const PAPER_WIDTH = 32;
// Margin kiri & kanan yang sengaja disisakan supaya teks tidak mepet ke tepi
// kertas. Naikkan angka ini kalau masih mau margin lebih lebar lagi.
const MARGIN = 2;
// Lebar konten efektif untuk baris rata kiri (item, TOTAL, garis pemisah).
const LINE_WIDTH = PAPER_WIDTH - MARGIN * 2; // 28
const INDENT = " ".repeat(MARGIN);
// Lebar efektif saat font digandakan (nama pelanggan) — dihitung dari lebar
// kertas penuh karena baris ini rata tengah (dipusatkan otomatis oleh printer).
const DOUBLE_WIDTH = Math.floor(PAPER_WIDTH / 2);

const ESC = "\x1B";
const GS = "\x1D";

const CMD = {
  INIT: `${ESC}\x40`,
  ALIGN_LEFT: `${ESC}\x61\x00`,
  ALIGN_CENTER: `${ESC}\x61\x01`,
  BOLD_ON: `${ESC}\x45\x01`,
  BOLD_OFF: `${ESC}\x45\x00`,
  DOUBLE_ON: `${GS}\x21\x11`,
  DOUBLE_OFF: `${GS}\x21\x00`,
  // Font B (kondensasi/kecil) — dipakai untuk catatan & footer. Kalau printer
  // tidak mendukung Font B, command ini umumnya diabaikan dan tetap pakai Font A.
  FONT_SMALL_ON: `${ESC}\x4D\x01`,
  FONT_SMALL_OFF: `${ESC}\x4D\x00`,
  CUT: `${ESC}\x69`,
};

// Garis pemisah (strip), sudah termasuk indent kiri.
const SEPARATOR = `${INDENT}${"-".repeat(LINE_WIDTH)}\n`;

/** Baris rata kiri-kanan dengan indent, mis. "  Pakaian                  15". */
function padLine(left: string, right: string | number, width = LINE_WIDTH): string {
  const rightStr = String(right);
  let sisa = width - left.length - rightStr.length;
  if (sisa < 1) {
    // Nama terlalu panjang untuk muat bersama qty; potong nama, bukan qty.
    const maxLeft = Math.max(width - rightStr.length - 1, 1);
    left = left.slice(0, maxLeft);
    sisa = width - left.length - rightStr.length;
  }
  return `${INDENT}${left}${" ".repeat(sisa)}${rightStr}\n`;
}

/** Baris rata kiri-kanan dengan leader titik-titik, mis. "  CD/Celana Dalam .... 2". */
function padLineDots(left: string, right: string | number, width = LINE_WIDTH): string {
  const rightStr = String(right);
  let sisa = width - left.length - rightStr.length;
  if (sisa < 1) {
    const maxLeft = Math.max(width - rightStr.length - 1, 1);
    left = left.slice(0, maxLeft);
    sisa = width - left.length - rightStr.length;
  }
  return `${INDENT}${left}${".".repeat(sisa)}${rightStr}\n`;
}

/** Word-wrap sederhana untuk teks bebas (nama, notes, footer) ke lebar tertentu. */
function wrapText(text: string, width = LINE_WIDTH): string[] {
  const lines: string[] = [];
  for (const rawLine of text.split("\n")) {
    if (rawLine.length <= width) {
      lines.push(rawLine);
      continue;
    }
    let current = "";
    for (const word of rawLine.split(" ")) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > width) {
        if (current) lines.push(current);
        current = word;
        while (current.length > width) {
          lines.push(current.slice(0, width));
          current = current.slice(width);
        }
      } else {
        current = candidate;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export function generateReceiptCommands(model: ReceiptPrintModel): string[] {
  const allItems = [
    ...model.fixedItems.map((item) => ({ name: item.name, qty: item.quantity })),
    ...model.dynamicItems.map((item) => ({ name: item.name, qty: item.quantity })),
  ];

  const commands: string[] = [CMD.INIT];

  // Header: "LAUNDRY CHECKLIST" (tebal) + nama outlet (normal)
  commands.push(CMD.ALIGN_CENTER);
  commands.push(CMD.BOLD_ON);
  commands.push("LAUNDRY CHECKLIST\n");
  commands.push(CMD.BOLD_OFF);
  commands.push(`${model.outletName}\n`);
  commands.push("\n");

  // Nama pelanggan besar & tebal, tanpa label "Pelanggan"
  commands.push(CMD.BOLD_ON);
  commands.push(CMD.DOUBLE_ON);
  wrapText(model.customerName, DOUBLE_WIDTH).forEach((l) => commands.push(`${l}\n`));
  commands.push(CMD.DOUBLE_OFF);
  commands.push(CMD.BOLD_OFF);

  // Nomor struk (tanpa tanggal)
  commands.push(`\n${model.receiptNumber}\n`);
  commands.push(CMD.ALIGN_LEFT);

  // Daftar item, rata kiri, dengan leader titik-titik
  allItems.forEach((item) => {
    commands.push(padLineDots(item.name, item.qty));
  });

  // Total item, diapit garis pemisah di atas & bawah
  commands.push(SEPARATOR);
  commands.push(CMD.BOLD_ON);
  commands.push(padLine("TOTAL ITEM", model.totalItemCount));
  commands.push(CMD.BOLD_OFF);
  commands.push(SEPARATOR);

  // Catatan & footer: di bawah TOTAL ITEM, rata kiri, font kecil (Font B)
  if (model.notes || model.footer) {
    commands.push(CMD.FONT_SMALL_ON);
    commands.push(CMD.ALIGN_LEFT);
    if (model.notes) {
      wrapText(model.notes).forEach((l) => commands.push(`${INDENT}${l}\n`));
    }
    if (model.notes && model.footer) {
      commands.push("\n");
    }
    if (model.footer) {
      wrapText(model.footer).forEach((l) => commands.push(`${INDENT}${l}\n`));
    }
    commands.push(CMD.FONT_SMALL_OFF);
  }

  // Feed sebelum sobek/potong + cut otomatis (jika printer mendukung autocutter).
  // 3 baris biasanya cukup untuk RONGTA menghindari pisau memotong teks terakhir.
  // Kalau ternyata masih kepotong/mepet, naikkan lagi ke 4.
  commands.push("\n\n\n");
  commands.push(CMD.CUT);

  return commands;
}
