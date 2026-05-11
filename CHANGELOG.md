# Changelog

All notable changes to Dictapad. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.4] — 2026-05-11

### Verification

- First release where the entire bundle → sign → manifest → upload pipeline runs end-to-end inside the release workflow without manual touch-up. No user-facing changes.

## [0.1.3] — 2026-05-11

### Fixed

- Clicking **升级** while the editor still had un-saved keystrokes could lose up to ~1 second of recent edits (debounce + LazyStore autoSave race against the relaunch). Install now synchronously flushes the editor content to disk before triggering the download.
- Release workflow now self-signs the bundle and publishes `latest.json` itself instead of relying on tauri-action — that path silently no-ops for the universal binary target. v0.1.1 and v0.1.2 needed manual signing; v0.1.3 onward is fully automated.

## [0.1.2] — 2026-05-11

### Changed

- Release pipeline now auto-generates `latest.json` and uploads the bundle signature in the same workflow run. The manual fix-up that v0.1.1 needed is gone.

### Verification

- This release exists primarily to confirm the in-app updater flow end-to-end: v0.1.1 clients should see the banner on launch and complete the upgrade silently.

## [0.1.1] — 2026-05-11

### Added

- **In-app silent updates** via `tauri-plugin-updater`. On launch the app checks for a newer signed release on GitHub; if one exists, a small banner offers an "升级 / 忽略" choice. Picking "升级" downloads, replaces the binary, and relaunches — no manual download. Picking "忽略" suppresses the prompt for that version (will reappear when the next version ships).

### Changed

- Release pipeline now produces a single **universal macOS binary** (`--target universal-apple-darwin`) from a single `macos-14` runner. Replaces the previous arm64-/x64-split matrix that frequently waited 30+ minutes for an Intel runner. One `.dmg` runs natively on both architectures.

### Notes

- Users on v0.1.0 will need to manually install v0.1.1 once to pick up the updater — v0.1.0 doesn't ship with the updater plugin. From v0.1.1 onward, updates are in-app.

## [0.1.0] — 2026-05-11

Initial release.

### Added

- Always-on-top floating window (400×500, resizable, position remembered).
- Borderless layout with custom 32px toolbar (drag handle + action buttons).
- WYSIWYG Markdown editor (Milkdown + ProseMirror, CommonMark only).
- Primary action `⌘↵` — copy markdown to clipboard, clear buffer, re-focus.
- Secondary action `⌘⇧K` — clear only (confirmation prompt when non-empty).
- `⌘⇧P` — toggle always-on-top.
- `⌘W` — hide window (process keeps running).
- `⌘⇧Space` — global show/hide.
- Undo / redo (`⌘Z` / `⌘⇧Z`).
- Persistent buffer + window geometry + pinned state via `tauri-plugin-store`.
- Vitest + jsdom test harness exercising the production editor plugin stack:
  - `serialize → parse → serialize` round-trip is idempotent.
  - Undo restores prior state.
  - Output never contains `<br />` for typical content.

[Unreleased]: https://github.com/FreeJolan/dictapad/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.4
[0.1.3]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.3
[0.1.2]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.2
[0.1.1]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.1
[0.1.0]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.0
