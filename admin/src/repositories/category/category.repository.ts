'use server';

import { db } from '@/lib/prisma';
import { handleError } from '@/utils';
import { randomUUID } from 'crypto';
import { UpdateCategoryInput } from './category.types';

// ========================================
// Helper Functions
// ========================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 生成分类的 path
 * 根分类: path = slug (如 "all-categories")
 * 子分类: path = parent.path/slug (如 "all-categories/90s")
 */
async function generatePath(
  parentId: string | null,
  slug: string
): Promise<string> {
  // 根分类：path 就是 slug
  if (!parentId) return slug;

  // 获取父分类的 path
  const parent = await db.categories.findUnique({
    where: { id: parentId },
    select: { path: true }
  });

  if (!parent) {
    throw new Error('Parent category not found');
  }

  // 子分类：parent.path/slug
  return `${parent.path}/${slug}`;
}

/**
 * 递归更新所有子分类的 path
 * 当父分类的 slug 或 path 改变时调用
 */
async function updateChildrenPaths(parentId: string, newParentPath: string) {
  // 获取所有直接子分类
  const children = await db.categories.findMany({
    where: { parentId },
    select: { id: true, slug: true }
  });

  // 递归更新每个子分类
  for (const child of children) {
    const newChildPath = `${newParentPath}/${child.slug}`;

    // 更新子分类的 path
    await db.categories.update({
      where: { id: child.id },
      data: {
        path: newChildPath,
        updatedAt: new Date()
      }
    });

    // 递归更新子分类的子分类
    await updateChildrenPaths(child.id, newChildPath);
  }
}

async function validateCategoryNotProtected(
  id: string,
  operation: 'update' | 'delete' | 'deactivate' | 'activate'
) {
  const category = await db.categories.findUnique({
    where: { id },
    select: { id: true, isProtected: true, parentId: true }
  });

  if (!category) {
    throw new Error('Category not found');
  }

  if (category.isProtected) {
    throw new Error(`Cannot ${operation} a protected category`);
  }

  return category;
}

/**
 * 检查分类名称是否已存在（排除当前分类）
 */
async function validateUniqueName(name: string, excludeId?: string) {
  const existing = await db.categories.findUnique({
    where: { name }
  });

  if (existing && existing.id !== excludeId) {
    throw new Error(`Category name "${name}" already exists`);
  }
}

/**
 * 检查 slug 是否已存在（排除当前分类）
 */
async function validateUniqueSlug(slug: string, excludeId?: string) {
  const existing = await db.categories.findUnique({
    where: { slug }
  });

  if (existing && existing.id !== excludeId) {
    throw new Error(`Slug "${slug}" already exists`);
  }
}

/**
 * 检查父分类是否允许子分类
 */
async function validateParentAllowsChildren(parentId: string | null) {
  if (!parentId) return;

  const parent = await db.categories.findUnique({
    where: { id: parentId },
    select: { allowChildren: true }
  });

  if (!parent) {
    throw new Error('Parent category not found');
  }

  if (!parent.allowChildren) {
    throw new Error('Parent category does not allow children');
  }
}

async function validateNoAssociatedProducts(id: string) {
  const productsCount = await db.product_categories.count({
    where: { categoryId: id }
  });

  if (productsCount > 0) {
    throw new Error(
      'Cannot delete category with associated products. Please reassign or delete the products first.'
    );
  }
}

async function validateNoChildren(id: string) {
  const childrenCount = await db.categories.count({
    where: { parentId: id }
  });

  if (childrenCount > 0) {
    throw new Error(
      'Cannot delete category with subcategories. Please reassign or delete the subcategories first.'
    );
  }
}

// ========================================
// Public API Functions
// ========================================

export const getAllCategories = async () => {
  try {
    const categories = await db.categories.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    return categories.map((category) => ({
      ...category,
      productCount: category._count.products
    }));
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const category = await db.categories.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        children: true,
        parent: true
      }
    });

    if (!category) return null;

    return {
      ...category,
      productCount: category._count.products
    };
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryBySlug = async (slug: string) => {
  try {
    const category = await db.categories.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
        children: true,
        parent: true
      }
    });

    if (!category) return null;

    return {
      ...category,
      productCount: category._count.products
    };
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
    await validateParentAllowsChildren(data.parentId);

    const id = randomUUID();
    const slug = data.slug || generateSlug(data.name);

    await validateUniqueSlug(slug);
    await validateUniqueName(data.name);

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
    throw handleError(error);
  }
}

