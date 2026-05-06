'use client';

import { useState, KeyboardEvent } from 'react';
import { ChevronRight, FolderOpen, Leaf, Plus } from 'lucide-react';
import { categoryType } from '../schema/category-schema';
import { useCategoryContext } from '../context/category-context';
import { Input } from '@/components/ui/input';
import { onToast, onToastError } from '@/lib/toast';

interface CategoryTreeItemProps {
  category: any;
  categories: categoryType[];
  isExpanded: boolean;
  selectedId: string | null;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  level: number;
  expandedIds: Set<string>;
  setExpandedIds: (ids: Set<string>) => void;
  addingParentId: string | undefined;
  setAddingParentId: (id: string | undefined) => void;
  keptIds: Set<string> | null;
  showHidden: boolean;
}

export default function CategoryTreeItem({
  category,
  categories,
  isExpanded,
  selectedId,
  onToggleExpand,
  onSelect,
  level,
  expandedIds,
  setExpandedIds,
  addingParentId,
  setAddingParentId,
  keptIds,
  showHidden
}: CategoryTreeItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const children = categories
    .filter((c) => c.parentId === category.id)
    .filter((c) => (keptIds ? keptIds.has(c.id) : true))
    .filter((c) => showHidden || (c as any).isActive);
  const hasChildren = children.length > 0;
  const isAddingHere = addingParentId === category.id;
  const isSelected = selectedId === category.id;
  const isInactive = !category.isActive;

  const handleAddChildClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!expandedIds.has(category.id)) {
      const next = new Set(expandedIds);
      next.add(category.id);
      setExpandedIds(next);
    }
    setAddingParentId(category.id);
  };

  return (
    <div>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onSelect(category.id)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : isInactive
              ? 'text-muted-foreground hover:bg-muted'
              : 'text-foreground hover:bg-muted'
        }`}
        style={{ marginLeft: `${level * 12}px` }}
        title={isInactive ? 'Inactive' : undefined}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(category.id);
            }}
            className='flex-shrink-0'
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
          </button>
        ) : (
          <div className='w-4' />
        )}
        {hasChildren ? (
          <FolderOpen
            className={`h-4 w-4 flex-shrink-0 ${isInactive ? 'opacity-50' : ''}`}
          />
        ) : (
          <Leaf
            className={`h-4 w-4 flex-shrink-0 ${isInactive ? 'opacity-50' : ''}`}
          />
        )}
        <span
          className={`flex-1 truncate text-sm ${isInactive ? 'line-through' : ''}`}
        >
          {category.name}
        </span>
        {isInactive && !isSelected && (
          <span className='border-muted-foreground/30 text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] uppercase'>
            Inactive
          </span>
        )}
        {isHovered && !isAddingHere && (
          <button
            onClick={handleAddChildClick}
            title='Add subcategory'
            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors ${
              isSelected
                ? 'hover:bg-primary-foreground/20'
                : 'hover:bg-foreground/10'
            }`}
          >
            <Plus className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {(isExpanded || isAddingHere) && (
        <div>
          {isExpanded &&
            children.map((child) => (
              <CategoryTreeItem
                categories={categories}
                key={child.id}
                category={child}
                isExpanded={expandedIds.has(child.id)}
                selectedId={selectedId}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                level={level + 1}
                expandedIds={expandedIds}
                setExpandedIds={setExpandedIds}
                addingParentId={addingParentId}
                setAddingParentId={setAddingParentId}
                keptIds={keptIds}
                showHidden={showHidden}
              />
            ))}
          {isAddingHere && (
            <InlineCategoryInput
              level={level + 1}
              parentId={category.id}
              onClose={() => setAddingParentId(undefined)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function InlineCategoryInput({
  level,
  parentId,
  onClose
}: {
  level: number;
  parentId: string | null;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleAddCategory } = useCategoryContext();

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleAddCategory({
        name: trimmed,
        slug: '',
        description: null,
        parentId
      });
      onToast('Category added');
      onClose();
    } catch (error: any) {
      onToastError('Failed to add category', error?.message);
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className='flex w-full items-center gap-2 rounded-md px-2 py-1'
      style={{ marginLeft: `${level * 12}px` }}
    >
      <div className='w-4' />
      <Leaf className='text-muted-foreground h-4 w-4 flex-shrink-0' />
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!isSubmitting) onClose();
        }}
        placeholder='New category'
        disabled={isSubmitting}
        className='h-7 text-sm'
      />
    </div>
  );
}
