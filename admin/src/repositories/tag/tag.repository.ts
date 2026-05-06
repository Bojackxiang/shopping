'use server';

import { db } from '@/lib/prisma';
import { handleError } from '@/utils';
import {
  GetAllTagsInputProps,
  PaginatedTagsOutput,
  CreateTagInput,
  UpdateTagInput
} from './tag.types';

/**
 * Get all tags with pagination
 * @param page 页码，默认为 1
 * @param pageSize 每页数量，默认为 10
 * @param orderBy 排序字段，默认按名称
 * @param isActive 是否激活
 */
export const getAllTags = async ({
  page = 1,
  pageSize = 10,
  orderBy = 'name',
  isActive
}: GetAllTagsInputProps = {}): Promise<PaginatedTagsOutput> => {
  try {
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    if (isActive !== undefined) where.isActive = isActive;

    const [tags, total] = await Promise.all([
      db.tags.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { [orderBy]: 'asc' },
        include: {
          _count: {
            select: {
              product_tags: true
            }
          }
        }
      }),
      db.tags.count({ where })
    ]);

    return {
      data: tags as any,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Get tag by ID
 * @param id 标签 ID
 * @returns Tag 或 null
 */
export const getTagById = async (id: string) => {
  try {
    const tag = await db.tags.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            product_tags: true
          }
        }
      }
    });

    return tag;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Get tag by slug
 * @param slug 标签 slug
 * @returns Tag 或 null
 */
export const getTagBySlug = async (slug: string) => {
  try {
    const tag = await db.tags.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            product_tags: true
          }
        }
      }
    });

    return tag;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Create a new tag
 * @param data 标签数据
 * @returns 创建的标签
 */
export const createTag = async (data: CreateTagInput) => {
  try {
    const tag = await db.tags.create({
      data
    });

    return tag;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Update a tag
 * @param id 标签 ID
 * @param data 更新数据
 * @returns 更新后的标签
 */
export const updateTag = async (id: string, data: UpdateTagInput) => {
  try {
    const tag = await db.tags.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return tag;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Hard-delete a tag. Related product_tags rows are removed automatically
 * via the schema's onDelete: Cascade on the tagId foreign key.
 * @param id 标签 ID
 * @returns 已删除的标签
 */
export const deleteTag = async (id: string) => {
  try {
    const tag = await db.tags.delete({
      where: { id }
    });

    return tag;
  } catch (error) {
    throw handleError(error);
  }
};

/**
 * Get products that reference a given tag.
 * @param tagId 标签 ID
 * @returns 引用该标签的产品 [{ id, name }]
 */
export const getTagProductReferences = async (
  tagId: string
): Promise<Array<{ id: string; name: string }>> => {
  try {
    const rows = await db.product_tags.findMany({
      where: { tagId },
      select: {
        products: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    return rows.map((r) => r.products);
  } catch (error) {
    throw handleError(error);
  }
};
