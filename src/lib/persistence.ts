import { LazyStore } from "@tauri-apps/plugin-store";
import { getCurrentWindow, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";

const store = new LazyStore("dictapad.json", { defaults: {}, autoSave: 500 });

const KEY_CONTENT = "content";
const KEY_WINDOW = "window";
const KEY_PINNED = "pinned";

type WindowState = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function loadContent(): Promise<string> {
  const value = await store.get<string>(KEY_CONTENT);
  return value ?? "";
}

export async function saveContent(content: string): Promise<void> {
  await store.set(KEY_CONTENT, content);
}

export async function clearContent(): Promise<void> {
  await store.set(KEY_CONTENT, "");
  await store.save();
}

export async function loadPinned(): Promise<boolean | null> {
  const value = await store.get<boolean>(KEY_PINNED);
  return value ?? null;
}

export async function savePinned(pinned: boolean): Promise<void> {
  await store.set(KEY_PINNED, pinned);
}

export async function loadWindowState(): Promise<WindowState | null> {
  const value = await store.get<WindowState>(KEY_WINDOW);
  return value ?? null;
}

export async function saveWindowState(state: WindowState): Promise<void> {
  await store.set(KEY_WINDOW, state);
}

let restored = false;

export async function restoreWindowGeometry(): Promise<void> {
  if (restored) return;
  restored = true;
  const state = await loadWindowState();
  if (!state) return;
  const win = getCurrentWindow();
  try {
    await win.setSize(new PhysicalSize(state.width, state.height));
    await win.setPosition(new PhysicalPosition(state.x, state.y));
  } catch {
    /* ignore — first run or invalid saved geometry */
  }
}

export function watchWindowGeometry(): () => void {
  const win = getCurrentWindow();
  let pending: ReturnType<typeof setTimeout> | null = null;
  const persist = () => {
    if (pending) clearTimeout(pending);
    pending = setTimeout(async () => {
      try {
        const pos = await win.outerPosition();
        const size = await win.outerSize();
        await saveWindowState({
          x: pos.x,
          y: pos.y,
          width: size.width,
          height: size.height,
        });
      } catch {
        /* ignore */
      }
    }, 250);
  };

  const unlistenResize = win.onResized(persist);
  const unlistenMove = win.onMoved(persist);

  return () => {
    unlistenResize.then((fn) => fn());
    unlistenMove.then((fn) => fn());
    if (pending) clearTimeout(pending);
  };
}
