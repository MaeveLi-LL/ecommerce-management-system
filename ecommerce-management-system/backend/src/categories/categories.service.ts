import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Create category
  async create(userId: number, name: string, parentId?: number) {
    // Check if category name already exists for this user
    const existing = await this.prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existing) {
      throw new ConflictException('Category name already exists');
    }

    // If parent category is specified, check if it belongs to current user
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException('No permission to use this parent category');
      }
    }

    // Find the smallest available ID starting from 1
    return await this.prisma.$transaction(async (tx) => {
      // Get all existing IDs sorted
      const existingIds = await tx.category.findMany({
        select: { id: true },
        orderBy: { id: 'asc' },
      });

      // Find the smallest available ID starting from 1
      let nextId = 1;
      for (const category of existingIds) {
        if (category.id === nextId) {
          nextId++;
        } else {
          // Found a gap, use this ID
          break;
        }
      }

      // Create with the calculated ID
      const createdCategory = await tx.category.create({
        data: {
          id: nextId,
          name,
          userId,
          parentId: parentId || null,
        },
        include: {
          parent: true,
          children: true,
        },
      });

      // Update sequence to match the new max ID
      const maxId = existingIds.length > 0 
        ? Math.max(...existingIds.map(c => c.id), nextId)
        : nextId;
      
      await tx.$executeRawUnsafe(
        `SELECT setval('categories_id_seq', ${maxId}, true)`
      );

      return createdCategory;
    });
  }

  // Get all categories for current user
  async findAll(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Find single category by ID
  async findOne(id: number, userId?: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // If userId is provided, check if category belongs to that user
    if (userId !== undefined && category.userId !== userId) {
      throw new ForbiddenException('No permission to access this category');
    }

    return category;
  }

  // Update category information
  async update(id: number, userId: number, name?: string, parentId?: number | null) {
    const category = await this.findOne(id, userId);

    // If changing name, check if new name is already used by this user
    if (name && name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name,
          userId,
        },
      });
      if (existing) {
        throw new ConflictException('Category name already exists');
      }
    }

    // If parent category is specified, check if it belongs to current user
    if (parentId !== null && parentId !== undefined) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException('No permission to use this parent category');
      }
      // Cannot set category as its own parent
      if (parentId === id) {
        throw new ConflictException('Cannot set category as its own parent');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: name || category.name,
        parentId: parentId !== undefined ? parentId : category.parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  // Delete category
  async remove(id: number, userId: number) {
    const category = await this.findOne(id, userId);
    
    // Check if there are child categories
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (childrenCount > 0) {
      throw new ConflictException('Cannot delete category with child categories');
    }

    // Before deleting category, set categoryId to null for all products using this category
    // This way products won't show deleted category
    await this.prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
