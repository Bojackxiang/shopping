export const handleDecimal = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  // 如果已经是数字，直接返回
  if (typeof value === "number") {
    return value;
  }

  // 如果是字符串或对象，尝试转换
  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
};
