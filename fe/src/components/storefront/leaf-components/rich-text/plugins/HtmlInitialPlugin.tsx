import { $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, $isElementNode } from "lexical";
import { useEffect, useRef } from "react";

// This plugin initializes the Lexical editor with the provided initial HTML content.
const HtmlInitialPlugin = ({ initialHtml }: { initialHtml: string }) => {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current || !initialHtml) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, "text/html");
      const nodes = $generateNodesFromDOM(editor, dom);

      const root = $getRoot();
      root.clear();

      if (nodes.length === 0) {
        // If no nodes were generated, insert a default paragraph node to ensure the editor is not empty.
        root.append($createParagraphNode());
      }

      nodes.forEach((n) => {
        if ($isElementNode(n)) {
          root.append(n);
        } else {
          const p = $createParagraphNode();
          p.append(n);
          root.append(p);
        }
      });
    });

    hasInitialized.current = true;
  }, [initialHtml, editor]);

  return null;
};

export default HtmlInitialPlugin;
