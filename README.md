# 电商商品管理系统

## 项目概述

本项目是一个基于现代化技术栈开发的电商商品管理系统，实现了用户认证、商品管理和分类管理等核心功能。项目采用前后端分离架构，使用 TypeScript 进行全栈开发。

## 技术栈

### 后端技术
- **框架**: NestJS
- **语言**: TypeScript
- **ORM**: Prisma
- **数据库**: PostgreSQL
- **认证**: JWT (JSON Web Token)
- **容器化**: Docker & Docker Compose

### 前端技术
- **框架**: React 18
- **语言**: TypeScript
- **UI组件库**: Ant Design
- **路由**: React Router v6
- **HTTP客户端**: Axios
- **构建工具**: Vite

### 开发工具
- **版本控制**: Git & GitHub
- **代码规范**: ESLint + Prettier
- **提交规范**: Conventional Commits

## 项目结构

```
ecommerce-management-system/
├── backend/              # NestJS 后端项目
│   ├── src/             # 源代码目录
│   ├── prisma/          # Prisma 配置和迁移文件
│   └── package.json     # 后端依赖配置
├── frontend/            # React 前端项目
│   ├── src/             # 源代码目录
│   └── package.json     # 前端依赖配置
├── docs/                # 项目文档
├── docker-compose.yml   # Docker 容器编排配置
└── README.md           # 项目说明文档
```

## 功能特性

### 后端功能
- ✅ 用户注册与登录（JWT 认证）
- ✅ 商品管理（完整的 CRUD 操作）
- ✅ 商品分类管理（支持层级结构）
- ✅ RESTful API 接口设计
- ✅ 数据验证与错误处理
- ✅ 密码加密存储（bcrypt）
- ✅ 跨域资源共享（CORS）配置

### 前端功能
- ✅ 用户注册与登录页面
- ✅ 商品管理页面（列表、创建、编辑、删除）
- ✅ 商品分类管理页面
- ✅ 路由守卫与权限控制
- ✅ 响应式布局设计
- ✅ 统一的错误处理机制
- ✅ Token 自动刷新与过期处理

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker Desktop（用于运行 PostgreSQL 数据库）
- PostgreSQL 13+（或使用 Docker 容器）

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/ecommerce-management-system.git
cd ecommerce-management-system
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-secret-key-change-in-production"
```

### 4. 启动数据库服务

在项目根目录执行：

```bash
docker-compose up -d
```

这将启动 PostgreSQL 数据库和 pgAdmin 管理工具：
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@ecommerce.com / admin123)

### 5. 初始化数据库

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

### 6. 启动开发服务器

```bash
# 启动后端服务（终端1）
cd backend
npm run start:dev
# 后端服务运行在 http://localhost:3000

# 启动前端服务（终端2）
cd frontend
npm run dev
# 前端服务运行在 http://localhost:3001
```

### 7. 访问应用

打开浏览器访问 `http://localhost:3001`，使用注册功能创建账户后即可登录使用。

## 开发规范

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 代码风格规范
- 组件和函数添加必要的注释说明

### Git 提交规范
- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 提交信息格式：`<type>(<scope>): <subject>`
- 类型包括：feat, fix, docs, style, refactor, test, chore

### 分支管理
- `main`: 主分支，用于生产环境
- `develop`: 开发分支
- `feature/*`: 功能开发分支

## 技术难点与解决方案

### 1. Prisma ORM 使用
- **难点**: 初次使用 Prisma，对模型关系和迁移机制不熟悉
- **解决**: 查阅官方文档，通过实践逐步掌握模型定义、关系映射和数据库迁移

### 2. JWT 认证实现
- **难点**: JWT token 的生成、验证和刷新机制
- **解决**: 参考 NestJS 官方示例，使用 Passport 策略实现 JWT 认证

### 3. 前端路由嵌套
- **难点**: React Router v6 的嵌套路由和路由守卫
- **解决**: 学习新版 API，使用 `Outlet` 组件实现嵌套布局，自定义 `ProtectedRoute` 组件实现路由守卫

## 后续规划

### 功能扩展
- [ ] 商品图片上传功能
- [ ] 数据统计与分析页面
- [ ] 批量操作功能
- [ ] 商品搜索与筛选
- [ ] 导出数据功能

### 技术优化
- [ ] 添加单元测试和集成测试
- [ ] 性能优化（懒加载、代码分割）
- [ ] API 文档自动生成（Swagger）
- [ ] 日志系统完善
- [ ] 错误监控与上报

### 部署优化
- [ ] CI/CD 流水线配置
- [ ] 生产环境配置优化
- [ ] 数据库备份策略
- [ ] 容器化部署方案

## API 文档

详细的 API 文档请参考 [API 文档](./ecommerce-management-system/docs/api.md)

## 数据库设计

数据库设计文档请参考 [数据库设计](./ecommerce-management-system/docs/database.md)

## 许可证

本项目采用 [MIT License](LICENSE) 许可证。
