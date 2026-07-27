export default function LoadingView() {
  return (
    <section className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-8">
      <div className="relative mb-5">
        <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-gray-900 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-gray-800">Mencari data...</p>
      <p className="text-xs text-gray-400 mt-1">Memproses permintaan Anda.</p>
    </section>
  );
}
