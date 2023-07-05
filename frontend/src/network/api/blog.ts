import { BlogPost } from '@/models/blog-post';
import api from '@/network/axiosInstance';

interface CreateBlogPostValues {
  slug: string;
  title: string;
  summary: string;
  body: string;
  featuredImage: File;
}

export const getBlogPosts = async () => {
  const response = await api.get<BlogPost[]>('/posts');
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
