type Props = {
  visible: boolean;
  message: string;
};

export function Toast({ visible, message }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 px-3 py-1.5 rounded-md text-[12px] text-white bg-black/75 dark:bg-white/15 shadow-lg backdrop-blur-sm transition-all duration-200 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-1"
      }`}
    >
      {message}
    </div>
  );
}
