import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('应该成功创建商品', async () => {
      const userId = 1;
      const categoryId = 1;
      const productData = {
        name: '测试商品',
        description: '测试描述',
        price: 99.99,
        stock: 100,
        categoryId,
      };

      mockPrismaService.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId,
      });

      mockPrismaService.product.create.mockResolvedValue({
        id: 1,
        ...productData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(
        userId,
        productData.name,
        productData.description,
        productData.price,
        productData.stock,
        productData.categoryId,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.product.create).toHaveBeenCalled();
    });

    it('如果分类不属于用户，应该抛出异常', async () => {
      const userId = 1;
      const categoryId = 1;

      mockPrismaService.category.findUnique.mockResolvedValue({
        id: categoryId,
        userId: 2, // 不同的用户
      });

      await expect(
        service.create(userId, '测试商品', '描述', 99.99, 100, categoryId),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('应该返回用户的所有商品', async () => {
      const userId = 1;
      const mockProducts = [
        { id: 1, name: '商品1', userId },
        { id: 2, name: '商品2', userId },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findAll(userId);

      expect(result).toEqual(mockProducts);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('应该返回商品详情', async () => {
      const productId = 1;
      const mockProduct = {
        id: productId,
        name: '测试商品',
        userId: 1,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(productId);

      expect(result).toEqual(mockProduct);
    });

    it('如果商品不存在，应该抛出异常', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('应该成功更新商品', async () => {
      const productId = 1;
      const userId = 1;
      const mockProduct = {
        id: productId,
        name: '原商品名',
        userId,
        price: 100,
        stock: 50,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        name: '新商品名',
      });

      const result = await service.update(productId, userId, '新商品名');

      expect(result.name).toBe('新商品名');
    });

    it('如果商品不属于用户，应该抛出异常', async () => {
      const productId = 1;
      const userId = 1;
      const mockProduct = {
        id: productId,
        userId: 2, // 不同的用户
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(
        service.update(productId, userId, '新名称'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('应该成功删除商品', async () => {
      const productId = 1;
      const userId = 1;
      const mockProduct = {
        id: productId,
        userId,
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      await service.remove(productId, userId);

      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('如果商品不属于用户，应该抛出异常', async () => {
      const productId = 1;
      const userId = 1;
      const mockProduct = {
        id: productId,
        userId: 2, // 不同的用户
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.remove(productId, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

