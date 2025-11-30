export const handleEmptyArray = <T = unknown>(
  array: T[] | null | undefined
): T[] => {
  if (!array || array.length === 0) {
    return [];
  }
  return array;
};
