import useLayoutComponent from '@/hooks/storefront/useLayoutComponent';
import { RichTextLeafComponent } from '@/types/layout-component/leaf-component';
import { useRef, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import useStorefrontContext from '@/hooks/storefront/useStorefrontContext';

const RichTextComponent = ({
  component,
  sourceParentId,
  sourceSlot,
}: {
  component: RichTextLeafComponent;
  sourceParentId: string;
  sourceSlot: number;
}) => {
  const {
    id,
    baseClasses: className,
    ref,
    isDragging,
    isSelected,
    handleKeyDown,
    handleMouseDown,
  } = useLayoutComponent({ component, sourceParentId, sourceSlot });

  const [openEditor, setOpenEditor] = useState(false);
  const { updateConfig } = useStorefrontContext();
  const lastClickTime = useRef(0);
  const THRESHOLD_MS = 400;
  const richTextBody =
    typeof component.config.content.body === 'string'
      ? component.config.content.body
      : '';

  const handleClick = () => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < THRESHOLD_MS) {
      lastClickTime.current = 0;
      setOpenEditor(() => true);
    } else {
      lastClickTime.current = now;
    }
  };

  const handleOnClose = () => {
    setOpenEditor(() => false);
  };

  const handleOnSave = (newContent: string) => {
    updateConfig(component.id, {
      ...component.config,
      content: {
        ...component.config.content,
        body: newContent,
      },
    });
    setOpenEditor(() => false);
  };

  return (
    <div
      className={`min-w-0 max-w-full wrap-break-word ${className} `}
      id={id}
      ref={ref}
      role='button'
      tabIndex={0}
      data-source-parent-id={sourceParentId}
      data-source-slot={sourceSlot}
      aria-controls={sourceParentId}
      aria-expanded={openEditor}
      aria-label={`Hover over this component to see the available actions. Press Escape to deselect this component. Press Delete to remove this component.`}
      aria-busy={isDragging}
      aria-pressed={isSelected || isDragging}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {openEditor ? (
        <RichTextEditor
          isOpen={openEditor}
          content={richTextBody}
          onClose={handleOnClose}
          onSave={handleOnSave}
        ></RichTextEditor>
      ) : null}
      <div
        className='min-w-0 max-w-full wrap-break-word'
        dangerouslySetInnerHTML={{
          __html: component.config.content.body,
        }}
      ></div>
    </div>
  );
};

export default RichTextComponent;
