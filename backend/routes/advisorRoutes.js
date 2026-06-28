const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { handlePhotoUpload } = require('../middleware/photoUpload');
const a = require('../controllers/advisorController');

router.use(protect, authorize('advisor'));

router.get('/dashboard',                        a.getDashboard);
router.get('/profile',                          a.getProfile);
router.put('/profile',     handlePhotoUpload,   a.updateProfile);
router.get('/students',                         a.getMyStudents);
router.get('/students/:studentId',              a.getStudentDetail);
router.get('/students/:studentId/grades',       a.getStudentGrades);
router.get('/progress',                         a.getStudentProgress);
router.get('/reports',                          a.generateReport);
router.get('/reports/export',                    a.exportReport);
router.get('/notifications',                    a.getNotifications);
router.patch('/notifications/:id/read',         a.markNotificationRead);

module.exports = router;