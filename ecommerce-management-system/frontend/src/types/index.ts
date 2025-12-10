export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  userId: number;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  category?: Category | null;
}
