import { describe, expect, it } from "vitest";
import { getMarkdown } from "@milkdown/utils";
import { redo, undo } from "@milkdown/prose/history";
import { createTestEditor, withView } from "./createTestEditor";

/**
 * Property under test: after we apply a separable text edit on top of an
 * initial document and then run prosemirror-history's `undo`, the document
 * must return to its pre-edit state. This catches the regression where
 * history is not registered at all (undo becomes a no-op).
 */
describe("undo / redo", () => {
  it("undo restores the document to its pre-edit state", async () => {
    const editor = await createTestEditor("hello");
    const before = editor.action(getMarkdown());

    // Insert text at end of doc as a discrete history step.
    withView(editor, (view) => {
      const tr = view.state.tr.insertText(
        " world",
        view.state.doc.content.size - 1,
      );
      view.dispatch(tr);
    });
    const after = editor.action(getMarkdown());
    expect(after).not.toBe(before);
    expect(after).toContain("world");

    // Undo.
    withView(editor, (view) => {
      undo(view.state, view.dispatch);
    });

    const restored = editor.action(getMarkdown());
    expect(restored).toBe(before);
  });

  it("redo replays the undone edit", async () => {
    const editor = await createTestEditor("hello");
    withView(editor, (view) => {
      const tr = view.state.tr.insertText(
        " world",
        view.state.doc.content.size - 1,
      );
      view.dispatch(tr);
    });
    const afterEdit = editor.action(getMarkdown());

    withView(editor, (view) => {
      undo(view.state, view.dispatch);
    });
    withView(editor, (view) => {
      redo(view.state, view.dispatch);
    });

    const afterRedo = editor.action(getMarkdown());
    expect(afterRedo).toBe(afterEdit);
  });
});
