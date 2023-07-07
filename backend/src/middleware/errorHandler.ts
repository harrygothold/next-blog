import { ErrorRequestHandler } from 'express';
import { isHttpError } from 'http-errors';

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.error(error);
  let statusCode = 500;
  let errorMessage = 'An unknown error occured';

  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
};

export default errorHandler;
