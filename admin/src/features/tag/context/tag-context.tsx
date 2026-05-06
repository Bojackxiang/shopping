'use client';

import React, { createContext, useContext, useState } from 'react';
import { tags } from '@prisma/client';
import { CreateTagInput, UpdateTagInput } from '@/repositories';
import { useTagManager } from '../hook/use-tag-manager';

interface TagContextType {
  tags: tags[];
  isLoading: boolean;
  isValidating: boolean;
  error: any;
  selectedTagId: string | null;
  setSelectedTagId: (id: string | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTag: tags | undefined;
  refetch: () => void;
  handleAddTag: (data: CreateTagInput) => Promise<void>;
  handleUpdateTag: (id: string, data: UpdateTagInput) => Promise<void>;
  handleSetTagActive: (id: string, isActive: boolean) => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: tags,
    isLoading,
    isValidating,
    error,
    mutate: refetch,
    handleAddTag,
    handleUpdateTag,
    handleSetTagActive
  } = useTagManager();

  const selectedTag = (tags as tags[]).find((t) => t.id === selectedTagId);

  const value: TagContextType = {
    tags: tags as tags[],
    isLoading,
    isValidating,
    error,
    selectedTagId,
    setSelectedTagId,
    searchTerm,
    setSearchTerm,
    selectedTag,
    refetch,
    handleAddTag,
    handleUpdateTag,
    handleSetTagActive
  };

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
};

export const useTagContext = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTagContext must be used within TagProvider');
  }
  return context;
};
