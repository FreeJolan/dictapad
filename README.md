# Dictapad

> A lightweight, always-on-top, WYSIWYG Markdown scratchpad — a relay station for voice dictation.

[![CI](https://github.com/FreeJolan/dictapad/actions/workflows/ci.yml/badge.svg)](https://github.com/FreeJolan/dictapad/actions/workflows/ci.yml)
[![Release](https://github.com/FreeJolan/dictapad/actions/workflows/release.yml/badge.svg)](https://github.com/FreeJolan/dictapad/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Voice-dictation tools (Typeless, Whisper, macOS Voice Control) drop text into whatever window is focused. Terminals don't let you click to position the caret, chat boxes scroll away, and you can't easily tweak a phrase before sending. Dictapad is the missing in-between: a tiny floating Markdown editor that catches dictation, lets you fix small mistakes with the mouse, and ships the cleaned-up text out with one shortcut.

The core loop is intentionally one button:

> **dictate → tweak → take it → dictate the next chunk**

`⌘↵` copies the buffer to the clipboard, empties the editor, and re-focuses it. That's it.

---

## Features

- **Silent in-app updates** — on launch the app checks for a newer signed release. One click installs and relaunches; "忽略" suppresses the prompt for that version.
- **Always on top** — sits on top of any window, toggleable from the toolbar (pin button) or `⌘⇧P`
- **Click-through-friendly UI** — borderless 400×500 window, custom 32px toolbar with drag handle
- **WYSIWYG Markdown** — CommonMark only (headings, lists, bold/italic, inline code, blockquote); no fenced code blocks, no tables, no surprises
- **Undo/redo** — full ProseMirror history (`⌘Z` / `⌘⇧Z`)
- **Round-trip safe output** — what you copy out parses back into the same document (validated by automated specs)
- **Persistent** — window position, size, pinned state, and unsent buffer all restored on next launch
- **Global toggle** — `⌘⇧Space` shows/hides the window from anywhere (best-effort; falls back silently if the shortcut is taken)

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `⌘↵` | Copy and clear (primary) |
| `⌘⇧K` | Clear only (asks for confirmation when non-empty) |
| `⌘⇧P` | Toggle always-on-top |
| `⌘W` | Hide window (process keeps running) |
| `⌘⇧Space` | Global show/hide |
| `⌘Z` / `⌘⇧Z` | Undo / redo |

## Install

Grab the latest macOS bundle from the [Releases](https://github.com/FreeJolan/dictapad/releases) page — a single universal `.dmg` runs natively on both Apple Silicon and Intel.

Open the `.dmg`, drag `Dictapad.app` into `/Applications`. The bundle is signed with an Apple Developer ID and notarized by Apple, so Gatekeeper lets it launch on the first try. After this first install, Dictapad updates itself in place from inside the app.

## Develop

```bash
pnpm install
pnpm tauri dev
```

First Rust compile takes a few minutes; subsequent starts are seconds.

### Useful scripts

| Command | What |
| --- | --- |
| `pnpm tauri dev` | Run the full app with HMR |
| `pnpm tauri build` | Produce a signed-no-thanks `.app` + `.dmg` |
| `pnpm test` | Run all Vitest specs (round-trip + undo) once |
| `pnpm test:watch` | Watch mode |
| `pnpm build` | Frontend-only build + typecheck (no Rust) |

### Stack

| Layer | Tool | Version |
| --- | --- | --- |
| Shell | [Tauri](https://tauri.app) | 2 |
| UI | React + TypeScript | 18 / 5 |
| Editor | [Milkdown](https://milkdown.dev) (ProseMirror) — commonmark preset only | 7 |
| Styling | Tailwind CSS | 3 |
| Test | Vitest + jsdom | 2 / 25 |
| Build | Vite | 5 |

## Layout

```
dictapad/
├── src/
│   ├── App.tsx                  top-level wiring, shortcuts, persistence
│   ├── main.tsx
│   ├── index.css                Tailwind base + Milkdown editor styles
│   ├── components/
│   │   ├── Editor.tsx           Milkdown wrapper (React)
│   │   ├── Toolbar.tsx          overlay toolbar with drag region + buttons
│   │   └── Toast.tsx
│   └── lib/
│       ├── editorBuilder.ts     plugin stack — single source of truth, shared
│       │                        with tests so specs exercise the real pipeline
│       └── persistence.ts       content + window geometry + pinned state
├── tests/
│   ├── createTestEditor.ts      headless editor used by all specs
│   ├── roundtrip.test.ts        serialize → parse → serialize idempotent
│   ├── undo.test.ts             history plugin actually wired up
│   └── no-br.test.ts            regression: `<br />` never leaks into output
├── src-tauri/
│   ├── tauri.conf.json          alwaysOnTop, decorations:false, transparent
│   ├── capabilities/default.json
│   ├── Cargo.toml
│   └── src/{main,lib}.rs        plugin registration only
└── .github/workflows/
    ├── ci.yml                   typecheck + tests on PR
    └── release.yml              tag push → macOS bundles → GH release
```

## Design notes

- **No "copy without clear"** — that breaks the explicit "take it and move on" workflow.
- **No file management, tabs, or settings panel** — it's a scratch buffer, not a notes app.
- **CommonMark only** — tables, fenced code blocks, math, images are intentionally disabled. If you need them, you've outgrown this tool.
- **Plugin stack is shared between production and tests** (`src/lib/editorBuilder.ts`). Adding a new Milkdown plugin or rule automatically subjects it to the same round-trip and undo invariants the user sees.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE).
