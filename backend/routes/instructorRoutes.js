const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const i = require('../controllers/instructorController');

router.use(protect, authorize('instructor'));

// Dashboard & Profile
router.get('/dashboard',                         i.getDashboard);
router.get('/profile',                           i.getProfile);
router.put('/profile',                           i.updateProfile);

// Courses
router.get('/courses',                           i.getMyCourses);
router.post('/courses',                          i.createCourse);
router.put('/courses/:id',                       i.updateCourse);
router.delete('/courses/:id',                    i.deleteCourse);

// Modules
router.get('/courses/:courseId/modules',         i.getCourseModules);
router.post('/courses/:courseId/modules',        i.createModule);
router.delete('/modules/:moduleId',              i.deleteModule);

// Lessons
router.post('/modules/:moduleId/lessons',        i.createLesson);
router.delete('/lessons/:lessonId',              i.deleteLesson);

// Quizzes
router.get('/courses/:courseId/quizzes',         i.getCourseQuizzes);
router.post('/courses/:courseId/quizzes',        i.createQuiz);
router.put('/quizzes/:quizId',                   i.updateQuiz);
router.delete('/quizzes/:quizId',                i.deleteQuiz);

// Questions
router.get('/quizzes/:quizId/questions',         i.getQuizQuestions);
router.post('/quizzes/:quizId/questions',        i.addQuestion);
router.delete('/questions/:questionId',          i.deleteQuestion);

// Student Progress & Grading
router.get('/courses/:courseId/students',        i.getCourseStudents);
router.get('/submissions/pending',               i.getPendingSubmissions);
router.patch('/submissions/:attemptId/grade',    i.gradeSubmission);

// Analytics
router.get('/courses/:courseId/analytics',       i.getAnalytics);

// Notifications
router.get('/notifications',                     i.getNotifications);
router.patch('/notifications/:id/read',          i.markNotificationRead);

module.exports = router;