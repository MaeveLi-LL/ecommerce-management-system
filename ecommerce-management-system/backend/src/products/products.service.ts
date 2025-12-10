import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // 创建商品
  async create(
    userId: number,
    name: string,
    description: string,
    price: number,
    stock: number,
    categoryId?: number,
  ) {
    return this.prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
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

  // 获取用户的所有商品
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

  // 获取单个商品
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
      throw new NotFoundException('商品不存在');
    }

    return product;
  }

  // 更新商品
  async update(
    id: number,
    userId: number,
    name?: string,
    description?: string,
    price?: number,
    stock?: number,
    categoryId?: number,
  ) {
    const product = await this.findOne(id);

    // 检查商品是否属于当前用户
    if (product.userId !== userId) {
      throw new ForbiddenException('无权修改此商品');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? price : product.price,
        stock: stock !== undefined ? stock : product.stock,
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

  // 删除商品
  async remove(id: number, userId: number) {
    const product = await this.findOne(id);

    // 检查商品是否属于当前用户
    if (product.userId !== userId) {
      throw new ForbiddenException('无权删除此商品');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}


