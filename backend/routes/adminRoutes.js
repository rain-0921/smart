const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const admin = require('../controllers/adminController');

// All admin routes are protected
router.use(protect, authorize('admin'));

// Departments
router.get('/departments', admin.getDepartments);

// Dashboard
router.get('/dashboard',                  admin.getDashboard);

// Users
router.get('/users',                      admin.getAllUsers);
router.post('/users',                     admin.addUser);
router.put('/users/:id',                  admin.editUser);
router.patch('/users/:id/deactivate',     admin.deactivateUser);

// Courses
router.get('/courses',                    admin.getAllCourses);
router.post('/courses',                   admin.addCourse);
router.put('/courses/:id',                admin.editCourse);
router.patch('/courses/:id/archive',      admin.archiveCourse);

// Enrollments
router.get('/enrollments',                admin.getAllEnrollments);
router.post('/enrollments',               admin.addEnrollment);
router.put('/enrollments/:id',            admin.editEnrollment);
router.patch('/enrollments/:id/drop',     admin.dropEnrollment);

// Notifications
router.get('/notifications',              admin.getAllNotifications);
router.post('/notifications',             admin.createNotification);
router.put('/notifications/:id',          admin.editNotification);
router.delete('/notifications/:id',       admin.deleteNotification);

// Reports
// GET /reports/types               -> list of available report types
// GET /reports?type=&startDate=&endDate=  -> generate a report (with "No data available" handling)
router.get('/reports/types',              admin.getReportTypes);
router.get('/reports/export',             admin.exportReports);
router.get('/reports',                    admin.getReports);

// Activity Logs
// GET /activity-logs/filters       -> dropdown options (roles + activity types)
// GET /activity-logs/users         -> users + their most recent activity
// GET /activity-logs?role=&activityType=&startDate=&endDate=&userId=&limit=  -> filtered list / user history
// GET /activity-logs/export?...    -> CSV download (same filters)
router.get('/activity-logs/filters',      admin.getActivityFilters);
router.get('/activity-logs/users',        admin.getActivityUsers);
router.get('/activity-logs/export',       admin.exportActivityLogs);
router.get('/activity-logs',              admin.getActivityLogs);

module.exports = router;