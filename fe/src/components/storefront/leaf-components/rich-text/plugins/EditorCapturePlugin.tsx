import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor } from 'lexical';
import { useEffect } from 'react';

// Only meant to get a ref to the editor.
const EditorCapturePlugin = ({
  editorRef,
}: {
  editorRef: React.RefObject<LexicalEditor | null>;
}) => {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);
  return null;
};

export default EditorCapturePlugin;
