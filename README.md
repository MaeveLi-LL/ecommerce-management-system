# 电商商品管理系统

## 项目概述

本项目是一个简化版的电商商品管理系统，使用现代化的技术栈开发。

## 技术栈

- **后端**: NestJS + TypeScript + Prisma + PostgreSQL + JWT
- **前端**: React + TypeScript + Ant Design + React Router
- **数据库**: PostgreSQL
- **ORM**: Prisma
- **版本控制**: Git + GitHub

## 项目结构

```
ecommerce-management-system/
├── backend/          # NestJS后端项目
├── frontend/         # React前端项目
├── docs/            # 项目文档
├── docker-compose.yml # Docker配置
└── README.md        # 项目说明
```

## 功能特性

### 后端功能
- ✅ 用户注册与登录（JWT认证）
- ✅ 商品管理（CRUD操作）
- ✅ 商品分类管理（CRUD操作）
- ✅ RESTful API接口
- ✅ Prisma ORM集成
- ✅ PostgreSQL数据库

### 前端功能
- ✅ 用户注册与登录页面
- ✅ 商品管理页面（列表、详情、创建/编辑）
- ✅ 商品分类管理页面
- ✅ React Router导航
- ✅ Ant Design UI组件
- ✅ API请求封装（Axios）

## 快速开始

### 环境要求
- Node.js 18+
- PostgreSQL 13+
- npm 或 yarn

### 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 数据库配置

1. 创建PostgreSQL数据库
2. 配置环境变量（参考 `.env.example`）

### 运行项目

```bash
# 启动后端
cd backend
npm run start:dev

# 启动前端
cd ../frontend
npm start
```

## 开发规范

- 遵循 Git Conventional Commits 规范
- 使用 TypeScript 开发
- 代码风格统一（ESLint + Prettier）

## 文档

- [API文档](./docs/api.md)
- [数据库设计](./docs/database.md)
- [部署指南](./docs/deployment.md)

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。
