import multer from 'multer';

// Use memory storage so we can stream to Cloudinary or encode as data-uri directly
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file format. Only JPG, JPEG, PNG, and WEBP images are allowed.'),
      false
    );
  }
};

const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid document format. Only JPG, PNG, WEBP, or PDF files are allowed.'),
      false
    );
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB max
  },
  fileFilter: imageFilter,
});

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
  fileFilter: documentFilter,
});
