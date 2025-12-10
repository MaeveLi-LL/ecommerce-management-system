# API 文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **认证方式**: JWT Bearer Token

## 认证接口

### 用户注册

**POST** `/auth/register`

**请求体**:
```json
{
  "username": "string (至少3个字符)",
  "email": "string (有效邮箱格式)",
  "password": "string (至少6个字符)"
}
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 用户登录

**POST** `/auth/login`

**请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```

**响应示例**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

## 商品接口

> 所有商品接口都需要在请求头中携带 JWT Token: `Authorization: Bearer <token>`

### 获取商品列表

**GET** `/products`

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "商品名称",
    "description": "商品描述",
    "price": 99.99,
    "stock": 100,
    "userId": 1,
    "categoryId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 获取单个商品

**GET** `/products/:id`

### 创建商品

**POST** `/products`

**请求体**:
```json
{
  "name": "string (必填)",
  "description": "string (可选)",
  "price": "number (必填)",
  "stock": "number (必填)",
  "categoryId": "number (可选)"
}
```

### 更新商品

**PATCH** `/products/:id`

**请求体**:
```json
{
  "name": "string (可选)",
  "description": "string (可选)",
  "price": "number (可选)",
  "stock": "number (可选)",
  "categoryId": "number (可选)"
}
```

### 删除商品

**DELETE** `/products/:id`

## 分类接口

> 所有分类接口都需要在请求头中携带 JWT Token: `Authorization: Bearer <token>`

### 获取分类列表

**GET** `/categories`

**响应示例**:
```json
[
  {
    "id": 1,
    "name": "分类名称",
    "parentId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "parent": null,
    "children": [],
    "_count": {
      "products": 5
    }
  }
]
```

### 获取单个分类

**GET** `/categories/:id`

### 创建分类

**POST** `/categories`

**请求体**:
```json
{
  "name": "string (必填)",
  "parentId": "number (可选，用于创建子分类)"
}
```

### 更新分类

**PATCH** `/categories/:id`

**请求体**:
```json
{
  "name": "string (可选)",
  "parentId": "number | null (可选，设置为null可移除父分类)"
}
```

### 删除分类

**DELETE** `/categories/:id`

## 错误响应

所有接口在出错时都会返回以下格式：

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "错误类型"
}
```

常见错误码：
- `400`: 请求参数错误
- `401`: 未授权（需要登录或token过期）
- `404`: 资源不存在
- `409`: 资源冲突（如用户名或分类名已存在）

