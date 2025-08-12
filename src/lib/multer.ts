import multer from 'multer';
import { cloudinaryStorage } from './cloudinary';

// Configure Multer with Cloudinary storage
export const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10, // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, you can add restrictions here
    cb(null, true);
  },
});

// Single file upload middleware
export const singleUpload = upload.single('file');

// Multiple files upload middleware
export const multipleUpload = upload.array('files', 10); 