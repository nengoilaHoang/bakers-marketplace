// components/storefront/canvas/CanvasIframe.tsx
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface CanvasIframeProps {
  children: (iframeDoc: Document) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClickCapture?: (e: React.MouseEvent) => void;
  onArtboardMount?: (root: HTMLElement) => void;
  freezeHeight?: boolean;
}

export const CanvasIframe = ({
  children,
  className,
  style,
  onClickCapture,
  onArtboardMount,
  freezeHeight = false,
}: CanvasIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [iframeDoc, setIframeDoc] = useState<Document | null>(null);
  const freezeRef = useRef(freezeHeight);
  const updateHeightRef = useRef<() => void>(() => {});

  useEffect(() => {
    freezeRef.current = freezeHeight;
    if (!freezeHeight) updateHeightRef.current(); // resync once the drag ends
  }, [freezeHeight]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // Write a basic HTML structure into the iframe document
    const htmlContent = `
			<!DOCTYPE html>
			<html class='overflow-hidden m-0 p-0'>
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
				</head>
				<body class="m-0 p-0 bg-white text-zinc-900 antialiased overflow-x-hidden">
					<div id="iframe-root" class="relative w-full h-auto min-h-0"></div>
				</body>
			</html>
		`;

    const parsed = new DOMParser().parseFromString(htmlContent, 'text/html');
    doc.replaceChild(
      doc.adoptNode(parsed.documentElement),
      doc.documentElement,
    );

    // Map each parent <style>/<link> to its clone in the iframe
    const cloneMap = new Map<Element, HTMLElement>();

    const syncStyles = () => {
      const current = new Set(
        document.querySelectorAll('link[rel="stylesheet"], style'),
      );

      // remove clones whose source is gone
      cloneMap.forEach((clone, src) => {
        if (!current.has(src)) {
          clone.remove();
          cloneMap.delete(src);
        }
      });

      current.forEach((src) => {
        const existing = cloneMap.get(src);
        if (!existing) {
          const clone = src.cloneNode(true) as HTMLElement;
          clone.dataset.syncedStyle = 'true';
          doc.head.appendChild(clone);
          cloneMap.set(src, clone);
        } else if (
          src.tagName === 'STYLE' &&
          existing.textContent !== src.textContent
        ) {
          existing.textContent = src.textContent; // HMR edits
        }
      });
    };

    syncStyles();

    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true });

    const rootElement = doc.getElementById('iframe-root');
    setMountNode(rootElement);
    setIframeDoc(doc);
    if (rootElement) {
      onArtboardMount?.(rootElement);
    }

    // Synchronize outer iframe height with inner content height
    const updateHeight = () => {
      if (freezeRef.current) return;
      if (!iframeRef.current || !doc) return;
      // Measure the full scroll height of the inner document
      const contentHeight = Math.max(
        doc.body.scrollHeight,
        doc.documentElement.scrollHeight,
        rootElement?.scrollHeight ?? 0,
      );
      const nextHeight = Math.max(800, Math.ceil(contentHeight));
      iframeRef.current.style.height = `${nextHeight}px`;
    };

    updateHeightRef.current = updateHeight;

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (rootElement) {
      resizeObserver.observe(rootElement);
      // Also observe body to catch dynamically added items
      resizeObserver.observe(doc.body);
    }

    return () => {
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [onArtboardMount]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={style}
      title='Storefront Artboard'
      onClickCapture={onClickCapture}
    >
      {mountNode && iframeDoc
        ? createPortal(children(iframeDoc), mountNode)
        : null}
    </iframe>
  );
};
