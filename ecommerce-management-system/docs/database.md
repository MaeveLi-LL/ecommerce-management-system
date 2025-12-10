# 数据库设计文档

## 数据库概述

本项目使用 PostgreSQL 数据库，通过 Prisma ORM 进行数据管理。

## 数据库表结构

### 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Int | PRIMARY KEY, AUTO_INCREMENT | 用户ID |
| username | String | UNIQUE, NOT NULL | 用户名 |
| email | String | UNIQUE, NOT NULL | 邮箱 |
| password | String | NOT NULL | 密码（bcrypt加密） |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | NOT NULL, AUTO UPDATE | 更新时间 |

**关系**:
- 一个用户可以有多个商品 (One-to-Many: Product)
- 一个用户可以有多个分类 (One-to-Many: Category)

### 商品表 (products)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Int | PRIMARY KEY, AUTO_INCREMENT | 商品ID |
| name | String | NOT NULL | 商品名称 |
| description | String | NULL | 商品描述 |
| price | Float | NOT NULL | 商品价格 |
| stock | Int | NOT NULL, DEFAULT 0 | 库存数量 |
| userId | Int | FOREIGN KEY, NOT NULL | 所属用户ID |
| categoryId | Int | FOREIGN KEY, NULL | 所属分类ID |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | NOT NULL, AUTO UPDATE | 更新时间 |

**关系**:
- 属于一个用户 (Many-to-One: User)
- 属于一个分类，可选 (Many-to-One: Category, nullable)

**外键约束**:
- `userId` → `users.id` (ON DELETE CASCADE)
- `categoryId` → `categories.id` (ON DELETE SET NULL)

### 分类表 (categories)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | Int | PRIMARY KEY, AUTO_INCREMENT | 分类ID |
| name | String | NOT NULL | 分类名称 |
| userId | Int | FOREIGN KEY, NOT NULL | 所属用户ID |
| parentId | Int | FOREIGN KEY, NULL | 父分类ID（用于层级结构） |
| createdAt | DateTime | NOT NULL, DEFAULT NOW() | 创建时间 |
| updatedAt | DateTime | NOT NULL, AUTO UPDATE | 更新时间 |

**关系**:
- 属于一个用户 (Many-to-One: User)
- 可以有多个子分类 (One-to-Many: self-referencing)
- 可以有一个父分类 (Many-to-One: self-referencing, nullable)
- 可以有多个商品 (One-to-Many: Product)

**外键约束**:
- `userId` → `users.id` (ON DELETE CASCADE)
- `parentId` → `categories.id` (自引用)

**唯一约束**:
- `(name, userId)` - 同一用户下分类名称唯一

## ER 图

```
┌─────────────┐
│    User     │
│─────────────│
│ id (PK)     │
│ username    │◄──────────┐
│ email       │           │
│ password    │           │
│ createdAt   │           │
│ updatedAt   │           │
└─────────────┘           │
      │                   │
      │ 1                 │ N
      │                   │
      │                   │
┌─────▼───────────────────┴──┐
│         Product             │
│─────────────────────────────│
│ id (PK)                     │
│ name                        │
│ description                 │
│ price                       │
│ stock                       │
│ userId (FK) ────────────────┘
│ categoryId (FK) ────┐
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
      │
      │ N
      │
      │ 1
┌─────▼──────────────┐
│     Category       │
│────────────────────│
│ id (PK)            │
│ name               │
│ parentId (FK) ─────┼──┐ (自引用)
│ createdAt          │  │
│ updatedAt          │  │
└────────────────────┘  │
      │                 │
      │ 1               │ N
      │                 │
      └─────────────────┘
```

## 数据库索引

- `users.username`: UNIQUE INDEX
- `users.email`: UNIQUE INDEX
- `categories.name, categories.userId`: UNIQUE INDEX (复合唯一索引)
- `products.userId`: INDEX (用于快速查询用户的商品)
- `products.categoryId`: INDEX (用于快速查询分类下的商品)
- `categories.userId`: INDEX (用于快速查询用户的分类)
- `categories.parentId`: INDEX (用于快速查询子分类)

## 数据迁移

使用 Prisma Migrate 管理数据库迁移：

```bash
# 创建迁移
npx prisma migrate dev --name migration_name

# 应用迁移
npx prisma migrate deploy

# 查看迁移历史
npx prisma migrate status
```

## 数据库连接

连接字符串格式：
```
postgresql://用户名:密码@主机:端口/数据库名?schema=public
```

示例：
```
postgresql://postgres:postgres123@localhost:5432/ecommerce_db?schema=public
```

