const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'lessons');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const ALLOWED_EXT = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.gif'];

const MAX_BYTES = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '';
    cb(null, `lesson_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${safeExt}`);
  }
});

const materialUpload = multer({
  storage,
  limits: { fileSize: MAX_BYTES },
  fileFilter: (req, file, cb) => {
    const mimeOk = ALLOWED_MIME.includes(file.mimetype);
    const extOk = ALLOWED_EXT.includes((path.extname(file.originalname) || '').toLowerCase());
    if (!mimeOk && !extOk) {
      return cb(new Error('INVALID_MATERIAL_FORMAT'));
    }
    cb(null, true);
  }
});

function inferContentType(mimetype) {
  if (!mimetype) return 'other';
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('image/')) return 'other';
  return 'other';
}

const handleMaterialUpload = (req, res, next) => {
  materialUpload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Material must not exceed 50MB' });
      }
      if (err.message === 'INVALID_MATERIAL_FORMAT') {
        return res.status(400).json({
          message: 'Unsupported material format. Accepted: PDF, DOC/DOCX, PPT/PPTX, MP4/WEBM/MOV, JPG/PNG/GIF.'
        });
      }
      return res.status(400).json({ message: 'Material upload failed', error: err.message });
    }
    next();
  });
};

module.exports = { handleMaterialUpload, inferContentType };
