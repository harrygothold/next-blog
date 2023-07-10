import mongoose from 'mongoose';
import { validateBufferMIMEType } from 'validate-image-type';
import * as yup from 'yup';
import { allowedMimeTypes } from './constants';

export const imageFileSchema = yup
  .mixed<Express.Multer.File>()
  .test(
    'valid-image',
    'The uploaded file is not a valid image',
    async (file) => {
      if (!file) return true;
      const result = await validateBufferMIMEType(file?.buffer, {
        allowMimeTypes: allowedMimeTypes,
      });
      return result.ok;
    }
  );

export const objectIdSchema = yup
  .string()
  .test(
    'is-objectid',
    '${path} is not a valid ObjectId',
    (value) => !value || mongoose.Types.ObjectId.isValid(value)
  );
