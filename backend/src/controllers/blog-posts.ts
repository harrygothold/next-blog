import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import sharp from 'sharp';
import BlogPostModel from '../models/blog-post';
import CommentModel from '../models/comment';
import assertIsDefined from '../utils/assertIsDefined';
import env from '../env';
import createHttpError from 'http-errors';
import {
  BlogPostBody,
  DeleteBlogPostParams,
  GetBlogPostsQuery,
  UpdateBlogPostParams,
} from '../validation/blog-posts';
import {
  RequestHandlerWithBody,
  RequestHandlerWithQuery,
} from '../utils/types';
import fs from 'fs';
import axios from 'axios';
import {
  CreateCommentBody,
  CreateCommentParams,
  DeleteCommentParams,
  GetCommentRepliesParams,
  GetCommentRepliesQuery,
  GetCommentsParams,
  GetCommentsQuery,
  UpdateCommentBody,
  UpdateCommentParams,
} from '../validation/comments';

export const getBlogPosts: RequestHandlerWithQuery<GetBlogPostsQuery> = async (
  req,
  res,
  next
) => {
  const authorId = req.query.authorId;
  const page = parseInt(req.query.page || '1');
  const pageSize = 6;
  const filter = authorId ? { author: authorId } : {};
  try {
    const getBlogPostsQuery = BlogPostModel.find(filter)
      .sort({ _id: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
      .populate('author')
      .exec();

    const countDocumentsQuery = BlogPostModel.countDocuments(filter).exec();

    const [blogPosts, totalResults] = await Promise.all([
      getBlogPostsQuery,
      countDocumentsQuery,
    ]);

    const totalPages = Math.ceil(totalResults / pageSize);

    res.status(200).json({
      blogPosts,
      page,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllBlogPostSlugs: RequestHandler = async (req, res, next) => {
  try {
    const results = await BlogPostModel.find().select('slug').exec();
    const slugs = results.map((result) => result.slug);

    res.status(200).json(slugs);
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug: RequestHandler = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    const blogPost = await BlogPostModel.findOne({
      slug,
    })
      .populate('author')
      .exec();

    if (!blogPost) {
      throw createHttpError(404, `No blog post found for slug ${slug}`);
    }

    res.status(200).json(blogPost);
  } catch (error) {
    next(error);
  }
};

export const createBlogPost: RequestHandlerWithBody<BlogPostBody> = async (
  req,
  res,
  next
) => {
  const { slug, title, summary, body } = req.body;
  const featuredImage = req.file;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(featuredImage);
    assertIsDefined(authenticatedUser);

    const existingSlug = await BlogPostModel.findOne({ slug }).exec();

    if (existingSlug) {
      throw createHttpError(
        409,
        'Slug already taken. Please choose a different one'
      );
    }

    const blogPostId = new mongoose.Types.ObjectId();

    const featuredImageDestinationPath = `/uploads/featured-images/${blogPostId}.png`;

    await sharp(featuredImage.buffer)
      .resize(700, 450)
      .toFile(`./${featuredImageDestinationPath}`);

    const newPost = await BlogPostModel.create({
      _id: blogPostId,
      slug,
      title,
      summary,
      body,
      featuredImageUrl: env.SERVER_URL + featuredImageDestinationPath,
      author: authenticatedUser._id,
    });

    res.status(201).json(newPost);
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost: RequestHandler<
  UpdateBlogPostParams,
  unknown,
  BlogPostBody,
  unknown
> = async (req, res, next) => {
  const { blogPostId } = req.params;
  const { slug, title, summary, body } = req.body;
  const featuredImage = req.file;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    const existingSlug = await BlogPostModel.findOne({ slug }).exec();

    if (existingSlug && !existingSlug._id.equals(blogPostId)) {
      throw createHttpError(
        409,
        'Slug already taken. Please choose a different one'
      );
    }

    const postToEdit = await BlogPostModel.findById(blogPostId).exec();

    if (!postToEdit) {
      throw createHttpError(404, 'No blog post found for that ID');
    }

    if (!postToEdit.author.equals(authenticatedUser._id)) {
      throw createHttpError(401);
    }

    postToEdit.slug = slug;
    postToEdit.title = title;
    postToEdit.summary = summary;
    postToEdit.body = body;

    if (featuredImage) {
      const featuredImageDestinationPath = `/uploads/featured-images/${blogPostId}.png`;

      await sharp(featuredImage.buffer)
        .resize(700, 450)
        .toFile(`./${featuredImageDestinationPath}`);

      postToEdit.featuredImageUrl = `${
        env.SERVER_URL
      }${featuredImageDestinationPath}?lastupdated=${Date.now()}`;
    }

    await postToEdit.save();

    await axios.get(
      `${env.WEBSITE_URL}/api/revalidate-post/${slug}?secret=${env.POST_REVALIDATION_KEY}`
    );

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost: RequestHandler<
  DeleteBlogPostParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { blogPostId } = req.params;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    const postToDelete = await BlogPostModel.findById(blogPostId).exec();

    if (!postToDelete) {
      throw createHttpError(404, 'No blog post found for that ID');
    }

    if (!postToDelete.author.equals(authenticatedUser._id)) {
      throw createHttpError(401);
    }

    if (postToDelete.featuredImageUrl.startsWith(env.SERVER_URL)) {
      const imagePath = postToDelete.featuredImageUrl
        .split(env.SERVER_URL)[1]
        .split('?')[0];
      fs.unlinkSync('.' + imagePath);
    }

    await postToDelete.deleteOne();

    await axios.get(
      `${env.WEBSITE_URL}/api/revalidate-post/${postToDelete.slug}?secret=${env.POST_REVALIDATION_KEY}`
    );

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

export const getCommentsForBlogPost: RequestHandler<
  GetCommentsParams,
  unknown,
  unknown,
  GetCommentsQuery
> = async (req, res, next) => {
  const { blogPostId } = req.params;
  const { continueAfterId } = req.query;

  const pageSize = 3;

  try {
    const query = CommentModel.find({
      blogPostId,
      parentCommentId: undefined,
    }).sort({ _id: -1 });

    if (continueAfterId) {
      query.lt('_id', continueAfterId);
    }

    const result = await query
      .limit(pageSize + 1)
      .populate('author')
      .exec();

    const comments = result.slice(0, pageSize);
    const endOfPaginationReached = result.length <= pageSize;

    const commentsWithRepliesCount = await Promise.all(
      comments.map(async (comment) => {
        const repliesCount = await CommentModel.countDocuments({
          parentCommentId: comment._id,
        });
        return { ...comment.toObject(), repliesCount };
      })
    );

    res.status(200).json({
      comments: commentsWithRepliesCount,
      endOfPaginationReached,
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentReplies: RequestHandler<
  GetCommentRepliesParams,
  unknown,
  unknown,
  GetCommentRepliesQuery
> = async (req, res, next) => {
  const { commentId: parentCommentId } = req.params;
  const { continueAfterId } = req.query;

  const pageSize = 2;

  try {
    const query = CommentModel.find({ parentCommentId });

    if (continueAfterId) {
      query.gt('_id', continueAfterId);
    }

    const result = await query
      .limit(pageSize + 1)
      .populate('author')
      .exec();

    const comments = result.slice(0, pageSize);
    const endOfPaginationReached = result.length <= pageSize;

    res.status(200).json({
      comments,
      endOfPaginationReached,
    });
  } catch (error) {
    next(error);
  }
};

export const createComment: RequestHandler<
  CreateCommentParams,
  unknown,
  CreateCommentBody,
  unknown
> = async (req, res, next) => {
  const { blogPostId } = req.params;
  const { text, parentCommentId } = req.body;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    const newComment = await CommentModel.create({
      blogPostId,
      text,
      author: authenticatedUser,
      parentCommentId,
    });

    await CommentModel.populate(newComment, { path: 'author' });

    res.status(201).json(newComment);
  } catch (error) {
    next(error);
  }
};

export const updateComment: RequestHandler<
  UpdateCommentParams,
  unknown,
  UpdateCommentBody,
  unknown
> = async (req, res, next) => {
  const { commentId } = req.params;
  const { newText } = req.body;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    const commentToUpdate = await CommentModel.findById(commentId)
      .populate('author')
      .exec();

    if (!commentToUpdate) {
      throw createHttpError(404);
    }

    if (!commentToUpdate.author.equals(authenticatedUser._id)) {
      throw createHttpError(401);
    }

    commentToUpdate.text = newText;
    await commentToUpdate.save();

    res.status(200).json(commentToUpdate);
  } catch (error) {
    next(error);
  }
};

export const deleteComment: RequestHandler<
  DeleteCommentParams,
  unknown,
  unknown,
  unknown
> = async (req, res, next) => {
  const { commentId } = req.params;
  const authenticatedUser = req.user;
  try {
    assertIsDefined(authenticatedUser);

    const commentToDelete = await CommentModel.findById(commentId).exec();

    if (!commentToDelete) {
      throw createHttpError(404);
    }

    if (!commentToDelete.author.equals(authenticatedUser._id)) {
      throw createHttpError(401);
    }

    await commentToDelete.deleteOne();
    await CommentModel.deleteMany({ parentCommentId: commentId }).exec();

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
