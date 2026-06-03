const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const s = require('../controllers/studentController');

router.use(protect, authorize('student'));

router.get('/dashboard',                    s.getDashboard);
router.get('/profile',                      s.getProfile);
router.put('/profile',                      s.updateProfile);
router.get('/courses',                      s.getCourseCatalogue);
router.post('/courses/enroll',              s.enrollCourse);
router.get('/courses/:courseId/modules',    s.getCourseModules);
router.post('/modules/:moduleId/complete',  s.completeLesson);
router.get('/courses/:courseId/quizzes',    s.getCourseQuizzes);
router.post('/quizzes/:quizId/start',       s.startQuiz);
router.post('/attempts/:attemptId/submit',  s.submitQuiz);
router.get('/courses/:courseId/grades',     s.getGrades);
router.get('/notifications',                s.getNotifications);
router.patch('/notifications/:id/read',     s.markNotificationRead);

module.exports = router;