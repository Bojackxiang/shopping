'use client';

import { useMemo, useState } from 'react';
import { Eye, EyeOff, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { categoryType } from '../schema/category-schema';
import CategoryTreeItem from './category-tree-item';

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
  const [addingParentId, setAddingParentId] = useState<string | undefined>(
    undefined
  );
  const [showHidden, setShowHidden] = useState(false);

  const keptIds = useMemo<Set<string> | null>(() => {
    if (!searchTerm) return null;
    const q = searchTerm.toLowerCase();

    const matched = new Set<string>();
    for (const c of categories) {
      if ((c.name || '').toLowerCase().includes(q)) matched.add(c.id);
    }

    const byId = new Map(categories.map((c) => [c.id, c]));
    const kept = new Set<string>(matched);
    matched.forEach((id) => {
      let cur = byId.get(id);
      while (cur?.parentId && !kept.has(cur.parentId)) {
        kept.add(cur.parentId);
        cur = byId.get(cur.parentId);
      }
    });
    return kept;
  }, [categories, searchTerm]);

  const effectiveExpandedIds = useMemo(() => {
    if (!keptIds) return expandedIds;
    const ids = new Set(expandedIds);
    for (const c of categories) {
      if (!keptIds.has(c.id)) continue;
      const hasKeptChild = categories.some(
        (child) => child.parentId === c.id && keptIds.has(child.id)
      );
      if (hasKeptChild) ids.add(c.id);
    }
    return ids;
  }, [categories, keptIds, expandedIds]);

  const rootCategories = categories.filter((c) => !c.parentId);
  const filteredCategories = rootCategories
    .filter((c) => (keptIds ? keptIds.has(c.id) : true))
    .filter((c) => showHidden || (c as any).isActive);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedIds(newExpanded);
  };

  return (
    <div className='flex h-full flex-col gap-4'>
      {/* Header */}
      <div className='space-y-3'>
        <h2 className='text-foreground text-lg font-semibold'>Categories</h2>

        {/* Show-hidden toggle + search */}
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            onClick={() => setShowHidden((prev) => !prev)}
            title={showHidden ? 'Hide inactive' : 'Show inactive'}
            aria-label={showHidden ? 'Hide inactive' : 'Show inactive'}
            aria-pressed={showHidden}
          >
            {showHidden ? (
              <Eye className='h-4 w-4' />
            ) : (
              <EyeOff className='text-muted-foreground h-4 w-4' />
            )}
          </Button>
          <div className='relative flex-1'>
            <Search className='text-muted-foreground absolute top-3 left-3 h-4 w-4' />
            <Input
              placeholder='Search categories...'
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>
      </div>

      {/* Tree */}
      <div className='border-border bg-card flex-1 space-y-1 overflow-y-auto rounded-lg border p-3'>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <CategoryTreeItem
              categories={categories}
              key={category.id}
              category={category}
              isExpanded={effectiveExpandedIds.has(category.id)}
              selectedId={selectedId}
              onToggleExpand={toggleExpand}
              onSelect={onSelectCategory}
              level={0}
              expandedIds={effectiveExpandedIds}
              setExpandedIds={setExpandedIds}
              addingParentId={addingParentId}
              setAddingParentId={setAddingParentId}
              keptIds={keptIds}
              showHidden={showHidden}
            />
          ))
        ) : (
          <p className='text-muted-foreground py-8 text-center text-sm'>
            No categories found
          </p>
        )}
      </div>
    </div>
  );
}
