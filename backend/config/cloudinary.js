import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'webfilm_assets',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 1500, crop: 'limit' }] // Resize posters
  }
});

const videoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'webfilm_videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'mkv', 'webm', 'mov'],
  }
});

export const upload = multer({ storage: storage });
export const uploadVideo = multer({ storage: videoStorage });
export default cloudinary;
