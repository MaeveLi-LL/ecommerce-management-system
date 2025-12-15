 项目架构说明

技术栈

 后端
- 框架: NestJS 10.x
- 语言: TypeScript
- ORM: Prisma 5.x
- 数据库: PostgreSQL 15
- 认证: JWT (JSON Web Tokens)
- API文档: Swagger/OpenAPI
- 验证: class-validator, class-transformer

 前端
- 框架: React 18.x
- 语言: TypeScript
- 构建工具: Vite 5.x
- UI组件库: Ant Design 5.x
- 路由: React Router 6.x
- HTTP客户端: Axios
- 状态管理: React Context API

 开发工具
- 版本控制: Git
- 容器化: Docker & Docker Compose
- 数据库管理: pgAdmin 4

 项目结构

ecommerce-management-system/
├── backend/                 # 后端项目
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/        # 数据传输对象
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── users/          # 用户模块
│   │   ├── products/       # 商品模块
│   │   ├── categories/     # 分类模块
│   │   ├── prisma/         # Prisma服务
│   │   ├── app.module.ts   # 根模块
│   │   └── main.ts         # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库模型定义
│   │   └── migrations/     # 数据库迁移文件
│   └── package.json
│
├── frontend/               # 前端项目
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Products.tsx
│   │   │   └── Categories.tsx
│   │   ├── components/     # 通用组件
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/       # Context API
│   │   │   └── AuthContext.tsx
│   │   ├── utils/          # 工具函数
│   │   │   └── api.ts      # Axios配置
│   │   ├── types/          # TypeScript类型定义
│   │   └── App.tsx         # 根组件
│   └── package.json
│
├── docker-compose.yml      # Docker Compose配置
├── docs/                   # 文档目录
│   ├── architecture.md     # 架构说明（本文件）
│   ├── api.md             # API文档
│   └── database.md        # 数据库设计文档
└── README.md              # 项目说明



架构设计

后端架构

 模块化设计
采用 NestJS 的模块化架构，每个功能模块独立：

1. AuthModule - 认证模块
   - 处理用户注册和登录
   - JWT token 生成和验证
   - 使用 Passport.js 实现认证策略

2. UsersModule - 用户模块
   - 用户数据管理
   - 密码加密（bcrypt）
   - 用户验证逻辑

3. ProductsModule - 商品模块
   - 商品的 CRUD 操作
   - 用户权限验证
   - 分类关联管理

4. CategoriesModule - 分类模块
   - 分类的 CRUD 操作
   - 层级结构支持
   - 用户权限验证

5. PrismaModule - 数据库模块
   - Prisma Client 封装
   - 数据库连接管理

 认证流程

用户登录/注册
    ↓
验证用户名和密码
    ↓
生成 JWT Token
    ↓
返回 Token 给前端
    ↓
前端存储 Token (sessionStorage)
    ↓
后续请求携带 Token
    ↓
后端验证 Token
    ↓
允许/拒绝访问

API 设计原则

- RESTful 风格
- 统一的错误处理
- DTO 数据验证
- JWT 认证保护
- Swagger 自动文档生成

 前端架构

 组件结构

1. 页面组件 (Pages)
   - Login - 登录页
   - Register - 注册页
   - Dashboard - 主布局
   - Products - 商品管理
   - Categories - 分类管理

2. 通用组件 (Components)
   - ProtectedRoute - 路由保护组件

3. 状态管理 (Contexts)
   - AuthContext - 全局认证状态

4. 工具函数 (Utils)
   - api.ts - Axios 实例和拦截器

 路由设计

/ (需要登录)
├── /products - 商品管理
└── /categories - 分类管理

/login - 登录页
/register - 注册页


数据流

用户操作
    ↓
组件事件处理
    ↓
调用 API (Axios)
    ↓
请求拦截器添加 Token
    ↓
后端处理
    ↓
响应拦截器处理错误
    ↓
更新组件状态
    ↓
UI 更新


数据库设计

 关系模型

- User (用户)
  - 一对多 → Product (商品)
  - 一对多 → Category (分类)

- Product (商品)
  - 多对一 → User (用户)
  - 多对一 → Category (分类，可选)

- Category (分类)
  - 多对一 → User (用户)
  - 多对一 → Category (父分类，可选，自引用)
  - 一对多 → Product (商品)

 数据隔离

每个用户的数据完全隔离：
- 用户只能看到和操作自己的商品
- 用户只能看到和操作自己的分类
- 通过 `userId` 字段实现数据隔离

 安全设计

 认证安全
- 密码使用 bcrypt 加密存储
- JWT token 有过期时间（24小时）
- Token 存储在 sessionStorage（新标签页需要重新登录）

 权限控制
- 所有商品和分类操作都需要 JWT 认证
- 用户只能操作自己的数据
- 后端验证用户权限

 数据验证
- 使用 class-validator 进行 DTO 验证
- 前端表单验证
- SQL 注入防护（Prisma ORM）

 部署架构
 开发环境

┌─────────────────┐
│   Frontend      │
│   (Vite Dev)    │
│   Port: 3001    │
└────────┬────────┘
         │ HTTP
         │
┌────────▼────────┐
│   Backend       │
│   (NestJS)      │
│   Port: 3000    │
└────────┬────────┘
         │ Prisma
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Docker)      │
│   Port: 5432    │
└─────────────────┘


生产环境建议

- 前端：构建静态文件，使用 Nginx 部署
- 后端：使用 PM2 或 Docker 容器运行
- 数据库：使用云数据库服务或独立服务器
- 反向代理：使用 Nginx 作为反向代理

 开发规范

### 代码规范
- 使用 TypeScript 严格模式
- ESLint + Prettier 代码格式化
- 遵循 NestJS 和 React 最佳实践

 Git 规范
- 遵循 Conventional Commits 规范
- 每日提交代码
- 有意义的提交信息

注释规范
- 关键函数和类添加注释
- API 接口使用 Swagger 装饰器
- 复杂逻辑添加说明注释

 扩展性考虑

 后端扩展
- 模块化设计便于添加新功能
- 可以轻松添加新的业务模块
- 支持微服务拆分

 前端扩展
- 组件化设计便于复用
- 可以添加新的页面和功能
- 支持状态管理库（Redux）集成

 数据库扩展
- Prisma 支持数据库迁移
- 可以轻松添加新表和字段
- 支持数据库版本管理

