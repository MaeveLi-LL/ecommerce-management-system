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
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
    });
  }

  // 获取所有商品（可筛选用户）
  async findAll(userId?: number) {
    return this.prisma.product.findMany({
      where: userId ? { userId } : {},
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 根据ID获取商品
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
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

    // 检查是否是商品所有者
    if (product.userId !== userId) {
      throw new ForbiddenException('无权修改此商品');
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        price: price || product.price,
        stock: stock !== undefined ? stock : product.stock,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        category: true,
      },
    });
  }

  // 删除商品
  async remove(id: number, userId: number) {
    const product = await this.findOne(id);

    // 检查是否是商品所有者
    if (product.userId !== userId) {
      throw new ForbiddenException('无权删除此商品');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
