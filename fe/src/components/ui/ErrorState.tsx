type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry: () => void;
  compact?: boolean;
};

export function ErrorState({
  title = "Không thể tải dữ liệu",
  message,
  onRetry,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white text-center ${
        compact ? "px-5 py-6" : "px-6 py-12"
      }`}
      role="alert"
    >
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
      >
        Thử lại
      </button>
    </div>
  );
}
