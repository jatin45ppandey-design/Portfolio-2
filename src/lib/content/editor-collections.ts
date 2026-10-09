export type OrderedEditorItem = {
  id: string;
  order: number;
};

export function toStableEditorId(value: string, fallback: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || fallback;
}

export function getNextStableEditorId(
  usedIds: ReadonlyArray<string>,
  value: string,
  fallback: string,
): string {
  const baseId = toStableEditorId(value, fallback);
  const used = new Set(usedIds);

  if (!used.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  while (used.has(`${baseId}-${suffix}`)) {
    suffix += 1;
  }

  return `${baseId}-${suffix}`;
}

export function hasSequentialEditorOrder(items: ReadonlyArray<{ order: number }>): boolean {
  return [...items]
    .sort((left, right) => left.order - right.order)
    .every((item, index) => item.order === index + 1);
}

export function normalizeEditorOrder<T extends OrderedEditorItem>(items: ReadonlyArray<T>): T[] {
  return [...items]
    .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
    .map((item, index) => ({ ...item, order: index + 1 }));
}

export function moveEditorItem<T extends OrderedEditorItem>(
  items: ReadonlyArray<T>,
  itemId: string,
  direction: "up" | "down",
): T[] {
  const orderedItems = normalizeEditorOrder(items);
  const currentIndex = orderedItems.findIndex((item) => item.id === itemId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= orderedItems.length) {
    return orderedItems;
  }

  [orderedItems[currentIndex], orderedItems[targetIndex]] = [
    orderedItems[targetIndex],
    orderedItems[currentIndex],
  ];

  return orderedItems.map((item, index) => ({ ...item, order: index + 1 }));
}

export function normalizeEditorName(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}
