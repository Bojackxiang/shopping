'use client';

import PageContainer from '@/components/layout/page-container';
import CategoryLoading from '../component/category-loading';
import CategoriesList from '../component/categories-list';
import {
  CategoryProvider,
  useCategoryContext
} from '../context/category-context';

const CategoryViewContent = () => {
  const {
    isLoading,
    searchTerm,
    selectedCategory,
    selectedCategoryId,
    setSearchTerm,
    setSelectedCategoryId
  } = useCategoryContext();

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:gap-6 lg:p-6'>
        {isLoading && <CategoryLoading />}
        {!isLoading && (
          <CategoriesList
            searchTerm={searchTerm}
            selectedCategoryId={selectedCategoryId}
            selectedCategory={selectedCategory}
            setSearchTerm={setSearchTerm}
            setSelectedCategoryId={setSelectedCategoryId}
          />
        )}
      </div>
    </PageContainer>
  );
};

const CategoryView = () => {
  return (
    <CategoryProvider>
      <CategoryViewContent />
    </CategoryProvider>
  );
};

export default CategoryView;
