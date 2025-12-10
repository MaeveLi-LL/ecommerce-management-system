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

    return this.prisma.product.create({
      data: {
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


