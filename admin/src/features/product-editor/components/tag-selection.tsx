'use client';

import {
  KeyboardEvent,
  useEffect,
  useMemo,
  useState
} from 'react';
import { useSWRConfig } from 'swr';
import {
  Check,
  Loader2,
  Plus,
  Search,
  Tag as TagIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { onToast, onToastError } from '@/lib/toast';
import { createTag } from '@/repositories';
import { tags } from '@prisma/client';
import { generateSlug } from '@/features/tag/lib/slug';

interface TagSelectionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableTags: tags[];
  selectedTagIds: string[];
  onConfirm: (tagIds: string[]) => void;
}

export const TagSelection = ({
  open,
  onOpenChange,
  availableTags,
  selectedTagIds,
  onConfirm
}: TagSelectionProps) => {
  const { mutate } = useSWRConfig();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedIds(new Set(selectedTagIds));
      setSearchTerm('');
      setIsAdding(false);
    }
  }, [open, selectedTagIds]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return availableTags.filter((t) =>
      (t.name || '').toLowerCase().includes(q)
    );
  }, [availableTags, searchTerm]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    setConfirmLoading(true);
    try {
      onConfirm(Array.from(selectedIds));
      onOpenChange(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Select Tags</DialogTitle>
          <DialogDescription>
            Choose tags for this product. You can also create a new tag.
          </DialogDescription>
        </DialogHeader>

        <div className='relative'>
          <Search
            className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2'
            size={18}
          />
          <Input
            placeholder='Search tags...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <ScrollArea className='border-border bg-card h-72 rounded-lg border p-3'>
          {isAdding && (
            <NewTagInput
              onClose={() => setIsAdding(false)}
              onCreated={(tag) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  next.add(tag.id);
                  return next;
                });
                mutate('tags');
                setIsAdding(false);
              }}
            />
          )}

          {filtered.length > 0
            ? (
                <div className='space-y-1'>
                  {filtered.map((tag) => (
                    <TagRow
                      key={tag.id}
                      tag={tag}
                      isSelected={selectedIds.has(tag.id)}
                      onToggle={() => toggleSelect(tag.id)}
                    />
                  ))}
                </div>
              )
            : !isAdding && (
                <p className='text-muted-foreground py-8 text-center text-sm'>
                  No tags found
                </p>
              )}
        </ScrollArea>

        <div className='flex items-center justify-between gap-2 pt-2'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className='gap-2'
          >
            <Plus className='h-4 w-4' />
            New tag
          </Button>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
              disabled={confirmLoading}
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={handleConfirm}
              disabled={confirmLoading}
            >
              {confirmLoading ? (
                <span className='inline-flex items-center'>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Confirming...
                </span>
              ) : (
                `Confirm (${selectedIds.size})`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function TagRow({
  tag,
  isSelected,
  onToggle
}: {
  tag: tags;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const isInactive = !tag.isActive;
  return (
    <button
      type='button'
      onClick={onToggle}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition-colors',
        isSelected ? 'bg-accent' : 'hover:bg-muted'
      )}
    >
      <span
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-all',
          isSelected
            ? 'bg-primary border-primary'
            : 'border-input hover:border-primary'
        )}
      >
        {isSelected && (
          <Check
            size={14}
            className='text-primary-foreground'
            strokeWidth={3}
          />
        )}
      </span>
      <span
        className={cn(
          'inline-block h-3 w-3 flex-shrink-0 rounded-full border',
          isInactive && 'opacity-50'
        )}
        style={{ backgroundColor: tag.color || 'transparent' }}
        aria-hidden
      />
      <TagIcon
        className={cn(
          'h-4 w-4 flex-shrink-0',
          isInactive && 'opacity-60'
        )}
      />
      <span
        className={cn(
          'flex-1 truncate text-sm',
          isInactive && 'text-muted-foreground line-through'
        )}
      >
        {tag.name}
      </span>
      {isInactive && (
        <span className='border-muted-foreground/30 text-muted-foreground rounded border px-1.5 py-0.5 text-[10px] uppercase'>
          Inactive
        </span>
      )}
    </button>
  );
}

function NewTagInput({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (tag: tags) => void;
}) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      onClose();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const tag = await createTag({
        name: trimmed,
        slug: generateSlug(trimmed)
      });
      onToast('Tag created');
      onCreated(tag);
    } catch (error: any) {
      onToastError('Failed to create tag', error?.message);
      setSubmitting(false);
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
    <div className='mb-2 flex items-center gap-2 rounded-md px-2 py-1'>
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
          if (!submitting) onClose();
        }}
        placeholder='New tag name (Enter to create)'
        disabled={submitting}
        className='h-7 text-sm'
      />
    </div>
  );
}
