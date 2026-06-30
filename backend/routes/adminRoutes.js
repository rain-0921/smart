const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/departments', admin.getDepartments);

router.get('/dashboard',                  admin.getDashboard);

router.get('/users',                      admin.getAllUsers);
router.post('/users',                     admin.addUser);
router.put('/users/:id',                  admin.editUser);
router.patch('/users/:id/deactivate',     admin.deactivateUser);

router.get('/courses',                    admin.getAllCourses);
router.post('/courses',                   admin.addCourse);
router.put('/courses/:id',                admin.editCourse);
router.patch('/courses/:id/archive',      admin.archiveCourse);

router.get('/students',               admin.getAllStudentsWithAdvisor);
router.get('/advisors',                admin.getAllAdvisors);
router.patch('/students/:studentId/advisor', admin.assignAdvisor);

router.get('/enrollments',                admin.getAllEnrollments);
router.post('/enrollments',               admin.addEnrollment);
router.put('/enrollments/:id',            admin.editEnrollment);
router.patch('/enrollments/:id/drop',     admin.dropEnrollment);

router.get('/notifications',              admin.getAllNotifications);
router.post('/notifications',             admin.createNotification);
router.put('/notifications/:id',          admin.editNotification);
router.delete('/notifications/:id',       admin.deleteNotification);

router.get('/reports/types',              admin.getReportTypes);
router.get('/reports/export',             admin.exportReports);
router.get('/reports',                    admin.getReports);

router.get('/activity-logs/filters',      admin.getActivityFilters);
router.get('/activity-logs/users',        admin.getActivityUsers);
router.get('/activity-logs/export',       admin.exportActivityLogs);
router.get('/activity-logs',              admin.getActivityLogs);

module.exports = router;
