/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- Step 1: 删除旧的唯一索引
DROP INDEX IF EXISTS "categories_name_key";

-- Step 2: 添加 userId 列，先允许为 NULL
ALTER TABLE "categories" ADD COLUMN "userId" INTEGER;

-- Step 3: 将现有分类分配给第一个用户（如果存在用户），否则删除旧分类
-- 如果有用户，将分类分配给第一个用户
UPDATE "categories" 
SET "userId" = (SELECT id FROM users ORDER BY id LIMIT 1) 
WHERE "userId" IS NULL 
AND EXISTS (SELECT 1 FROM users LIMIT 1);

-- 如果没有用户，删除所有分类
DELETE FROM "categories" WHERE "userId" IS NULL;

-- Step 4: 设置 userId 为必需
ALTER TABLE "categories" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: 创建新的复合唯一索引
CREATE UNIQUE INDEX "categories_name_userId_key" ON "categories"("name", "userId");

-- Step 6: 添加外键约束
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
