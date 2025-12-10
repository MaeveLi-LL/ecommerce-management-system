# 电商商品管理系统

一个基于 NestJS 和 React 的全栈电商商品管理系统，用于管理商品和分类。

## 技术栈

### 后端
- **NestJS** - Node.js 企业级框架
- **TypeScript** - 类型安全的 JavaScript
- **Prisma** - 现代化 ORM
- **PostgreSQL** - 关系型数据库
- **JWT** - 身份认证
- **Swagger** - API 文档自动生成

### 前端
- **React** - UI 框架
- **TypeScript** - 类型安全
- **Ant Design** - UI 组件库
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Axios** - HTTP 客户端

## 功能特性

- ✅ 用户注册和登录（JWT 认证）
- ✅ 商品管理（CRUD 操作）
- ✅ 商品分类管理（支持层级结构）
- ✅ 用户数据隔离（每个用户只能看到自己的数据）
- ✅ 响应式设计
- ✅ API 文档自动生成（Swagger）
- ✅ 完整的错误处理

## 快速开始

### 前置要求

- Node.js >= 18.x
- Docker & Docker Compose
- npm 或 yarn

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/MaeveLi-LL/ecommerce-management-system.git
   cd ecommerce-management-system
   ```

2. **启动数据库**
   ```bash
   docker-compose up -d
   ```

3. **配置后端**
   ```bash
   cd backend
   npm install
   
   # 创建 .env 文件
   echo 'DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/ecommerce_db?schema=public"' > .env
   
   # 初始化数据库
   npx prisma generate
   npx prisma migrate dev
   
   # 启动后端
   npm run start:dev
   ```

4. **配置前端**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

5. **访问应用**
   - 前端: http://localhost:3001
   - 后端 API 文档: http://localhost:3000/api

详细部署说明请查看 [部署指南](./docs/deployment.md)

## 项目结构

```
ecommerce-management-system/
├── backend/          # 后端项目
├── frontend/         # 前端项目
├── docs/            # 项目文档
│   ├── architecture.md    # 架构说明
│   ├── api.md            # API 文档
│   ├── database.md       # 数据库设计
│   └── deployment.md     # 部署指南
└── docker-compose.yml    # Docker 配置
```

## 文档

- [项目架构说明](./docs/architecture.md)
- [API 文档](./docs/api.md) 或访问 http://localhost:3000/api
- [数据库设计文档](./docs/database.md)
- [部署指南](./docs/deployment.md)

## 开发

### 后端开发

```bash
cd backend
npm run start:dev    # 开发模式（热重载）
npm run build        # 构建
npm run test         # 运行测试
```

### 前端开发

```bash
cd frontend
npm run dev          # 开发模式
npm run build        # 构建
npm run preview      # 预览构建结果
```

## 测试

### 运行单元测试

```bash
# 后端测试
cd backend
npm run test

# 查看测试覆盖率
npm run test:cov
```

## 功能演示

### 用户注册与登录
1. 访问 http://localhost:3001/register 注册新用户
2. 访问 http://localhost:3001/login 登录

### 商品管理
1. 登录后进入"商品管理"页面
2. 点击"创建商品"添加新商品
3. 点击商品名称查看详情
4. 点击"编辑"修改商品信息
5. 点击"删除"删除商品

### 分类管理
1. 进入"分类管理"页面
2. 创建分类（支持设置父分类实现层级结构）
3. 编辑或删除分类

## 技术要点

### 后端
- ✅ JWT 认证实现
- ✅ Prisma 配置与模型定义
- ✅ RESTful API 接口完整
- ✅ 错误处理机制
- ✅ DTO 数据验证
- ✅ Swagger API 文档

### 前端
- ✅ 登录/注册页面
- ✅ 商品管理页面
- ✅ 分类管理页面
- ✅ React Router 导航
- ✅ API 请求封装（Axios）
- ✅ 错误处理和用户反馈

### 数据库
- ✅ 用户表（含密码哈希）
- ✅ 商品表（含外键关联）
- ✅ 商品分类表（支持层级结构）
- ✅ 数据隔离（用户级别）

### 开发规范
- ✅ TypeScript 使用
- ✅ Git 每日提交
- ✅ Conventional Commits 规范
- ✅ 代码风格统一
- ✅ 注释充分

## 许可证

本项目仅用于学习和评估目的。

## 作者

实习生项目 - Node.js 全栈学习评估

## 更新日志

查看 [GitHub Commits](https://github.com/MaeveLi-LL/ecommerce-management-system/commits/main) 了解详细更新历史。

