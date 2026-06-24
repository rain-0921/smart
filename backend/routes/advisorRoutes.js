const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, authorize } = require('../middleware/authMiddleware');
const a = require('../controllers/advisorController');

router.use(protect, authorize('advisor'));

// ─── PROFILE PHOTO UPLOAD ─────────────────────────────────
// Per SDS 7.2.2 AdvisorManageProfile: photo must be JPG/PNG and <= 5MB.
// NOTE: assumes an /uploads/profile-photos directory exists at project root
// and is served statically (e.g. app.use('/uploads', express.static(...))).
// Adjust the destination path below if your project stores uploads elsewhere.
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/profile-photos')),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `advisor_${req.user.user_id}_${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('INVALID_PHOTO_FORMAT'));
    }
    cb(null, true);
  }
});

const handlePhotoUpload = (req, res, next) => {
  photoUpload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE' || err.message === 'INVALID_PHOTO_FORMAT') {
        return res.status(400).json({ message: 'Photo must be JPG or PNG and not exceed 5MB' });
      }
      return res.status(400).json({ message: 'Photo upload failed', error: err.message });
    }
    next();
  });
};

router.get('/dashboard',                        a.getDashboard);
router.get('/profile',                          a.getProfile);
router.put('/profile',     handlePhotoUpload,   a.updateProfile);
router.get('/students',                         a.getMyStudents);
router.get('/students/:studentId',              a.getStudentDetail);
router.get('/students/:studentId/grades',       a.getStudentGrades);
router.get('/progress',                         a.getStudentProgress);
router.get('/reports',                          a.generateReport);
router.get('/notifications',                    a.getNotifications);
router.patch('/notifications/:id/read',         a.markNotificationRead);

module.exports = router;