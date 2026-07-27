import { type FormEvent, useRef, useImperativeHandle, forwardRef } from "react";

interface SearchFormProps {
  outletName: string;
  searchLoading: boolean;
  monthOptions: Array<{ value: string; label: string }>;
  defaultMonth: string;
  onSearch: (monthKey: string, receiptSequence: number) => void;
}

export interface SearchFormHandle {
  focusNota: () => void;
}

const SearchForm = forwardRef<SearchFormHandle, SearchFormProps>(function SearchForm(
  { outletName, searchLoading, monthOptions, defaultMonth, onSearch },
  ref,
) {
  const bulanRef = useRef<HTMLSelectElement>(null);
  const notaRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useImperativeHandle(ref, () => ({
    focusNota() {
      notaRef.current?.focus();
    },
  }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const monthKey = bulanRef.current?.value ?? "";
    const rawNota = notaRef.current?.value ?? "";
    if (!monthKey) return;

    const trimmed = rawNota.trim();
    if (!trimmed) {
      showNotaError("Nomor transaksi harus diisi.");
      return;
    }
    const sequence = parseInt(trimmed, 10);
    if (isNaN(sequence) || sequence < 1) {
      showNotaError("Nomor transaksi tidak valid.");
      return;
    }
    onSearch(monthKey, sequence);
  }

  function showNotaError(msg: string) {
    if (errorRef.current) {
      errorRef.current.textContent = msg;
      errorRef.current.classList.remove("hidden");
    }
    notaRef.current?.focus();
  }

  function handleBlur() {
    const input = notaRef.current;
    if (!input) return;
    const val = input.value.trim();
    if (val.length > 0 && val.length < 5) {
      input.value = val.padStart(5, "0");
    }
  }

  function handleNotaInput() {
    if (errorRef.current && !errorRef.current.classList.contains("hidden")) {
      errorRef.current.classList.add("hidden");
    }
  }

  return (
    <section className="flex flex-col bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
          {outletName}
        </h1>
        <p className="text-sm text-gray-400 mt-1.5 font-medium">Cek Rekap Item Laundry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="portal-input-bulan" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Bulan &amp; Tahun
          </label>
          <select
            ref={bulanRef}
            id="portal-input-bulan"
            required
            defaultValue={defaultMonth}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all appearance-none font-medium"
          >
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="portal-input-nota" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Nomor Transaksi
          </label>
          <input
            ref={notaRef}
            type="number"
            id="portal-input-nota"
            required
            inputMode="numeric"
            maxLength={5}
            placeholder="Contoh: 00078"
            onBlur={handleBlur}
            onInput={handleNotaInput}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent focus:bg-white transition-all placeholder-gray-400 font-mono tracking-wider"
          />
          <p
            ref={errorRef}
            className="hidden text-[11px] text-red-500 mt-1.5 ml-1"
          />
          <p className="text-[11px] text-gray-400 mt-1.5 ml-1 leading-relaxed">
            Contoh nomor nota:
            <br />
            TRX/260727/00015
            <br />
            Masukkan cukup: <span className="font-mono font-medium text-gray-500">00015</span>
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={searchLoading}
            className={`w-full bg-gray-900 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] focus:ring-4 focus:ring-gray-200 transition-all flex justify-center items-center gap-2 ${searchLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {searchLoading ? "Mencari..." : "Cari Data"}
          </button>
        </div>
      </form>
    </section>
  );
});

export default SearchForm;
