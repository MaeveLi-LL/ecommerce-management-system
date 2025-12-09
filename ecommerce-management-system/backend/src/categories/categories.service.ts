import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // 创建分类
  async create(name: string, parentId?: number) {
    // 检查分类名称是否已存在
    const existing = await this.prisma.category.findUnique({
      where: { name },
    });

    if (existing) {
      throw new ConflictException('分类名称已存在');
    }

    return this.prisma.category.create({
      data: {
        name,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  // 获取所有分类
  async findAll() {
    return this.prisma.category.findMany({
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

  // 根据ID获取分类
  async findOne(id: number) {
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

    return category;
  }

  // 更新分类
  async update(id: number, name?: string, parentId?: number) {
    const category = await this.findOne(id);

    // 如果更新名称，检查是否重复
    if (name && name !== category.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name },
      });
      if (existing) {
        throw new ConflictException('分类名称已存在');
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
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category.delete({
      where: { id },
    });
  }
}
