const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { handlePhotoUpload } = require('../middleware/photoUpload');
const { handleMaterialUpload } = require('../middleware/materialUpload');
const i = require('../controllers/instructorController');

router.use(protect, authorize('instructor'));

// Dashboard & Profile
router.get('/dashboard',                         i.getDashboard);
router.get('/profile',                           i.getProfile);
router.put('/profile',     handlePhotoUpload,   i.updateProfile);

// Courses
router.get('/courses',                           i.getMyCourses);
router.post('/courses',                          i.createCourse);
router.put('/courses/:id',                       i.updateCourse);
router.delete('/courses/:id',                    i.deleteCourse);

// Modules
router.get('/courses/:courseId/modules',         i.getCourseModules);
router.post('/courses/:courseId/modules',        i.createModule);
router.put('/modules/:moduleId',                i.updateModule);
router.delete('/modules/:moduleId',              i.deleteModule);

// Lessons
router.post('/modules/:moduleId/lessons',       handleMaterialUpload, i.createLesson);
router.put('/lessons/:lessonId',                handleMaterialUpload, i.updateLesson);
router.delete('/lessons/:lessonId',             i.deleteLesson);

// Quizzes
router.get('/courses/:courseId/quizzes',         i.getCourseQuizzes);
router.post('/courses/:courseId/quizzes',        i.createQuiz);
router.put('/quizzes/:quizId',                   i.updateQuiz);
router.delete('/quizzes/:quizId',                i.deleteQuiz);

// Questions
router.get('/quizzes/:quizId/questions',         i.getQuizQuestions);
router.post('/quizzes/:quizId/questions',        i.addQuestion);
router.put('/questions/:questionId',             i.updateQuestion);
router.delete('/questions/:questionId',          i.deleteQuestion);

// Quiz Feedback (score-band messages)
router.get('/quizzes/:quizId/feedback',          i.getQuizFeedback);
router.post('/quizzes/:quizId/feedback',         i.addQuizFeedback);
router.put('/feedback/:feedbackId',              i.updateQuizFeedback);
router.delete('/feedback/:feedbackId',           i.deleteQuizFeedback);

// Student Progress & Grading
router.get('/courses/:courseId/students',        i.getCourseStudents);
router.get('/courses/:courseId/students/export', i.exportCourseStudents);
router.get('/courses/:courseId/students/export.pdf', i.exportCourseStudentsPdf);
router.get('/students/:studentId',               i.getStudentDetail);
router.get('/submissions/pending',               i.getPendingSubmissions);
router.patch('/submissions/:attemptId/grade',    i.gradeSubmission);

// Analytics
router.get('/courses/:courseId/analytics',       i.getAnalytics);

// Notifications
router.get('/notifications',                     i.getNotifications);
router.patch('/notifications/:id/read',          i.markNotificationRead);

module.exports = router;