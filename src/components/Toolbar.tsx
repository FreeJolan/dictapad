type Props = {
  pinned: boolean;
  onTogglePin: () => void;
  onCopyAndClear: () => void;
  onClearOnly: () => void;
};

/**
 * Floating overlay over the editor. The top 32px is the window drag
 * region (except for the action buttons). Clicks below this strip
 * land on the editor.
 */
export function Toolbar({
  pinned,
  onTogglePin,
  onCopyAndClear,
  onClearOnly,
}: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 h-8 flex items-center select-none z-10">
      {/* Whole left + middle strip is draggable */}
      <div data-tauri-drag-region className="flex-1 h-full" aria-hidden />
      {/* Action buttons sit outside the drag region so clicks reach them */}
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={onTogglePin}
          title={pinned ? "取消置顶  (⌘⇧P)" : "置顶  (⌘⇧P)"}
          aria-label={pinned ? "取消置顶" : "置顶"}
          aria-pressed={pinned}
          className={`w-6 h-6 grid place-items-center rounded transition-colors ${
            pinned
              ? "text-blue-500 hover:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-400/10"
              : "text-gray-400 hover:text-gray-600 hover:bg-black/5 dark:text-gray-500 dark:hover:text-gray-300 dark:hover:bg-white/10"
          }`}
        >
          <PinIcon active={pinned} />
        </button>
        <button
          type="button"
          onClick={onClearOnly}
          title="仅清空  (⌘⇧K)"
          aria-label="仅清空"
          className="w-6 h-6 grid place-items-center rounded text-gray-500 hover:text-gray-700 hover:bg-black/5 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-white/10 transition-colors"
        >
          <TrashIcon />
        </button>
        <button
          type="button"
          onClick={onCopyAndClear}
          title="复制并清空  (⌘⏎)"
          aria-label="复制并清空"
          className="h-6 px-2 inline-flex items-center gap-1 rounded bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-[11px] font-medium shadow-sm transition-colors"
        >
          <ClipboardIcon />
          <span>取走</span>
        </button>
      </div>
    </div>
  );
}

function PinIcon({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  );
}