export const updateCategory = async (id: string, data: UpdateCategoryInput) => {
  try {
    // 验证分类存在且未被保护
    const category = await validateCategoryNotProtected(id, 'update');

    // 获取当前分类的完整信息
    const currentCategory = await db.categories.findUnique({
      where: { id },
      select: { slug: true, path: true, parentId: true }
    });

    if (!currentCategory) {
      throw new Error('Category not found');
    }

    // 验证名称唯一性（如果要更新名称）
    if (data.name) {
      await validateUniqueName(data.name, id);
    }

    // 验证 slug 唯一性（如果要更新 slug）
    if (data.slug) {
      await validateUniqueSlug(data.slug, id);
    }

    // 验证新的父分类是否允许子分类（如果要更新 parentId）
    if (data.parentId !== undefined) {
      await validateParentAllowsChildren(data.parentId);

      // 防止将分类移动到自己的子分类下（会造成循环引用）
      if (data.parentId) {
        const potentialParent = await db.categories.findUnique({
          where: { id: data.parentId },
          select: { path: true }
        });

        if (
          potentialParent &&
          potentialParent.path.includes(currentCategory.path)
        ) {
          throw new Error('Cannot move category to its own subcategory');
        }
      }
    }

    // 检查是否需要重新计算 path
    const slugChanged = data.slug && data.slug !== currentCategory.slug;
    const parentChanged =
      data.parentId !== undefined && data.parentId !== currentCategory.parentId;
    const needsPathUpdate = slugChanged || parentChanged;

    let newPath = currentCategory.path;

    if (needsPathUpdate) {
      // 使用新 slug（如果有）或当前 slug
      const effectiveSlug = data.slug || currentCategory.slug;

      // 使用新 parentId（如果有）或当前 parentId
      const effectiveParentId =
        data.parentId !== undefined ? data.parentId : currentCategory.parentId;

      // 重新生成 path
      newPath = await generatePath(effectiveParentId, effectiveSlug);
    }

    // 更新分类
    const updated = await db.categories.update({
      where: { id },
      data: {
        ...data,
        ...(needsPathUpdate && { path: newPath }),
        updatedAt: new Date()
      }
    });

    // 如果 path 改变了，需要级联更新所有子分类的 path
    if (needsPathUpdate && newPath !== currentCategory.path) {
      await updateChildrenPaths(id, newPath);
    }

    return updated;
  } catch (error) {
    throw handleError(error);
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const category = await validateCategoryNotProtected(id, 'delete');

    if (category.parentId === null) {
      throw new Error('Cannot delete root category');
    }

    await validateNoAssociatedProducts(id);

    await validateNoChildren(id);

    await db.categories.update({
      where: { id },
      data: { isActive: false }
    });

    await db.categories.delete({
      where: { id }
    });

    return category;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Deactivate a category and all of its descendants by flipping isActive to
 * false. Protected categories are blocked. Returns the count of rows
 * updated (including the category itself).
 */
export const deactivateCategory = async (id: string) => {
  try {
    await validateCategoryNotProtected(id, 'deactivate');

    const idsToDeactivate: string[] = [id];
    let frontier: string[] = [id];
    while (frontier.length > 0) {
      const children = await db.categories.findMany({
        where: { parentId: { in: frontier } },
        select: { id: true }
      });
      if (children.length === 0) break;
      const childIds = children.map((c) => c.id);
      idsToDeactivate.push(...childIds);
      frontier = childIds;
    }

    const result = await db.categories.updateMany({
      where: { id: { in: idsToDeactivate } },
      data: { isActive: false, updatedAt: new Date() }
    });

    return { success: true, count: result.count };
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Activate a single category. Does not cascade — descendants stay
 * inactive and the user re-activates them manually.
 */
export const activateCategory = async (id: string) => {
  try {
    await validateCategoryNotProtected(id, 'activate');

    const updated = await db.categories.update({
      where: { id },
      data: { isActive: true, updatedAt: new Date() }
    });

    return { success: true, data: updated };
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryProducts = async (
  categoryId: string,
  options?: {
    includeSubcategories?: boolean;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    const {
      includeSubcategories = false,
      limit = 50,
      offset = 0
    } = options || {};

    let categoryIds = [categoryId];

    if (includeSubcategories) {
      const subcategories = await db.categories.findMany({
        where: {
          OR: [{ parentId: categoryId }, { path: { contains: categoryId } }]
        },
        select: { id: true }
      });
      categoryIds = [categoryId, ...subcategories.map((c) => c.id)];
    }

    const products = await db.products.findMany({
      where: {
        categories: {
          some: { categoryId: { in: categoryIds } }
        },
        status: 'ACTIVE',
        isActive: true
      },
      include: {
        categories: {
          include: { category: true }
        },
        variants: {
          where: { isActive: true },
          take: 1
        },
        product_images: {
          where: { isCover: true },
          take: 1
        }
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' }
    });

    return products;
  } catch (error) {
    throw handleError(error);
  }
};

export const getCategoryTree = async () => {
  try {
    const categories = await db.categories.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true, children: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    const buildTree = (parentId: string | null): any[] => {
      return categories
        .filter((cat) => cat.parentId === parentId)
        .map((cat) => ({
          ...cat,
          productCount: cat._count.products,
          childrenCount: cat._count.children,
          children: buildTree(cat.id)
        }));
    };

    return buildTree(null);
  } catch (error) {
    throw handleError(error);
  }
};

export const updateCategoriesOrder = async (
  updates: Array<{ id: string; sortOrder: number }>
) => {
  try {
    await db.$transaction(
      updates.map(({ id, sortOrder }) =>
        db.categories.update({
          where: { id },
          data: { sortOrder, updatedAt: new Date() }
        })
      )
    );

    return { success: true };
  } catch (error) {
    throw handleError(error);
  }
};
