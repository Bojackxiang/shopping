'use client';

import React, { createContext, useContext, useState } from 'react';
import { useCategoryManager } from '../hook/use-category-manager';
import { categories } from '@prisma/client';
import {
  categoryCreateInputType,
  categoryType
} from '../schema/category-schema';

interface CategoryContextType {
  categories: categories[];
  isLoading: boolean;
  isValidating: boolean;
  error: any;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: categories | undefined;
  refetch: () => void;
  handleAddCategory: (data: categoryCreateInputType) => Promise<void>;
  handleUpdateCategory: (
    id: string,
    data: Partial<categoryType>
  ) => Promise<void>;
  handleDeactivateCategory: (id: string) => Promise<void>;
  handleActivateCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: categories,
    isLoading,
    isValidating,
    error,
    mutate: refetch,
    handleAddCategory,
    handleUpdateCategory,
    handleDeactivateCategory,
    handleActivateCategory
  } = useCategoryManager();

  const selectedCategory = (categories as categories[]).find(
    (c) => c.id === selectedCategoryId
  );

  const value: CategoryContextType = {
    categories: categories as categories[],
    isLoading,
    isValidating,
    error,
    selectedCategoryId,
    setSelectedCategoryId,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    refetch,
    handleAddCategory,
    handleUpdateCategory,
    handleDeactivateCategory,
    handleActivateCategory
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategoryContext = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategoryContext must be used within CategoryProvider');
  }
  return context;
};
