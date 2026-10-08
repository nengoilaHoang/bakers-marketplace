import type { RecipeMutationPayload } from '@/types/recipe';

export type PostAuthor = {
  id: string;
  displayName: string;
};

export type PostRecipeSummary = {
  id: string;
  title: string;
  coverImgUrl: string | null;
};

export type PostTag = {
  id: string;
  postId: string;
  name: string;
};

export type Post = {
  id: string;
  authorId: string | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: PostAuthor | null;
  recipe: PostRecipeSummary | null;
  tags: PostTag[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
};

export type PostCursor = {
  createdAt: string;
  id: string;
};

export type PostsPage = {
  posts: Post[];
  cursor: PostCursor | null;
};

export type PostSearchParams = {
  q?: string;
  tag?: string;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string | null;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
  author: PostAuthor | null;
};

export type PostCreatePayload = {
  title: string;
  content: string;
  tags: string[];
  // Có recipe thì BE tạo 2 công thức giống nhau và thêm token [[recipe:<id bản snapshot>]] vào cuối content
  recipe?: RecipeMutationPayload;
};

export type PostUpdatePayload = {
  title: string;
  content: string;
  tags: string[];
};

export type PostLikeStatus = {
  liked: boolean;
  likeCount: number;
};

export type PostSaveStatus = {
  saved: boolean;
};

export type PostReport = {
  id: string;
  postId: string;
  reporterId: string | null;
  reason: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  displayName: string;
};
