import { Editor, editorViewCtx } from "@milkdown/core";
import type { EditorView } from "@milkdown/prose/view";
import { buildEditor } from "../src/lib/editorBuilder";

/**
 * Mount the production editor (same plugin stack as the React component)
 * against a headless jsdom root so specs exercise the exact pipeline the
 * user sees.
 */
export async function createTestEditor(initial = ""): Promise<Editor> {
  const root = document.createElement("div");
  document.body.appendChild(root);
  return buildEditor(root, initial).create();
}

export function withView<T>(editor: Editor, fn: (view: EditorView) => T): T {
  let result: T;
  editor.action((ctx) => {
    const view = ctx.get(editorViewCtx);
    result = fn(view);
  });
  return result!;
}
