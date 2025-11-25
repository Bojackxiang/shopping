'use client';

import { useState } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// import AddCategoryDialog from './add-category-dialog';
import { categoryType } from '../schema/category-schema';
import { useCategoryStore } from '../lib/store';
import CategoryTreeItem from './category-tree-item';
import AddCategoryDialog from './add-category-dialog';
import { useCategoryContext } from '../context/category-context';
import { categories } from '@prisma/client';

interface CategoryTreeProps {
  categories: categoryType[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedId: string | null;
  onSelectCategory: (id: string) => void;
}

export default function CategoryTree({
  searchTerm,
  onSearchChange,
  selectedId,
  onSelectCategory,
  categories
}: CategoryTreeProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  const rootCategories = categories.filter((c) => !c.parentId);
  const filteredCategories = rootCategories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  const handleAddClick = () => {
    setSelectedParentId(selectedId || null);
    setShowAddDialog(true);
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      {/* Header */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-foreground text-lg font-semibold'>Categories</h2>
          <Button size='sm' onClick={handleAddClick} className='gap-2'>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>Add</span>
          </Button>
        </div>

        {/* Search */}
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
          <Input
            placeholder='Search categories...'
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className='pl-9'
          />
        </div>
      </div>

      {/* Tree */}
      <div className='border-border bg-card flex-1 space-y-1 overflow-y-auto rounded-lg border p-3'>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => {
            return (
              <CategoryTreeItem
                categories={categories}
                key={category.id}
                category={category}
                isExpanded={expandedIds.has(category.id)}
                selectedId={selectedId}
                onToggleExpand={toggleExpand}
                onSelect={onSelectCategory}
                level={0}
                expandedIds={expandedIds}
              />
            );
          })
        ) : (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No categories found
          </p>
        )}
      </div>

      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        parentId={selectedParentId}
        selectedCategoryName={
          selectedId
            ? categories.find((c) => c.id === selectedId)?.name
            : undefined
        }
      />
    </div>
  );
}
