'use server';

import { db } from '@/lib/prisma';
import { handleError } from '@/utils';
import { randomUUID } from 'crypto';
import { UpdateCategoryInput } from './category.types';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/[\s_-]+/g, '-') // 替换空格、下划线为连字符
    .replace(/^-+|-+$/g, ''); // 移除首尾连字符
}

async function generatePath(
  parentId: string | null,
  slug: string
): Promise<string> {
  if (!parentId) return '';

  const parent = await db.categories.findUnique({
    where: { id: parentId },
    select: { path: true, id: true }
  });

  if (!parent) return slug;

  return parent.path ? `${parent.path}>${slug}` : parent.id;
}

export const getAllCategories = async () => {
  try {
    const categories = await db.categories.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    return categories;
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const category = await db.categories.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    return category;
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const category = await db.categories.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    return category;
  } catch (error) {
    throw handleError(error);
  }
};

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string;
  parentId: string | null;
  isActive?: boolean;
  sortOrder?: number;
}) {
  try {
    const id = randomUUID();

    const slug = data.slug || generateSlug(data.name);

    const existingSlug = await db.categories.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      throw new Error(`Slug "${slug}" already exists`);
    }

    const existingName = await db.categories.findUnique({
      where: { name: data.name }
    });

    if (existingName) {
      throw new Error(`Category name "${data.name}" already exists`);
    }

    const path = await generatePath(data.parentId || null, slug);

    const category = await db.categories.create({
      data: {
        id,
        name: data.name,
        slug,
        description: data.description,
        imageUrl: data.imageUrl,
        parentId: data.parentId || null,
        path,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        updatedAt: new Date()
      }
    });

    return { success: true, data: category };
  } catch (error: any) {
    console.error('Create category error:', error);
    return { success: false, error: error.message };
  }
}

export const updateCategory = async (id: string, data: UpdateCategoryInput) => {
  try {
    const category = await db.categories.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return category;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    // user are not able to delete parentId === null categories
    const categoryToDelete = await db.categories.findUnique({
      where: { id },
      select: { parentId: true }
    });

    if (!categoryToDelete) {
      throw new Error('Category not found');
    }

    if (categoryToDelete.parentId === null) {
      throw new Error('Cannot delete root category');
    }

    // verify if category has any children or products before deleting
    // verify product
    const productsCount = await db.products.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      throw new Error(
        'Cannot delete category with associated products. Please reassign or delete the products first.'
      );
    }

    const childCategoriesCount = await db.categories.count({
      where: { parentId: id }
    });

    if (childCategoriesCount > 0) {
      throw new Error(
        'Cannot delete category with subcategories. Please reassign or delete the subcategories first.'
      );
    }

    // soft delete the category first
    const category = await db.categories.update({
      where: { id },
      data: {
        isActive: false
      }
    });

    // delete the category by id
    await db.categories.delete({
      where: { id }
    });

    return category;
  } catch (error) {
    throw handleError(error);
  }
};
