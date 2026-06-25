const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Per SDS spec: profile photo must be JPG or PNG and <= 5MB
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'profile-photos');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${req.user.role}_${req.user.user_id}_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('INVALID_PHOTO_FORMAT'));
    }
    cb(null, true);
  }
});

const handlePhotoUpload = (req, res, next) => {
  photoUpload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Photo must not exceed 5MB' });
      }
      if (err.message === 'INVALID_PHOTO_FORMAT') {
        return res.status(400).json({ message: 'Photo must be JPG or PNG format' });
      }
      return res.status(400).json({ message: 'Photo upload failed', error: err.message });
    }
    next();
  });
};

module.exports = { handlePhotoUpload };
