import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // 创建分类
  async create(userId: number, name: string, parentId?: number) {
    // 检查该用户下分类名是否重复
    const existing = await this.prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    });

    if (existing) {
      throw new ConflictException('分类名称已存在');
    }

    // 如果指定了父分类，检查父分类是否属于当前用户
    if (parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException('无权使用该父分类');
      }
    }

    return this.prisma.category.create({
      data: {
        name,
        userId,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  // 获取当前用户的所有分类列表
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

  // 根据ID查找单个分类
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
      throw new NotFoundException('分类不存在');
    }

    // 如果提供了userId，检查分类是否属于该用户
    if (userId !== undefined && category.userId !== userId) {
      throw new ForbiddenException('无权访问此分类');
    }

    return category;
  }

  // 更新分类信息
  async update(id: number, userId: number, name?: string, parentId?: number | null) {
    const category = await this.findOne(id, userId);

    // 如果要改名字，先检查新名字是否已经被该用户用了
    if (name && name !== category.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name,
          userId,
        },
      });
      if (existing) {
        throw new ConflictException('分类名称已存在');
      }
    }

    // 如果指定了父分类，检查父分类是否属于当前用户
    if (parentId !== null && parentId !== undefined) {
      const parent = await this.prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('父分类不存在');
      }
      if (parent.userId !== userId) {
        throw new ForbiddenException('无权使用该父分类');
      }
      // 不能将分类设置为自己的子分类
      if (parentId === id) {
        throw new ConflictException('不能将分类设置为自己的父分类');
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

  // 删除分类
  async remove(id: number, userId: number) {
    const category = await this.findOne(id, userId);
    
    // 检查是否有子分类
    const childrenCount = await this.prisma.category.count({
      where: { parentId: id },
    });
    if (childrenCount > 0) {
      throw new ConflictException('该分类下还有子分类，无法删除');
    }

    // 删除分类前，先将所有使用该分类的商品的 categoryId 设置为 null
    // 这样商品就不会显示已删除的分类了
    await this.prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
