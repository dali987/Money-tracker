import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

export const SortableBadge = ({name, type, onRemove}: {name: string, type: string, onRemove: (...args: any[]) => void}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: name });

  const style = {
    position: 'relative' as 'relative',
    opacity: isDragging ? 0.6 : 1,
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : 1,
    whiteSpace: 'nowrap',
    transition,
    touchAction: 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className={`badge badge-soft badge-outline badge-${type} p-3 text-base cursor-grab active:cursor-grabbing`}>
            {name}
            <button onClick={() => onRemove(name)} onPointerDown={(e) => e.stopPropagation()} className="cursor-pointer"><X size={16} /></button>
        </div>
    </div>
  );
};
