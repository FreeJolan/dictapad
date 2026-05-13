import type { MilkdownPlugin } from "@milkdown/ctx";
import {
  editorViewOptionsCtx,
  parserCtx,
  schemaCtx,
} from "@milkdown/core";
import { DOMParser, DOMSerializer, Slice } from "@milkdown/prose/model";

/**
 * Voice-dictation tools deliver text as a single bulk paste. ProseMirror's
 * default `clipboardTextParser` drops each line into its own paragraph, so a
 * dictated "1. foo" never gets the chance to become a list via input rules —
 * it stays a paragraph that *looks* like a list. The serializer then has to
 * emit "1\." to preserve the not-a-list state across a re-parse, and the
 * backslash shows up in whatever the user pastes the buffer into. Same story
 * for paragraphs with leading whitespace ending up as "&#x20;".
 *
 * Running pasted text through the markdown parser at paste time means the
 * editor's doc model matches what the user perceives visually (Typora's
 * strategy). The serializer then has no ambiguity to defend against.
 */
export const normalizePastePlugin: MilkdownPlugin = (ctx) => {
  ctx.update(editorViewOptionsCtx, (prev) => ({
    ...prev,
    clipboardTextParser: (text, $context) => {
      const parse = ctx.get(parserCtx);
      const schema = ctx.get(schemaCtx);
      const doc = parse(text);
      if (!doc) return Slice.empty;
      const dom = DOMSerializer.fromSchema(schema).serializeFragment(
        doc.content,
      );
      return DOMParser.fromSchema(schema).parseSlice(dom, {
        preserveWhitespace: true,
        context: $context,
      });
    },
  }));
  return () => undefined;
};
