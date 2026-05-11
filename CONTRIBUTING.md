# Contributing

Thanks for considering a contribution. Dictapad is intentionally small — the goal is to stay small. Read this first to understand what fits.

## What fits

- **Bug fixes** in the editor pipeline, the Tauri shell, or the build.
- **Quality-of-life polish** that doesn't expand the workflow: better keyboard ergonomics, accessibility, edge-case handling around dictation input.
- **Cross-platform fixes** — Linux and Windows aren't covered by releases yet, but the code already aims to be portable.
- **Better tests.** The round-trip property is the most important invariant; new specs that pin down related behaviors are welcome.

## What doesn't fit

- File management, tabs, multiple buffers
- Cloud sync, accounts, end-to-end encryption
- Markdown features beyond CommonMark (tables, fenced code blocks, math, image embeds, link previews)
- A settings panel
- A second pane / source-view / preview mode

If you have a great idea that doesn't fit, please open an issue first to discuss before writing code — saves time on both sides.

## Workflow

```bash
pnpm install
pnpm tauri dev     # the live app
pnpm test:watch    # the specs
```

Before you push:

```bash
pnpm exec tsc --noEmit
pnpm test
pnpm build         # frontend-only build sanity check
```

CI runs the same three checks on every PR.

## Editor plugin invariant

`src/lib/editorBuilder.ts` is the **single source of truth** for the editor's plugin stack — both the React component (`src/components/Editor.tsx`) and the headless test harness (`tests/createTestEditor.ts`) feed off it.

If you touch this file:

- The round-trip specs (`tests/roundtrip.test.ts`) **must** still pass. Any plugin that breaks `serialize → parse → serialize` idempotency does not land.
- The `<br />` regression spec (`tests/no-br.test.ts`) **must** still pass. We removed `remarkPreserveEmptyLinePlugin` for a reason; if you put it back, justify it in the PR.
- The undo spec (`tests/undo.test.ts`) **must** still pass. Don't remove `prosemirror-history`.

If your change requires breaking one of these, that's a conversation, not a unilateral change.

## Code style

- TypeScript strict mode, no implicit any.
- Functional components + hooks only.
- No comments restating what the code does; only comments that explain *why* — hidden constraints, subtle invariants, workarounds for specific bugs.
- One commit per logical change.

## Releasing (maintainers)

1. Bump version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json` (keep all three in sync).
2. Update `CHANGELOG.md`.
3. Commit, then `git tag vX.Y.Z && git push --tags`.
4. The release workflow builds macOS arm64 + x64 bundles and attaches them to a draft release. Edit the draft, publish.
