'use client';

import PageContainer from '@/components/layout/page-container';
import TagLoading from '../component/tag-loading';
import TagsList from '../component/tags-list';
import { TagProvider, useTagContext } from '../context/tag-context';

const TagViewContent = () => {
  const {
    isLoading,
    searchTerm,
    selectedTag,
    selectedTagId,
    setSearchTerm,
    setSelectedTagId
  } = useTagContext();

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6'>
        {isLoading && <TagLoading />}
        {!isLoading && (
          <TagsList
            searchTerm={searchTerm}
            selectedTagId={selectedTagId}
            selectedTag={selectedTag}
            setSearchTerm={setSearchTerm}
            setSelectedTagId={setSelectedTagId}
          />
        )}
      </div>
    </PageContainer>
  );
};

const TagView = () => {
  return (
    <TagProvider>
      <TagViewContent />
    </TagProvider>
  );
};

export default TagView;
