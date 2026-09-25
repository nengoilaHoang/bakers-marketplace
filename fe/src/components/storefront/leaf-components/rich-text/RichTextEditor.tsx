import {
  $isTextNode,
  defineExtension,
  DOMConversionMap,
  DOMExportOutput,
  DOMExportOutputMap,
  isHTMLElement,
  Klass,
  ParagraphNode,
  TextNode,
  type LexicalEditor,
  type LexicalNode,
} from 'lexical';
import { parseAllowedFontSize } from './helpers/styleConfig';
import { LexicalExtensionComposer } from '@lexical/react/LexicalExtensionComposer';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { RichTextExtension } from '@lexical/rich-text';
import { HistoryExtension } from '@lexical/history';
import { createPortal } from 'react-dom';
import { $generateHtmlFromNodes } from '@lexical/html';
import EditorCapturePlugin from './plugins/EditorCapturePlugin';
import HtmlInitialPlugin from './plugins/HtmlInitialPlugin';

const removeStylesExportDOM = (
  editor: LexicalEditor,
  target: LexicalNode,
): DOMExportOutput => {
  const output = target.exportDOM(editor);
  if (output && isHTMLElement(output.element)) {
    // Remove all inline styles and classes when the element is an HTMLElement
    for (const el of [
      output.element,
      ...output.element.querySelectorAll('[style],[class]'),
    ]) {
      el.removeAttribute('class');
      el.removeAttribute('style');
    }
  }
  return output;
};

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const getExtraStyles = (element: HTMLElement): string => {
  let extraStyles = '';
  const fontSize = parseAllowedFontSize(element.style.fontSize);
  const bgColor = parseAllowedFontSize(element.style.backgroundColor);
  const color = parseAllowedFontSize(element.style.color);
  if (fontSize !== '') {
    extraStyles += `font-size: ${fontSize}`;
  }
  if (bgColor !== '') {
    extraStyles += `background-color: ${bgColor}`;
  }
  if (color !== '') {
    extraStyles += `color: ${color}`;
  }
  return extraStyles;
};

const constructImportMap = (): DOMConversionMap => {
  const importMap: DOMConversionMap = {};

  // Need to call getType() to ensure TextNode.importDOM is populated
  TextNode.getType();
  const importDOMFn = TextNode.importDOM;

  for (const [tag, fn] of Object.entries(
    importDOMFn ? importDOMFn() || {} : {},
  )) {
    importMap[tag] = (importNode) => {
      const importer = fn(importNode);
      if (!importer) {
        return null;
      }
      return {
        ...importer,
        conversion: (element) => {
          const output = importer.conversion(element);
          if (
            output?.forChild === undefined ||
            output.after !== undefined ||
            output.node !== null
          ) {
            return output;
          }
          const extraStyles = getExtraStyles(element);
          if (extraStyles) {
            const { forChild } = output;
            return {
              ...output,
              forChild: (child, parent) => {
                const textNode = forChild(child, parent);
                if ($isTextNode(textNode)) {
                  textNode.setStyle(textNode.getStyle() + extraStyles);
                }
                return textNode;
              },
            };
          }
          return output;
        },
      };
    };
  }

  return importMap;
};

const editorTheme = {
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
    underlineStrikethrough: '[text-decoration-line:underline_line-through]',
  },
};

const emptySubscribe = () => () => {};

const RichTextEditor = ({
  isOpen,
  content,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  onSave: (content: string) => void;
}) => {
  const placeholder = useMemo(() => 'Enter some rich text...', []);
  const extension = useMemo(
    () =>
      defineExtension({
        name: 'RichText Editor',
        dependencies: [RichTextExtension, HistoryExtension],
        nodes: [ParagraphNode, TextNode],
        theme: editorTheme,
        html: {
          export: exportMap,
          import: constructImportMap(),
        },
        onError(error: Error) {
          console.log(error);
        },
      }),
    [],
  );

  const editorRef = useRef<LexicalEditor | null>(null);

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.read(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      onSave(htmlString);
    });
  };

  if (!isOpen || !isClient) return null;

  return createPortal(
    <div
      className='fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/50'
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className='flex min-h-[200px] max-h-[90vh] min-w-[320px] max-w-[90vw] flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm'>
        <LexicalExtensionComposer
          extension={extension}
          contentEditable={
            <div className='relative max-w-full p-3'>
              <ContentEditable
                className='outline-none w-[600px] shrink-0 min-h-37.5'
                aria-placeholder={placeholder}
                placeholder={
                  <div className='pointer-events-none absolute top-3 left-3 text-sm text-zinc-400'>
                    {placeholder}
                  </div>
                }
              ></ContentEditable>
            </div>
          }
        >
          <HtmlInitialPlugin initialHtml={content}></HtmlInitialPlugin>
          <div className='-order-1 border-b border-zinc-200 bg-zinc-50 p-1'>
            <ToolbarPlugin></ToolbarPlugin>
          </div>
          <EditorCapturePlugin editorRef={editorRef}></EditorCapturePlugin>
        </LexicalExtensionComposer>
        <div className='flex justify-end gap-2 border-t border-zinc-200 bg-zinc-50 p-2'>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100'
          >
            Close
          </button>
          <button
            type='button'
            onClick={handleSave}
            className='rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700'
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default RichTextEditor;
