/**
 * Product status utility functions
 * Shared between ProductTable and ProductRow components
 */

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ACTIVE: 'Active',
    DRAFT: 'Draft',
    ARCHIVED: 'Archived'
  };
  return labels[status] || status;
}

export function getStatusStyles(status: string): string {
  const styles: Record<string, string> = {
    ACTIVE:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    ARCHIVED:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
}

export function getVisibilityStyles(visibility: string): string {
  return visibility === 'published'
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
}
