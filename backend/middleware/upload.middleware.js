// backend/middleware/upload.middleware.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store directly to Cloudinary instead of local disk
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'localgems/talents',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(file.mimetype.split('/')[1]);
  if (isValid) cb(null, true);
  else cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
};

const upload = multer({
  storage,   // ✅ Cloudinary storage instead of disk
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;