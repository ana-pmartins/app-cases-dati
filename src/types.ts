export type UserRole = "admin" | "viewer";

export interface AuthorizedUser {
  email: string;
  role: UserRole;
  name: string;
}

export interface SuccessCase {
  id: string;
  title: string;
  blogUrl: string;
  pdfUrl?: string;
  pngUrl?: string;
  tags: string[];
  content?: string;
  createdAt: number;
  updatedAt: number;
  authorId: string;
}

export interface TagCategory {
  name: string;
  tags: string[];
}
