import { useOptionalStorefrontLayoutContext } from '@/hooks/storefront/useStorefrontLayoutContext';
import { RichTextLeafComponent } from '@/types/layout-component/leaf-component';
import { useState } from 'react';
import CanvasNodeWrapper from '../../canvas/CanvasNodeWrapper';
import { NodeRendererMode } from '../../NodeRenderer';
import RichTextEditor from './RichTextEditor';

type CompositeComponentProps = {
  component: RichTextLeafComponent;
  sourceParentId?: string;
  sourceSlot?: number;
  mode: NodeRendererMode;
};

const RichTextComponent = ({
  component,
  sourceParentId,
  sourceSlot,
  mode,
}: CompositeComponentProps) => {
  const [openEditor, setOpenEditor] = useState(false);
  const layoutCtx = useOptionalStorefrontLayoutContext();
  // const lastClickTime = useRef(0);
  // const THRESHOLD_MS = 400;
  const richTextBody =
    typeof component.config.content.body === 'string'
      ? component.config.content.body
      : '';

  // const handleClick = () => {
  //   const now = Date.now();
  //   const timeSinceLastClick = now - lastClickTime.current;

  //   if (timeSinceLastClick < THRESHOLD_MS) {
  //     lastClickTime.current = 0;
  //     setOpenEditor(() => true);
  //   } else {
  //     lastClickTime.current = now;
  //   }
  // };

  const isEditor = mode === NodeRendererMode.Editor;

  const handleDoubleClick = () => {
    setOpenEditor(() => true);
  };

  const handleOnClose = () => {
    setOpenEditor(() => false);
  };

  const handleOnSave = (newContent: string) => {
    layoutCtx?.updateConfig(component.id, 'content.body', newContent);
    setOpenEditor(false);
  };

  const editorProps = {
    'aria-label': 'Rich Text Component. Double click to edit the content.',
    'aria-expanded': openEditor,
    onDoubleClick: handleDoubleClick,
  };

  return (
    <CanvasNodeWrapper
      mode={mode}
      component={component}
      sourceParentId={sourceParentId}
      sourceSlot={sourceSlot}
      className='wrap-break-word'
      {...(isEditor && editorProps)}
    >
      {isEditor && openEditor && (
        <RichTextEditor
          isOpen={openEditor}
          content={richTextBody}
          onClose={handleOnClose}
          onSave={handleOnSave}
        />
      )}

      <div
        className='max-h-full max-w-full wrap-break-word whitespace-pre-wrap overflow-hidden'
        dangerouslySetInnerHTML={{
          __html: richTextBody,
        }}
      />
    </CanvasNodeWrapper>
  );
};

export default RichTextComponent;
