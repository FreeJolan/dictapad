import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

/**
 * Probe Tauri's updater endpoint for a newer signed bundle. Returns null
 * on any failure (offline, no release yet, signature mismatch) — the
 * update notification is opportunistic and must never throw into the
 * user's session.
 */
export async function checkForUpdate(): Promise<Update | null> {
  try {
    const update = await check();
    return update?.available ? update : null;
  } catch {
    return null;
  }
}

/**
 * Download the bundle, replace the running binary, and restart the app.
 * The plugin signals progress events; we keep this opaque (no progress
 * UI) per the "simple" design brief.
 */
export async function downloadAndInstall(update: Update): Promise<void> {
  await update.downloadAndInstall();
  await relaunch();
}
