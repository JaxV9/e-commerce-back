export interface Signup {
  name: string;
  email: string;
  password: string;
  role: "OWNER" | "USER";
}

export interface Login {
  email: string;
  password: string;
}

export interface ProductCreate {
  title: string;
  description: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
  createdAt: string; // ISO date string
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
  comments: Comment[];
}

export interface CommentCreate {
  content: string;
  productId: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
  };
}