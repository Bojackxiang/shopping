export const anyToNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value !== 'string') {
    throw new Error(`Invalid type: ${typeof value}`);
  }

  const parsed = Number(value);

  if (isNaN(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
};
