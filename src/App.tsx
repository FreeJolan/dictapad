import { useCallback, useEffect, useRef, useState } from "react";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { ask } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  register,
  unregister,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { Editor, type EditorHandle } from "./components/Editor";
import { Toolbar } from "./components/Toolbar";
import { Toast } from "./components/Toast";
import {
  clearContent,
  loadContent,
  loadPinned,
  restoreWindowGeometry,
  saveContent,
  savePinned,
  watchWindowGeometry,
} from "./lib/persistence";

const SAVE_DEBOUNCE_MS = 500;
const TOAST_DURATION_MS = 1000;
const GLOBAL_TOGGLE_SHORTCUT = "CommandOrControl+Shift+Space";

export default function App() {
  const editorRef = useRef<EditorHandle>(null);
  const [initialValue, setInitialValue] = useState<string | null>(null);
  const [pinned, setPinned] = useState<boolean>(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({
    visible: false,
    message: "",
  });
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial bootstrap: load persisted content + pinned state, restore window geometry.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [content, persistedPinned] = await Promise.all([
        loadContent(),
        loadPinned(),
        restoreWindowGeometry(),
      ]);
      if (cancelled) return;
      setInitialValue(content);
      if (persistedPinned !== null) {
        setPinned(persistedPinned);
        try {
          await getCurrentWindow().setAlwaysOnTop(persistedPinned);
        } catch {
          /* ignore */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist window position/size after restore.
  useEffect(() => {
    if (initialValue === null) return;
    return watchWindowGeometry();
  }, [initialValue]);

  // Auto-focus the editor once the initial content is mounted so the user
  // can start dictating immediately.
  useEffect(() => {
    if (initialValue === null) return;
    const id = window.setTimeout(() => editorRef.current?.focusAtEnd(), 0);
    return () => window.clearTimeout(id);
  }, [initialValue]);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ visible: true, message });
    toastTimerRef.current = setTimeout(() => {
      setToast((t) => ({ ...t, visible: false }));
    }, TOAST_DURATION_MS);
  }, []);

  const handleChange = useCallback((markdown: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void saveContent(markdown);
    }, SAVE_DEBOUNCE_MS);
  }, []);

  const handleCopyAndClear = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const markdown = editor.getMarkdown();
    if (markdown.trim().length === 0) return;
    await writeText(markdown);
    editor.replaceAll("");
    await clearContent();
    editor.focusAtEnd();
    showToast("已复制并清空");
  }, [showToast]);

  const handleClearOnly = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    if (!editor.isEmpty()) {
      const confirmed = await ask("确认清空当前内容?", {
        title: "Dictapad",
        kind: "warning",
        okLabel: "清空",
        cancelLabel: "取消",
      });
      if (!confirmed) return;
    }
    editor.replaceAll("");
    await clearContent();
    editor.focusAtEnd();
  }, []);

  const handleHideWindow = useCallback(async () => {
    try {
      await getCurrentWindow().hide();
    } catch {
      /* ignore */
    }
  }, []);

  const handleTogglePin = useCallback(async () => {
    const next = !pinned;
    try {
      await getCurrentWindow().setAlwaysOnTop(next);
      setPinned(next);
      void savePinned(next);
      showToast(next ? "已置顶" : "已取消置顶");
    } catch (err) {
      console.error("setAlwaysOnTop failed:", err);
    }
  }, [pinned, showToast]);

  // Keyboard shortcuts (window-scoped).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleCopyAndClear();
        return;
      }

      if (e.shiftKey && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        void handleClearOnly();
        return;
      }

      if (!e.shiftKey && (e.key === "w" || e.key === "W")) {
        e.preventDefault();
        void handleHideWindow();
        return;
      }

      if (e.shiftKey && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        void handleTogglePin();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCopyAndClear, handleClearOnly, handleHideWindow, handleTogglePin]);

  // When the window regains focus from outside, jump cursor to end so the
  // next dictation chunk appends to existing text.
  useEffect(() => {
    if (initialValue === null) return;
    const onFocus = () => {
      if (document.activeElement?.tagName === "BUTTON") return;
      editorRef.current?.focusAtEnd();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [initialValue]);

  // Optional global shortcut to toggle window visibility.
  useEffect(() => {
    let registered = false;
    (async () => {
      try {
        if (await isRegistered(GLOBAL_TOGGLE_SHORTCUT)) {
          await unregister(GLOBAL_TOGGLE_SHORTCUT);
        }
        await register(GLOBAL_TOGGLE_SHORTCUT, async (event) => {
          if (event.state !== "Pressed") return;
          const win = getCurrentWindow();
          const visible = await win.isVisible();
          if (visible) {
            await win.hide();
          } else {
            await win.show();
            await win.setFocus();
            editorRef.current?.focusAtEnd();
          }
        });
        registered = true;
      } catch {
        /* permission may not be granted or another app holds it — skip silently */
      }
    })();
    return () => {
      if (!registered) return;
      void unregister(GLOBAL_TOGGLE_SHORTCUT).catch(() => {});
    };
  }, []);

  if (initialValue === null) {
    return <div className="h-full" />;
  }

  return (
    <div className="relative h-full w-full">
      <Editor
        ref={editorRef}
        initialValue={initialValue}
        onChange={handleChange}
      />
      <Toolbar
        pinned={pinned}
        onTogglePin={handleTogglePin}
        onCopyAndClear={handleCopyAndClear}
        onClearOnly={handleClearOnly}
      />
      <Toast visible={toast.visible} message={toast.message} />
    </div>
  );
}
