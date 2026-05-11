import { describe, expect, it } from "vitest";
import { getMarkdown } from "@milkdown/utils";
import { createTestEditor, withView } from "./createTestEditor";

/**
 * Regression: the `<br />` placeholder for empty paragraphs is editor
 * implementation noise. It should never end up in the markdown the user
 * pastes elsewhere.
 */
describe("serialized output never contains <br />", () => {
  it("clean output from plain content with blank lines", async () => {
    const editor = await createTestEditor(
      "first paragraph\n\nsecond paragraph\n\nthird",
    );
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("<br />");
  });

  it("output stays clean even when the editor doc has consecutive empty paragraphs", async () => {
    const editor = await createTestEditor("first\n\nsecond");
    withView(editor, (view) => {
      const paragraph = view.state.schema.nodes.paragraph;
      const splitPos = view.state.doc.firstChild!.nodeSize;
      let tr = view.state.tr;
      tr = tr.insert(splitPos, paragraph.create());
      tr = tr.insert(splitPos, paragraph.create());
      tr = tr.insert(splitPos, paragraph.create());
      view.dispatch(tr);
    });
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("<br />");
    expect(md).toContain("first");
    expect(md).toContain("second");
  });

  it("the user's reported buggy content survives the trip", async () => {
    const editor = await createTestEditor(
      [
        "嗨，以下是一个购物清单：",
        "",
        "1. a",
        "2. 2",
        "3. 4",
        "4. 5",
        "",
        "* mm",
        "* 44",
        "* 5",
        "",
        "`22`",
      ].join("\n"),
    );
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("<br />");
    // Lists preserved.
    expect(md).toContain("1. a");
    expect(md).toContain("* mm");
    // Inline code preserved.
    expect(md).toContain("`22`");
  });
});
