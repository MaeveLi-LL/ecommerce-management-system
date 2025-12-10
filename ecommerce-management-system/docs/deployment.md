# 部署指南

## 环境要求

### 必需软件
- **Node.js**: >= 18.x
- **npm**: >= 9.x 或 **yarn**: >= 1.22.x
- **Docker**: >= 20.x (用于运行数据库)
- **Docker Compose**: >= 2.x (用于管理容器)
- **Git**: >= 2.x (用于版本控制)

### 可选软件
- **pgAdmin**: 数据库管理工具（已包含在 Docker Compose 中）
- **Postman** 或 **Insomnia**: API 测试工具

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/MaeveLi-LL/ecommerce-management-system.git
cd ecommerce-management-system
```

### 2. 启动数据库

```bash
# 在项目根目录执行
docker-compose up -d
```

这将启动：
- PostgreSQL 数据库（端口 5432）
- pgAdmin 管理工具（端口 5050）

**验证数据库是否启动**：
```bash
docker-compose ps
```

应该看到两个容器在运行：
- `ecommerce-postgres`
- `ecommerce-pgadmin`

### 3. 配置后端

```bash
cd backend

# 安装依赖
npm install

# 创建环境变量文件
# Windows (PowerShell)
New-Item -ItemType File -Path .env

# Linux/Mac
touch .env
```

编辑 `backend/.env` 文件，添加以下内容：

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```

**注意**：生产环境请修改 `JWT_SECRET` 为强随机字符串。

### 4. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移
npx prisma migrate dev

# （可选）查看数据库
npx prisma studio
```

### 5. 启动后端服务

```bash
# 开发模式（自动热重载）
npm run start:dev

# 或生产模式
npm run build
npm run start:prod
```

后端服务将在 `http://localhost:3000` 启动。

**验证后端是否启动**：
- 访问 `http://localhost:3000/api` 查看 Swagger API 文档

### 6. 配置前端

```bash
cd ../frontend

# 安装依赖
npm install
```

### 7. 启动前端服务

```bash
# 开发模式
npm run dev
```

前端服务将在 `http://localhost:3001` 启动。

**验证前端是否启动**：
- 访问 `http://localhost:3001` 查看应用

## 完整启动流程

### 方式一：手动启动（推荐用于开发）

**终端 1 - 数据库**：
```bash
cd ecommerce-management-system
docker-compose up -d
```

**终端 2 - 后端**：
```bash
cd ecommerce-management-system/backend
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

**终端 3 - 前端**：
```bash
cd ecommerce-management-system/frontend
npm install
npm run dev
```

### 方式二：使用脚本（如果创建了启动脚本）

可以创建启动脚本来自动化这个过程。

## 访问应用

### 前端应用
- **URL**: http://localhost:3001
- **默认页面**: 登录页

### 后端 API
- **Base URL**: http://localhost:3000
- **Swagger 文档**: http://localhost:3000/api

### 数据库管理
- **pgAdmin**: http://localhost:5050
- **登录信息**:
  - 邮箱: `admin@ecommerce.com`
  - 密码: `admin123`

### 数据库连接信息（用于 pgAdmin）
- **主机**: `postgres` (在 Docker 网络内) 或 `localhost` (从宿主机)
- **端口**: `5432`
- **数据库**: `ecommerce_db`
- **用户名**: `postgres`
- **密码**: `postgres123`

## 测试应用

### 1. 注册新用户

访问 http://localhost:3001/register

填写信息：
- 用户名: `testuser` (至少3个字符)
- 邮箱: `test@example.com` (有效邮箱格式)
- 密码: `password123` (至少6个字符)

### 2. 登录

访问 http://localhost:3001/login

使用刚才注册的账号登录。

### 3. 创建分类

1. 登录后，点击左侧菜单"分类管理"
2. 点击"创建分类"按钮
3. 输入分类名称，例如：`电子产品`
4. 点击"确定"

### 4. 创建商品

1. 点击左侧菜单"商品管理"
2. 点击"创建商品"按钮
3. 填写商品信息：
   - 商品名称: `iPhone 15`
   - 描述: `最新款苹果手机`
   - 价格: `5999.99`
   - 库存: `100`
   - 分类: 选择刚才创建的分类
4. 点击"确定"

### 5. 查看商品详情

在商品列表中，点击商品名称即可查看详情。

## 常见问题

### 问题 1: 数据库连接失败

**错误信息**：
```
PrismaClientInitializationError: Can't reach database server
```

**解决方案**：
1. 检查 Docker 容器是否运行：`docker-compose ps`
2. 如果没有运行，启动容器：`docker-compose up -d`
3. 检查 `.env` 文件中的 `DATABASE_URL` 是否正确

### 问题 2: 端口被占用

**错误信息**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：
1. 查找占用端口的进程：
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```
2. 结束进程或修改端口配置

