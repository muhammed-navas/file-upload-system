import multer from 'multer';
import { cloudinaryStorage } from './cloudinary';

export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

export const singleUpload = upload.single('file');
export const multipleUpload = upload.array('files', 10); 