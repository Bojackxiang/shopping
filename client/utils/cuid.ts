/**
 * Generate a CUID (Collision-resistant Unique Identifier)
 * This is a simple implementation for generating unique IDs
 */
export function cuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);

  return `c${timestamp}${randomPart}${randomPart2}`;
}
