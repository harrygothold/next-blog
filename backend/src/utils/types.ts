import { RequestHandler } from 'express';

export type RequestHandlerWithBody<T> = RequestHandler<
  unknown,
  unknown,
  T,
  unknown
>;

export type RequestHandlerWithQuery<T> = RequestHandler<
  unknown,
  unknown,
  unknown,
  T
>;
