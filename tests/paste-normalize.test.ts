import { describe, expect, it } from "vitest";
import { getMarkdown } from "@milkdown/utils";
import type { Editor } from "@milkdown/core";
import { createTestEditor, withView } from "./createTestEditor";

/**
 * Drive the editor through the same code path a real paste event triggers:
 * ProseMirror calls `clipboardTextParser(text, $context, plain, view)` to
 * convert plain-text clipboard contents into a Slice, then inserts that
 * Slice at the selection.
 *
 * `someProp` is the documented way to fetch a prop from the view + its
 * plugins, so we're exercising exactly what production hits at paste time.
 */
function pasteText(editor: Editor, text: string): void {
  withView(editor, (view) => {
    const parser = view.someProp("clipboardTextParser");
    if (!parser) {
      throw new Error("clipboardTextParser not installed on the editor view");
    }
    const $context = view.state.selection.$from;
    const slice = parser(text, $context, true, view);
    view.dispatch(view.state.tr.replaceSelection(slice));
  });
}

/**
 * Property under test: text pasted into the editor lands in the doc as the
 * markdown structure it represents, so a subsequent serialize produces the
 * canonical form without `\.` / `&#x20;` / `<br />` defensive escapes. This
 * is the invariant that lets the user paste the buffer into a terminal or
 * another markdown editor and see clean output.
 */
describe("paste pipeline normalizes input to markdown structure", () => {
  it("plain `1. foo` becomes an ordered list, not an escaped paragraph", async () => {
    const editor = await createTestEditor("");
    pasteText(editor, "1. foo");
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("\\.");
    expect(md).not.toContain("&#x20;");
    expect(md).toContain("1.");
    expect(md).toContain("foo");
  });

  it("the user's reported case: ordered list with a continuation paragraph", async () => {
    const editor = await createTestEditor("");
    pasteText(
      editor,
      [
        "1. 输入内容与函数处理",
        "",
        "   例如我输入一些内容，然后通过一个函数。",
      ].join("\n"),
    );
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("\\.");
    expect(md).not.toContain("&#x20;");
    expect(md).not.toContain("<br />");
    expect(md).toContain("输入内容与函数处理");
    expect(md).toContain("例如我输入一些内容");
  });

  it("paragraph with leading whitespace doesn't leak `&#x20;`", async () => {
    const editor = await createTestEditor("");
    pasteText(editor, "   paragraph with three leading spaces");
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("&#x20;");
    expect(md).toContain("paragraph with three leading spaces");
  });

  it("multi-block markdown survives the round-trip cleanly", async () => {
    const editor = await createTestEditor("");
    pasteText(
      editor,
      [
        "# Heading",
        "",
        "An intro paragraph.",
        "",
        "1. one",
        "2. two",
        "",
        "- bullet a",
        "- bullet b",
      ].join("\n"),
    );
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("\\.");
    expect(md).not.toContain("&#x20;");
    expect(md).not.toContain("<br />");
    expect(md).toContain("# Heading");
    expect(md).toContain("An intro paragraph");
    expect(md).toContain("one");
    expect(md).toContain("two");
    expect(md).toContain("bullet a");
  });

  it("pasted CJK text with markdown markers preserves both text and structure", async () => {
    const editor = await createTestEditor("");
    pasteText(
      editor,
      [
        "嗨，以下是一个购物清单：",
        "",
        "1. 苹果",
        "2. 香蕉",
        "3. 奶油",
      ].join("\n"),
    );
    const md = editor.action(getMarkdown());
    expect(md).not.toContain("\\.");
    expect(md).not.toContain("&#x20;");
    expect(md).toContain("购物清单");
    expect(md).toContain("苹果");
    expect(md).toContain("香蕉");
    expect(md).toContain("奶油");
  });
});
