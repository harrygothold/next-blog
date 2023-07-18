import express from 'express';
import * as BlogPostsController from '../controllers/blog-posts';
import { featuredImageUpload } from '../middleware/image-upload';
import {
  createPostRateLimit,
  updatePostRateLimit,
} from '../middleware/rate-limit';
import requiresAuth from '../middleware/requiresAuth';
import validateRequestSchema from '../middleware/validateRequestSchema';
import {
  createBlogPostSchema,
  deleteBlogPostSchema,
  getBlogPostsSchema,
  updateBlogPostSchema,
} from '../validation/blog-posts';
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentRepliesSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '../validation/comments';

const router = express.Router();

router.get(
  '/',
  validateRequestSchema(getBlogPostsSchema),
  BlogPostsController.getBlogPosts
);

router.get('/slugs', BlogPostsController.getAllBlogPostSlugs);

router.get('/post/:slug', BlogPostsController.getBlogPostBySlug);

router.post(
  '/',
  requiresAuth,
  createPostRateLimit,
  featuredImageUpload.single('featuredImage'),
  validateRequestSchema(createBlogPostSchema),
  BlogPostsController.createBlogPost
);

router.patch(
  '/:blogPostId',
  requiresAuth,
  updatePostRateLimit,
  featuredImageUpload.single('featuredImage'),
  validateRequestSchema(updateBlogPostSchema),
  BlogPostsController.updateBlogPost
);

router.delete(
  '/:blogPostId',
  requiresAuth,
  validateRequestSchema(deleteBlogPostSchema),
  BlogPostsController.deleteBlogPost
);

// COMMENT ROUTES
router.get(
  '/:blogPostId/comments',
  validateRequestSchema(getCommentsSchema),
  BlogPostsController.getCommentsForBlogPost
);

router.post(
  '/:blogPostId/comments',
  requiresAuth,
  validateRequestSchema(createCommentSchema),
  BlogPostsController.createComment
);

router.get(
  '/comments/:commentId/replies',
  validateRequestSchema(getCommentRepliesSchema),
  BlogPostsController.getCommentReplies
);

router.patch(
  '/comments/:commentId',
  requiresAuth,
  validateRequestSchema(updateCommentSchema),
  BlogPostsController.updateComment
);

router.delete(
  '/comments/:commentId',
  requiresAuth,
  validateRequestSchema(deleteCommentSchema),
  BlogPostsController.deleteComment
);

export default router;
