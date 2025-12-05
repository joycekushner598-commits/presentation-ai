import { Skeleton } from "@/components/ui/skeleton";
import { usePresentationState } from "@/states/presentation-state";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { OutlineItem } from "./OutlineItem";

interface OutlineItemType {
  id: string;
  title: string;
}

export function OutlineList() {
  const {
    outline: initialItems,
    setOutline,
    numSlides,
    isGeneratingOutline,
    webSearchEnabled,
    outlineThinking,
  } = usePresentationState();

  const [items, setItems] = useState<OutlineItemType[]>(
    initialItems.map((title, index) => ({
      id: (index + 1).toString(),
      title,
    })),
  );

  // Use a ref to track if we should skip the next update (to prevent loops)
  const skipNextSync = useRef(false);
  
  // Only sync FROM store TO local state when initialItems changes
  useEffect(() => {
    if (!skipNextSync.current) {
      setItems(
        initialItems.map((title, index) => ({
          id: (index + 1).toString(),
          title,
        })),
      );
    } else {
      skipNextSync.current = false;
    }
  }, [initialItems]);

  // Sync local items back to global outline AFTER render to avoid cross-component updates during render
  useEffect(() => {
    const titles = items.map((item) => item.title);
    // Avoid feedback loop: only update store if titles differ from store's outline
    const isSameLength = titles.length === initialItems.length;
    const isSameContent =
      isSameLength && titles.every((t, i) => t === initialItems[i]);
    if (!isSameContent) {
      skipNextSync.current = true;
      setOutline(titles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems;
      });
    }
  }

  const handleTitleChange = (id: string, newTitle: string) => {
    setItems((items) => {
      const newItems = items.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item,
      );
      return newItems;
    });
  };

  const handleAddCard = () => {
    const newId =
      items.length > 0
        ? (
            Math.max(...items.map((item) => parseInt(item.id, 10))) + 1
          ).toString()
        : "1";
    const newItems = [...items, { id: newId, title: "New Card" }];
    setItems(newItems);
  };

  const handleDeleteCard = (id: string) => {
    setItems((items) => {
      const newItems = items.filter((item) => item.id !== id);
      return newItems;
    });
  };

  const content = useMemo(() => {
    const totalSlides = numSlides;
    const loadedCount = items.length;
    const remainingCount = Math.max(0, totalSlides - loadedCount);

    // Show skeleton placeholders when web search is enabled and outline is empty (before generation starts)
    const showSkeletonPlaceholders =
      webSearchEnabled && items.length === 0 && !isGeneratingOutline;
    // Show loading skeletons only when actually generating outline
    const showLoadingSkeletons = isGeneratingOutline && remainingCount > 0;

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item, index) => (
              <OutlineItem
                key={item.id}
                id={item.id}
                index={index + 1}
                title={item.title}
                onTitleChange={handleTitleChange}
                onDelete={handleDeleteCard}
              />
            ))}
          </div>
        </SortableContext>
        {/* Show skeleton placeholders when web search enabled but no outline yet */}
        {showSkeletonPlaceholders && <Skeleton className="h-96 w-full" />}

        {/* Show loading skeletons only when actually generating */}
        {showLoadingSkeletons &&
          Array.from({ length: remainingCount }).map((_, index) => (
            <Skeleton key={`loading-${index}`} className="h-16 w-full" />
          ))}
      </DndContext>
    );
  }, [
    items,
    numSlides,
    isGeneratingOutline,
    webSearchEnabled,
    sensors,
    handleDragEnd,
    handleTitleChange,
    handleDeleteCard,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-foreground">Outline</h2>
        {isGeneratingOutline && (
          <span className="animate-pulse text-xs text-muted-foreground">
            Generating outline...
          </span>
        )}
        {webSearchEnabled && items.length === 0 && !isGeneratingOutline && (
          <span className="text-xs text-muted-foreground">
            Ready to generate
          </span>
        )}
      </div>

      {content}

      <button
        onClick={handleAddCard}
        disabled={isGeneratingOutline}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-muted/50 py-3 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
      >
        <Plus size={20} />
        Add card
      </button>

      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{items.length} cards total</span>
        <span>
          {items.reduce((acc, item) => acc + item.title.length, 0)}/20000
        </span>
      </div>
    </div>
  );
}
