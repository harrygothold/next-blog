import multur from 'multer';

export const featuredImageUpload = multur({
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const acceptedImageTypes: string[] = ['image/png', 'image/jpeg'];
    if (acceptedImageTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Unaccepted file type'));
    }
  },
});