### 问题 3: Prisma 迁移失败

**错误信息**：
```
Migration failed
```

**解决方案**：
1. 检查数据库是否运行
2. 检查 `DATABASE_URL` 是否正确
3. 重置数据库（**注意：会删除所有数据**）：
   ```bash
   npx prisma migrate reset
   ```

### 问题 4: 前端无法连接后端

**错误信息**：
```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

**解决方案**：
1. 确认后端服务正在运行
2. 检查后端是否在 `http://localhost:3000`
3. 检查 `frontend/src/utils/api.ts` 中的 `baseURL` 配置

### 问题 5: JWT Token 过期

**错误信息**：
```
401 Unauthorized
```

**解决方案**：
1. 重新登录获取新的 token
2. 检查 token 是否过期（默认24小时）

## 生产环境部署

### 后端部署

1. **构建项目**：
   ```bash
   cd backend
   npm run build
   ```

2. **使用 PM2 运行**：
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name ecommerce-backend
   ```

3. **或使用 Docker**：
   ```dockerfile
   # 创建 Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   CMD ["node", "dist/main"]
   ```

### 前端部署

1. **构建项目**：
   ```bash
   cd frontend
   npm run build
   ```

2. **使用 Nginx 部署**：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       root /path/to/frontend/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

### 数据库部署

建议使用云数据库服务（如 AWS RDS、阿里云 RDS）或独立服务器。

## 环境变量配置

### 后端环境变量 (`backend/.env`)

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# JWT 密钥（生产环境必须修改）
JWT_SECRET="your-very-secure-secret-key"

# 服务端口（可选，默认3000）
PORT=3000

# 环境（development/production）
NODE_ENV=development
```

### 前端环境变量 (`frontend/.env`)

```env
# API 基础URL
VITE_API_BASE_URL=http://localhost:3000
```

## 维护和更新

### 更新依赖

```bash
# 后端
cd backend
npm update

# 前端
cd frontend
npm update
```

### 数据库迁移

```bash
cd backend
npx prisma migrate dev --name migration_name
```

### 查看日志

```bash
# Docker 容器日志
docker-compose logs -f

# PM2 日志
pm2 logs ecommerce-backend
```

## 备份和恢复

### 数据库备份

```bash
# 使用 pg_dump
docker exec ecommerce-postgres pg_dump -U postgres ecommerce_db > backup.sql
```

### 数据库恢复

```bash
# 恢复备份
docker exec -i ecommerce-postgres psql -U postgres ecommerce_db < backup.sql
```

## 性能优化建议

1. **数据库索引**：确保关键字段有索引
2. **查询优化**：使用 Prisma 的 `select` 和 `include` 优化查询
3. **缓存**：考虑添加 Redis 缓存
4. **CDN**：前端静态资源使用 CDN
5. **负载均衡**：多实例部署时使用负载均衡

## 安全建议

1. **修改默认密码**：修改数据库和 pgAdmin 的默认密码
2. **使用 HTTPS**：生产环境必须使用 HTTPS
3. **环境变量**：敏感信息使用环境变量，不要提交到 Git
4. **JWT Secret**：使用强随机字符串作为 JWT Secret
5. **CORS 配置**：生产环境限制 CORS 来源
6. **SQL 注入**：使用 Prisma ORM 防止 SQL 注入
7. **XSS 防护**：前端对用户输入进行转义

## 技术支持

如遇到问题，请：
1. 查看本文档的"常见问题"部分
2. 检查项目 GitHub Issues
3. 查看相关技术文档：
   - [NestJS 文档](https://docs.nestjs.com/)
   - [React 文档](https://react.dev/)
   - [Prisma 文档](https://www.prisma.io/docs)
   - [Ant Design 文档](https://ant.design/)

