const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

// All admin routes are protected
router.use(protect, authorize('admin'));

// Users
router.get('/users',           admin.getAllUsers);
router.post('/users',          admin.addUser);
router.put('/users/:id',       admin.editUser);
router.patch('/users/:id/deactivate', admin.deactivateUser);

// Courses
router.get('/courses',         admin.getAllCourses);
router.post('/courses',        admin.addCourse);
router.put('/courses/:id',     admin.editCourse);
router.patch('/courses/:id/archive', admin.archiveCourse);

// Enrollments
router.get('/enrollments',     admin.getAllEnrollments);
router.post('/enrollments',    admin.addEnrollment);
router.patch('/enrollments/:id/drop', admin.dropEnrollment);

// Reports & Logs
router.get('/reports',         admin.getReports);
router.get('/activity-logs',   admin.getActivityLogs);

module.exports = router;