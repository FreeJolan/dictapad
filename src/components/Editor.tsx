import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { editorViewCtx } from "@milkdown/core";
import { TextSelection } from "@milkdown/prose/state";
import { getMarkdown, replaceAll } from "@milkdown/utils";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { buildEditor } from "../lib/editorBuilder";

export type EditorHandle = {
  getMarkdown: () => string;
  replaceAll: (markdown: string) => void;
  isEmpty: () => boolean;
  focusAtEnd: () => void;
};

type Props = {
  initialValue: string;
  onChange: (markdown: string) => void;
};

function InnerEditor({ initialValue, onChange, handleRef }: Props & {
  handleRef: React.MutableRefObject<EditorHandle | null>;
}) {
  const initialRef = useRef(initialValue);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const { get } = useEditor((root) =>
    buildEditor(root, initialRef.current, (md) => onChangeRef.current(md)),
  );

  const handle = useMemo<EditorHandle>(
    () => ({
      getMarkdown: () => {
        const editor = get();
        if (!editor) return "";
        return editor.action(getMarkdown());
      },
      replaceAll: (markdown: string) => {
        const editor = get();
        if (!editor) return;
        editor.action(replaceAll(markdown));
      },
      isEmpty: () => {
        const editor = get();
        if (!editor) return true;
        const md = editor.action(getMarkdown());
        return md.trim().length === 0;
      },
      focusAtEnd: () => {
        const editor = get();
        if (!editor) return;
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          view.focus();
          const { state } = view;
          const tr = state.tr.setSelection(TextSelection.atEnd(state.doc));
          view.dispatch(tr);
        });
      },
    }),
    [get],
  );

  useEffect(() => {
    handleRef.current = handle;
    return () => {
      handleRef.current = null;
    };
  }, [handle, handleRef]);

  return (
    <div className="milkdown absolute inset-0 overflow-y-auto">
      <Milkdown />
    </div>
  );
}

export const Editor = forwardRef<EditorHandle, Props>(function Editor(
  props,
  ref,
) {
  const handleRef = useRef<EditorHandle | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      getMarkdown: () => handleRef.current?.getMarkdown() ?? "",
      replaceAll: (md) => handleRef.current?.replaceAll(md),
      isEmpty: () => handleRef.current?.isEmpty() ?? true,
      focusAtEnd: () => handleRef.current?.focusAtEnd(),
    }),
    [],
  );

  return (
    <MilkdownProvider>
      <InnerEditor {...props} handleRef={handleRef} />
    </MilkdownProvider>
  );
});
