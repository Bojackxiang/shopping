export const anyToDate = (value: unknown): Date => {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`Invalid type: ${typeof value}`);
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
};
