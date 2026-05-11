# Changelog

All notable changes to Dictapad. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/FreeJolan/dictapad/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/FreeJolan/dictapad/releases/tag/v0.1.0
