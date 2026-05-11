import {
  defaultValueCtx,
  Editor as MilkdownEditor,
  rootCtx,
} from "@milkdown/core";
import {
  commands,
  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,
  inlineNodesCursorPlugin,
  inputRules,
  keymap as commonmarkKeymap,
  markInputRules,
  remarkAddOrderInListPlugin,
  remarkHtmlTransformer,
  remarkInlineLinkPlugin,
  remarkLineBreak,
  remarkMarker,
  schema,
  syncHeadingIdPlugin,
  syncListOrderPlugin,
} from "@milkdown/preset-commonmark";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { history, redo, undo } from "@milkdown/prose/history";
import { keymap } from "@milkdown/prose/keymap";
import { $prose } from "@milkdown/utils";

/**
 * The default `commonmark` preset bundles `remarkPreserveEmptyLinePlugin`,
 * which serializes empty paragraph nodes as literal `<br />` lines. That's
 * useful if you need to reconstruct the editor doc byte-for-byte, but
 * disastrous for our workflow — the user takes the markdown out and pastes
 * it into chat / a terminal / a doc, where `<br />` is just noise.
 *
 * We rebuild the preset minus that one plugin. Trade-off: pressing Enter
 * multiple times in a row no longer survives a round-trip — consecutive
 * empty paragraphs collapse into a single paragraph break. Visible content
 * is preserved; "I hit Enter five times" editing noise is not.
 */
const commonmarkWithoutEmptyLinePreservation = [
  schema,
  inputRules,
  markInputRules,
  commands,
  commonmarkKeymap,
  hardbreakClearMarkPlugin,
  hardbreakFilterNodes,
  hardbreakFilterPlugin,
  inlineNodesCursorPlugin,
  remarkAddOrderInListPlugin,
  remarkInlineLinkPlugin,
  remarkLineBreak,
  remarkHtmlTransformer,
  remarkMarker,
  syncHeadingIdPlugin,
  syncListOrderPlugin,
].flat();

/**
 * Single source of truth for the editor's plugin stack. The production
 * component and the test harness both go through this function so specs
 * exercise the exact pipeline the user touches.
 */
export function buildEditor(
  root: HTMLElement,
  initial: string,
  onMarkdownChange?: (markdown: string) => void,
) {
  const historyPlugin = $prose(() => history());
  const historyKeymap = $prose(() =>
    keymap({
      "Mod-z": undo,
      "Mod-y": redo,
      "Shift-Mod-z": redo,
    }),
  );

  return MilkdownEditor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root);
      ctx.set(defaultValueCtx, initial);
      if (onMarkdownChange) {
        ctx
          .get(listenerCtx)
          .markdownUpdated((_, markdown) => onMarkdownChange(markdown));
      }
    })
    .use(commonmarkWithoutEmptyLinePreservation)
    .use(listener)
    .use(historyPlugin)
    .use(historyKeymap);
}
