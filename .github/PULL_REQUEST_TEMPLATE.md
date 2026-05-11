## What changed

<!-- One or two sentences. The "why" matters more than the "what" — the diff shows the what. -->

## How was it tested

<!--
- Which `pnpm test` cases cover this?
- Any manual verification (specific dictation tool, specific paste target, etc.)?
-->

## Checklist

- [ ] `pnpm exec tsc --noEmit` passes
- [ ] `pnpm test` passes
- [ ] If `src/lib/editorBuilder.ts` changed: round-trip + undo + no-`<br />` specs still green
- [ ] If a new UI affordance was added: it has a keyboard shortcut OR a tooltip
- [ ] CHANGELOG.md updated under `[Unreleased]`
