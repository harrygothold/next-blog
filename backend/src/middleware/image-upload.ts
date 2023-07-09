import multur from 'multer';
import { allowedMimeTypes } from '../utils/constants';

export const featuredImageUpload = multur({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Unaccepted file type'));
    }
  },
});
