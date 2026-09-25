import { useDroppable } from "@dnd-kit/react";
import React, { CSSProperties, useMemo } from "react";

type DropZoneProps = {
  children?: React.ReactNode;
  sourceParentId: string;
  sourceSlot: number;
  extraStyle: CSSProperties;
};

const DropZone = ({
  children,
  sourceParentId,
  sourceSlot,
  extraStyle,
}: DropZoneProps) => {
  const { ref: dropRef, isDropTarget } = useDroppable({
    id: `${sourceParentId}-${sourceSlot}`,
    accept: ["LEAF", "COMPOSITE", "COMMERCE", "REPEATER"],
    data: {
      parentId: sourceParentId,
      slot: sourceSlot,
    },
  });

  const isOccupied = useMemo(() => Boolean(children), [children]);

  let styleClasses = "relative h-full w-full min-w-0 transition-all";
  if (isOccupied) {
    styleClasses += isDropTarget
      ? " after:content-[''] after:absolute after:inset-0 after:z-10 after:pointer-events-none after:ring-2 after:ring-blue-500 after:rounded-md after:bg-blue-200/50 after:transition-all after:duration-300 after:ease-in-out"
      : "";
  } else {
    styleClasses +=
      " after:content-[''] after:absolute after:inset-0 after:border after:border-zinc-300 after:rounded-md after:border-dashed after:transition-all after:duration-300 after:ease-in-out";
    styleClasses += isDropTarget
      ? " after:ring-2 after:ring-blue-500 after:bg-blue-200/50"
      : " after:bg-transparent";
  }

  return (
    <div
      aria-label={"Empty drop slot " + sourceSlot}
      aria-controls={sourceParentId}
      data-slot={sourceSlot}
      className={styleClasses}
      style={extraStyle}
      ref={dropRef}
    >
      {children}
    </div>
  );
};

export default DropZone;
