import { formatDate } from "@/shared/lib/utils";

interface ItemRow {
  label: string;
  qty: number;
}

interface ReceiptViewProps {
  outletName: string;
  receiptNumber: string;
  customerName: string;
  transactionDate: Date | null;
  items: ItemRow[];
  totalItems: number;
  notes: string;
  onBack: () => void;
}

export default function ReceiptView({
  outletName,
  receiptNumber,
  customerName,
  transactionDate,
  items,
  totalItems,
  notes,
  onBack,
}: ReceiptViewProps) {
  const tanggalText = transactionDate
    ? formatDate(transactionDate)
    : "-";

  return (
    <section className="flex flex-col bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="bg-gray-900 text-white px-6 py-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">
          {outletName}
        </p>
        <p className="text-[11px] text-gray-500 font-medium">Rekap Item Laundry</p>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">No. Transaksi</p>
            <p className="font-semibold text-gray-900 font-mono">{receiptNumber}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Tanggal Masuk</p>
            <p className="font-semibold text-gray-900">{tanggalText}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Pelanggan</p>
            <p className="font-semibold text-gray-900 uppercase">{customerName}</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-5">
        <div className="border-t border-gray-100 pt-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Rincian Item</p>
          <div className="space-y-0">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2.5"
              >
                <span className="text-gray-500 text-sm">{item.label}</span>
                <span className="font-bold text-gray-900 text-sm">{item.qty}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center py-4 border-t-2 border-gray-900 mt-4">
          <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Total Item</span>
          <span className="text-2xl font-extrabold text-gray-900">{totalItems}</span>
        </div>

        {notes && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Catatan</p>
            <p className="text-sm text-gray-900 leading-relaxed">{notes}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        <button
          type="button"
          onClick={onBack}
          className="w-full bg-gray-100 text-gray-700 rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-200 active:scale-[0.98] transition-all"
        >
          Kembali
        </button>
      </div>
    </section>
  );
}
