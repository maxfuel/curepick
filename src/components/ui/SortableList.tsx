"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface SortableItem {
  id: string;
}

interface Props<T extends SortableItem> {
  items: T[];
  renderCells: (item: T, index: number) => React.ReactNode;
  onSave: (items: { id: string; sort_order: number }[]) => Promise<void>;
  colSpan: number;
  saveLabel?: string;
}

function SortableRow<T extends SortableItem>({
  item,
  index,
  renderCells,
}: {
  item: T;
  index: number;
  renderCells: (item: T, index: number) => React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative",
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <tr ref={setNodeRef} style={style} className="border-b last:border-0">
      <td className="w-8 px-2 py-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          tabIndex={-1}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      {renderCells(item, index)}
    </tr>
  );
}

export function SortableList<T extends SortableItem>({
  items: initialItems,
  renderCells,
  onSave,
  colSpan,
  saveLabel = "저장",
}: Props<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isDirty, setIsDirty] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "saved">("idle");
  const [isPending, startTransition] = useTransition();

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === active.id);
      const newIndex = prev.findIndex((i) => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setIsDirty(true);
  }

  function handleSave() {
    setStatus("pending");
    startTransition(async () => {
      await onSave(items.map((item, idx) => ({ id: item.id, sort_order: idx + 1 })));
      setIsDirty(false);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    });
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} renderCells={renderCells} />
          ))}
        </SortableContext>
      </DndContext>
      <tr>
        <td colSpan={colSpan + 1} className="px-3 py-2">
          {status === "saved" ? (
            <p className="text-sm font-medium text-green-600">✓ 저장완료</p>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isPending}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isPending ? "저장 중..." : saveLabel}
            </button>
          )}
        </td>
      </tr>
    </>
  );
}
