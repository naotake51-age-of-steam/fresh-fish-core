export const range = (from: number, to: number): number[] => {
  const list: number[] = [];
  for (let i = from; i <= to; i++) {
    list.push(i);
  }
  return list;
};

export function shuffleArray<T>(array: Readonly<T[]>): T[] {
  const shuffledArray = [...array];

  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    // 要素を交換
    [shuffledArray[i], shuffledArray[randomIndex]] = [
      shuffledArray[randomIndex],
      shuffledArray[i],
    ];
  }

  return shuffledArray;
}

export function createUniqueIndex<T, K extends keyof T>(
  items: T[],
  key: K
): Map<NonNullable<T[K]>, T> {
  const index = new Map<NonNullable<T[K]>, T>();
  items.forEach((item) => {
    const value = item[key];
    if (value === null || value === undefined) return;

    if (index.has(value)) {
      throw new Error(`duplicate value: ${value}`);
    }
    index.set(value, item);
  });
  return index;
}

export function createIndex<T, K extends keyof T>(
  items: T[],
  key: K
): Map<NonNullable<T[K]>, T[]> {
  const index = new Map<NonNullable<T[K]>, T[]>();
  items.forEach((item) => {
    const value = item[key];
    if (value === null || value === undefined) return;

    const newItems = index.get(value) ?? [];
    newItems.push(item);

    index.set(value, newItems);
  });
  return index;
}

export function rotateArray<T>(items: T[], rotate: number): T[] {
  return items.splice(rotate).concat(items);
}
