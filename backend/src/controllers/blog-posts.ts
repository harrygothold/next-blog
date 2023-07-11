import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import sharp from 'sharp';
import BlogPostModel from '../models/blog-post';
import assertIsDefined from '../utils/assertIsDefined';
import env from '../env';
import createHttpError from 'http-errors';
import { BlogPostBody, GetBlogPostsQuery } from '../validation/blog-posts';
import {
  RequestHandlerWithBody,
  RequestHandlerWithQuery,
} from '../utils/types';

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
