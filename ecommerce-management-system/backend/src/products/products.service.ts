import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // Create product
  async create(
    userId: number,
    name: string,
    description: string,
    price: number,
    stock: number,
    categoryId?: number,
    imageUrl?: string,
  ) {
    // If category is specified, check if it belongs to current user
    if (categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      if (category.userId !== userId) {
        throw new ForbiddenException('No permission to use this category');
      }
    }

    // Find the smallest available ID starting from 1
    return await this.prisma.$transaction(async (tx) => {
      // Get all existing IDs sorted
      const existingIds = await tx.product.findMany({
        select: { id: true },
        orderBy: { id: 'asc' },
      });

      // Find the smallest available ID starting from 1
      let nextId = 1;
      for (const product of existingIds) {
        if (product.id === nextId) {
          nextId++;
        } else {
          // Found a gap, use this ID
          break;
        }
      }

      // Create with the calculated ID
      const createdProduct = await tx.product.create({
        data: {
          id: nextId,
          name,
          description,
          price,
          stock,
          imageUrl: imageUrl || null,
          userId,
          categoryId: categoryId || null,
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });

      // Update sequence to match the new max ID
      const maxId = existingIds.length > 0 
        ? Math.max(...existingIds.map(p => p.id), nextId)
        : nextId;
      
      await tx.$executeRawUnsafe(
        `SELECT setval('products_id_seq', ${maxId}, true)`
      );

      return createdProduct;
    });
  }

  // Get all products for user
  async findAll(userId: number) {
    return this.prisma.product.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get single product
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update product
  async update(
    id: number,
    userId: number,
    name?: string,
    description?: string,
    price?: number,
    stock?: number,
    categoryId?: number,
    imageUrl?: string,
  ) {
    const product = await this.findOne(id);

    // Check if product belongs to current user
    if (product.userId !== userId) {
      throw new ForbiddenException('No permission to modify this product');
    }

    // If new category is specified, check if it belongs to current user
    if (categoryId !== undefined && categoryId !== null) {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      if (category.userId !== userId) {
        throw new ForbiddenException('No permission to use this category');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        stock: stock !== undefined ? stock : product.stock,
        imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      },
      include: {
        category: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
  }

  // Delete product
  async remove(id: number, userId: number) {
    const product = await this.findOne(id);

    // Check if product belongs to current user
    if (product.userId !== userId) {
      throw new ForbiddenException('No permission to delete this product');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}


