"use client"

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

interface BadgeProps {
    name: string;
    type: string;
    onRemove: (name: string) => void;
}

const BADGE_VARIANT_CLASS: Record<string, string> = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    accent: 'badge-accent',
    info: 'badge-info',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
};

export const SortableBadge = ({ name, type, onRemove }: BadgeProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: name,
    });

    const style = {
        position: 'relative' as const,
        opacity: isDragging ? 0.6 : 1,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : 1,
        whiteSpace: 'nowrap',
        transition,
        touchAction: 'none',
    };

    const variantClass = BADGE_VARIANT_CLASS[type] || '';

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div
                className={`badge badge-soft badge-outline ${variantClass} p-3 text-base cursor-grab active:cursor-grabbing`}>
                {name}
                <button
                    onClick={() => onRemove(name)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="cursor-pointer">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
