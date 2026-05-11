import { describe, expect, it } from "vitest";
import { getMarkdown, replaceAll } from "@milkdown/utils";
import { createTestEditor } from "./createTestEditor";

/**
 * Property under test: an editor populated from markdown M, then serialized
 * to M', then re-loaded with M', then re-serialized to M'' must satisfy
 * `M' === M''`. This means a copy → paste-back cycle is idempotent — what
 * the user takes away from the buffer reconstructs to the same document.
 *
 * We don't require `M === M'` on first serialization because Milkdown's
 * serializer may normalize the source (e.g. `_foo_` ↔ `*foo*`). What
 * matters is that after one normalization pass the document is stable.
 */
async function roundTrip(initial: string): Promise<{ md1: string; md2: string }> {
  const editor = await createTestEditor(initial);
  const md1 = editor.action(getMarkdown());
  editor.action(replaceAll(md1));
  const md2 = editor.action(getMarkdown());
  return { md1, md2 };
}

describe("clipboard round-trip is idempotent", () => {
  it("plain single paragraph", async () => {
    const { md1, md2 } = await roundTrip("hello world");
    expect(md2).toBe(md1);
  });

  it("two paragraphs with single blank line", async () => {
    const { md1, md2 } = await roundTrip("first paragraph\n\nsecond paragraph");
    expect(md2).toBe(md1);
  });

  it("three paragraphs with multiple blank lines between", async () => {
    const { md1, md2 } = await roundTrip(
      "p1\n\n\np2\n\n\n\np3",
    );
    expect(md2).toBe(md1);
  });

  it("ordered list", async () => {
    const { md1, md2 } = await roundTrip("1. apple\n2. banana\n3. cherry");
    expect(md2).toBe(md1);
  });

  it("unordered list", async () => {
    const { md1, md2 } = await roundTrip("- apple\n- banana\n- cherry");
    expect(md2).toBe(md1);
  });

  it("mixed: heading + list + paragraph + blockquote", async () => {
    const { md1, md2 } = await roundTrip(
      [
        "# Heading",
        "",
        "An intro paragraph.",
        "",
        "1. one",
        "2. two",
        "",
        "> a quote",
        "",
        "another paragraph",
      ].join("\n"),
    );
    expect(md2).toBe(md1);
  });

  it("plain text containing markdown-looking sequences", async () => {
    const { md1, md2 } = await roundTrip(
      [
        "Hi hi, test test.",
        "",
        "以下是一个列表：",
        "",
        "1. 苹果",
        "2. 香蕉",
        "3. 奶油",
      ].join("\n"),
    );
    expect(md2).toBe(md1);
  });

  it("CJK content with bold and italic", async () => {
    const { md1, md2 } = await roundTrip(
      "这是一段**加粗**和*斜体*文本，还有`行内代码`。",
    );
    expect(md2).toBe(md1);
  });
});
