const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const AppError = require('../utils/AppError');

const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const FOLDERS = ['categories', 'subcategories', 'products', 'customers', 'suppliers', 'employees', 'admins'];

// Ensure upload dirs exist
FOLDERS.forEach((f) => {
  const dir = path.join(__dirname, '../uploads', f);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Use memory storage so we can process with sharp before saving
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new AppError('Only JPG, PNG, WEBP images are allowed', 400));
  }
  // Block executables masquerading as images
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.exe', '.sh', '.bat', '.cmd', '.php', '.js'].includes(ext)) {
    return cb(new AppError('Invalid file type', 400));
  }
  cb(null, true);
};

const upload = multer({ storage, limits: { fileSize: MAX_SIZE }, fileFilter });

/**
 * Process uploaded image with sharp, convert to webp, save to disk
 * Returns middleware that processes req.file / req.files after multer
 */
const processImage = (folder, { width = 800, height = 800, quality = 80 } = {}) => {
  return async (req, res, next) => {
    try {
      const processFile = async (file) => {
        const filename = `${uuidv4()}.webp`;
        const dest = path.join(__dirname, '../uploads', folder, filename);
        await sharp(file.buffer)
          .resize(width, height, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality })
          .toFile(dest);
        return `/uploads/${folder}/${filename}`;
      };

      if (req.file) {
        req.file.imageUrl = await processFile(req.file);
      }
      if (req.files && Array.isArray(req.files)) {
        for (const f of req.files) {
          f.imageUrl = await processFile(f);
        }
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Factory: upload single image for a module
 * Usage: uploadFor('categories')
 */
const uploadFor = (folder, fieldName = 'image', options = {}) => [
  upload.single(fieldName),
  processImage(folder, options),
];

/**
 * Factory: upload multiple images
 */
const uploadMultipleFor = (folder, fieldName = 'images', maxCount = 5, options = {}) => [
  upload.array(fieldName, maxCount),
  processImage(folder, options),
];

module.exports = { upload, uploadFor, uploadMultipleFor, processImage };
