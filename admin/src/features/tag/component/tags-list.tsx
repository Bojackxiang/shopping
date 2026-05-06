import React from 'react';
import TagListPanel from './tag-list-panel';
import TagDetail from './tag-detail';
import { useTagContext } from '../context/tag-context';

interface TagsListProps {
  searchTerm: string;
  selectedTagId: string | null;
  setSearchTerm: (term: string) => void;
  setSelectedTagId: (id: string | null) => void;
  selectedTag: any;
}

const TagsList = ({
  searchTerm,
  selectedTagId,
  setSearchTerm,
  setSelectedTagId,
  selectedTag
}: TagsListProps) => {
  const { tags } = useTagContext();

  return (
    <div className='flex flex-1 gap-4 lg:gap-6'>
      <div className='w-full flex-shrink-0 lg:w-80'>
        <TagListPanel
          tags={tags}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedId={selectedTagId}
          onSelectTag={setSelectedTagId}
        />
      </div>
      <div className='flex min-w-0 flex-1 flex-col'>
        {selectedTag ? (
          <TagDetail
            tag={selectedTag}
            onUpdate={() => setSelectedTagId(null)}
          />
        ) : (
          <div className='border-border bg-card/50 flex h-full flex-col items-center justify-center rounded-lg border'>
            <p className='text-muted-foreground mb-4'>No tag selected</p>
            <p className='text-muted-foreground text-xs'>
              Select a tag from the list or create a new one
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsList;
