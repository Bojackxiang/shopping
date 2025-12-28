'use client';

import { useContext } from 'react';
import { useGlobalLoading as useGlobalLoadingContext } from '@/components/global-loading-provider';

/**
 * Hook to control the global loading state
 *
 * @example
 * ```tsx
 * const { showLoading, hideLoading } = useGlobalLoading();
 *
 * const handleSubmit = async () => {
 *   showLoading('Saving changes...');
 *   try {
 *     await saveData();
 *   } finally {
 *     hideLoading();
 *   }
 * };
 * ```
 */
export const useGlobalLoading = useGlobalLoadingContext;
