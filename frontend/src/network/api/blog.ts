import { BlogPost, BlogPostsPage } from '@/models/blog-post';
import { Comment, CommentsPage } from '@/models/comment';
import api from '@/network/axiosInstance';

interface CreateBlogPostValues {
  slug: string;
  title: string;
  summary: string;
  body: string;
  featuredImage: File;
}

export const getBlogPosts = async (page: number = 1) => {
  const response = await api.get<BlogPostsPage>(`/posts?page=${page}`);
  return response.data;
};

export const getBlogPostsByUser = async (userId: string, page: number = 1) => {
  const response = await api.get<BlogPostsPage>(
    `/posts?authorId=${userId}&page=${page}`
  );
  return response.data;
};

export const getAllBlogPostSlugs = async () => {
  const response = await api.get<string[]>('/posts/slugs');
  return response.data;
};

export const getBlogPostBySlug = async (slug: string) => {
  const response = await api.get<BlogPost>(`/posts/post/${slug}`);
  return response.data;
};

export const createBlogPost = async (input: CreateBlogPostValues) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await api.post<BlogPost>('/posts', formData);
  return response.data;
};

interface UpdateBlogPostValues {
  slug: string;
  title: string;
  summary: string;
  body: string;
  featuredImage?: File;
}

export const updateBlogPost = async (
  blogPostId: string,
  input: UpdateBlogPostValues
) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, value);
    }
  });

  await api.patch(`/posts/${blogPostId}`, formData);
};

export const deleteBlogPost = async (blogPostId: string) => {
  await api.delete(`/posts/${blogPostId}`);
};

export const getCommentsForBlogPost = async (
  blogPostId: string,
  continueAfterId?: string
) => {
  const response = await api.get<CommentsPage>(
    `/posts/${blogPostId}/comments?${
      continueAfterId ? `continueAfterId=${continueAfterId}` : ''
    }`
  );
  return response.data;
};

export const createComment = async (
  blogPostId: string,
  parentCommentId: string | undefined,
  text: string
) => {
  const response = await api.post<Comment>(`/posts/${blogPostId}/comments`, {
    text,
    parentCommentId,
  });
  return response.data;
};
