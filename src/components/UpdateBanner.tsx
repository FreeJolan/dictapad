type Props = {
  visible: boolean;
  version: string;
  installing: boolean;
  onInstall: () => void;
  onIgnore: () => void;
};

/**
 * Small banner that floats above the editor when a newer signed build
 * is available on the GitHub release. Two actions: install now (silent
 * download + install + relaunch via tauri-plugin-updater) or ignore
 * this version (won't show again until the next bump).
 */
export function UpdateBanner({
  visible,
  version,
  installing,
  onInstall,
  onIgnore,
}: Props) {
  if (!visible) return null;
  return (
    <div className="absolute left-2 right-2 bottom-2 z-20 flex items-center gap-2 rounded-md bg-blue-500 text-white px-3 py-2 text-[12px] shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 5v14" />
        <path d="m19 12-7 7-7-7" />
      </svg>
      <span className="flex-1 truncate">
        新版本 v{version} 可用
      </span>
      <button
        type="button"
        onClick={onIgnore}
        disabled={installing}
        className="px-2 py-0.5 rounded text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        忽略
      </button>
      <button
        type="button"
        onClick={onInstall}
        disabled={installing}
        className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/25 disabled:opacity-60 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {installing ? "升级中…" : "升级"}
      </button>
    </div>
  );
}
