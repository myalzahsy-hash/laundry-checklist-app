interface ErrorViewProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export default function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  return (
    <section className="flex flex-col items-center bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] p-6 sm:p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
      <div
        className="text-sm text-gray-500 mb-6 text-left"
        dangerouslySetInnerHTML={{ __html: message }}
      />
      <button
        type="button"
        onClick={onRetry}
        className="w-full bg-gray-900 text-white rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-800 active:scale-[0.98] transition-all"
      >
        Coba Lagi
      </button>
    </section>
  );
}
