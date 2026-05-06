'use client';

import { useState, useMemo, KeyboardEvent } from 'react';
import { Eye, EyeOff, Plus, Search, Tag as TagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { tags } from '@prisma/client';
import { useTagContext } from '../context/tag-context';
import { onToast, onToastError } from '@/lib/toast';
import { generateSlug } from '../lib/slug';

const RECENT_LIMIT = 3;

interface TagListPanelProps {
  tags: tags[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedId: string | null;
  onSelectTag: (id: string) => void;
}

export default function TagListPanel({
  tags,
  searchTerm,
  onSearchChange,
  selectedId,
  onSelectTag
}: TagListPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const visibleTags = useMemo(
    () => (showHidden ? tags : tags.filter((t) => t.isActive)),
    [tags, showHidden]
  );

  const recentTags = useMemo(() => {
    return [...visibleTags]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, RECENT_LIMIT);
  }, [visibleTags]);

  const filtered = visibleTags.filter((t) =>
    (t.name ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='flex h-full flex-col gap-4'>
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h2 className='text-foreground text-lg font-semibold'>Tags</h2>
          <Button size='sm' onClick={() => setIsAdding(true)} className='gap-2'>
            <Plus className='h-4 w-4' />
            <span className='hidden sm:inline'>Add</span>
          </Button>
        </div>

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
              placeholder='Search tags...'
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className='pl-9'
            />
          </div>
        </div>
      </div>

      <div className='border-border bg-card flex flex-1 flex-col overflow-hidden rounded-lg border'>
        {/* Top: Recently Updated */}
        {recentTags.length > 0 && (
          <div className='border-border border-b'>
            <p className='text-muted-foreground px-3 pt-3 pb-1 text-xs font-medium tracking-wider uppercase'>
              Recently Updated
            </p>
            <div className='space-y-1 px-3 pb-2'>
              {recentTags.map((tag) => (
                <TagListItem
                  key={`recent-${tag.id}`}
                  tag={tag}
                  isSelected={selectedId === tag.id}
                  onSelect={onSelectTag}
                />
              ))}
            </div>
          </div>
        )}

        {/* Bottom: All tags (filtered + scrollable) */}
        <div className='flex flex-1 flex-col overflow-y-auto p-3'>
          <p className='text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase'>
            All Tags
          </p>

          <div className='space-y-1'>
            {isAdding && <InlineTagInput onClose={() => setIsAdding(false)} />}

            {filtered.length > 0
              ? filtered.map((tag) => (
                  <TagListItem
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedId === tag.id}
                    onSelect={onSelectTag}
                  />
                ))
              : !isAdding && (
                  <p className='text-muted-foreground py-8 text-center text-sm'>
                    No tags found
                  </p>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TagListItem({
  tag,
  isSelected,
  onSelect
}: {
  tag: tags;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const isInactive = !tag.isActive;
  return (
    <div
      onClick={() => onSelect(tag.id)}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 transition-colors ${
        isSelected
          ? 'bg-primary text-primary-foreground'
          : isInactive
            ? 'text-muted-foreground hover:bg-muted'
            : 'text-foreground hover:bg-muted'
      }`}
      title={isInactive ? 'Inactive' : undefined}
    >
      <span
        className={`inline-block h-3 w-3 flex-shrink-0 rounded-full border ${
          isInactive ? 'opacity-50' : ''
        }`}
        style={{ backgroundColor: tag.color || 'transparent' }}
        aria-hidden
      />
      <TagIcon
        className={`h-4 w-4 flex-shrink-0 ${isInactive ? 'opacity-60' : ''}`}
      />
      <span
        className={`flex-1 truncate text-sm ${isInactive ? 'line-through' : ''}`}
      >
        {tag.name}
      </span>
      {isInactive && !isSelected && (
        <span className='border-muted-foreground/30 text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] uppercase'>
          Inactive
        </span>
      )}
    </div>
  );
}

function InlineTagInput({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleAddTag } = useTagContext();

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await handleAddTag({
        name: trimmed,
        slug: generateSlug(trimmed)
      });
      onToast('Tag added');
      onClose();
    } catch (error: any) {
      onToastError('Failed to add tag', error?.message);
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
    <div className='flex w-full items-center gap-2 rounded-md px-2 py-1'>
      <span
        className='inline-block h-3 w-3 flex-shrink-0 rounded-full border'
        aria-hidden
      />
      <TagIcon className='text-muted-foreground h-4 w-4 flex-shrink-0' />
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!isSubmitting) onClose();
        }}
        placeholder='New tag'
        disabled={isSubmitting}
        className='h-7 text-sm'
      />
    </div>
  );
}
