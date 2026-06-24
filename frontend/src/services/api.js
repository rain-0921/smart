import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const loginUser    = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe        = ()     => API.get('/auth/me');

// Admin - Users
export const adminGetUsers       = ()       => API.get('/admin/users');
export const adminAddUser        = (data)   => API.post('/admin/users', data);
export const adminEditUser       = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminDeactivateUser = (id)     => API.patch(`/admin/users/${id}/deactivate`);

// Admin - Courses
export const adminGetCourses     = ()       => API.get('/admin/courses');
export const adminAddCourse      = (data)   => API.post('/admin/courses', data);
export const adminEditCourse     = (id, data) => API.put(`/admin/courses/${id}`, data);
export const adminArchiveCourse  = (id)     => API.patch(`/admin/courses/${id}/archive`);

// Admin - Enrollments
export const adminGetEnrollments = ()       => API.get('/admin/enrollments');
export const adminAddEnrollment  = (data)   => API.post('/admin/enrollments', data);
export const adminDropEnrollment = (id)     => API.patch(`/admin/enrollments/${id}/drop`);

// Admin - Reports & Logs
export const adminGetReports     = ()       => API.get('/admin/reports');
export const adminGetLogs        = ()       => API.get('/admin/activity-logs');

// Student
export const studentGetDashboard    = ()           => API.get('/student/dashboard');
export const studentGetProfile      = ()           => API.get('/student/profile');
export const studentUpdateProfile   = (data)       => API.put('/student/profile', data);
export const studentGetCourses      = ()           => API.get('/student/courses');
export const studentEnroll          = (data)       => API.post('/student/courses/enroll', data);
export const studentGetModules      = (courseId)   => API.get(`/student/courses/${courseId}/modules`);
export const studentCompleteLesson  = (moduleId)   => API.post(`/student/modules/${moduleId}/complete`);
export const studentGetQuizzes      = (courseId)   => API.get(`/student/courses/${courseId}/quizzes`);
export const studentStartQuiz       = (quizId)     => API.post(`/student/quizzes/${quizId}/start`);
export const studentSubmitQuiz      = (attemptId, data) => API.post(`/student/attempts/${attemptId}/submit`, data);
export const studentGetAssignment   = (quizId)     => API.get(`/student/assignments/${quizId}`);
export const studentSubmitAssignment= (quizId, formData) =>
  API.post(`/student/assignments/${quizId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
export const studentGetGrades       = (courseId)   => API.get(`/student/courses/${courseId}/grades`);
export const studentGetNotifications= ()           => API.get('/student/notifications');
export const studentMarkRead        = (id)         => API.patch(`/student/notifications/${id}/read`);
export const studentGetProgress    = ()           => API.get('/student/progress');
export const studentGetGradeDetail = (attemptId)  => API.get(`/student/attempts/${attemptId}/detail`);
// Instructor
export const instrGetDashboard      = ()             => API.get('/instructor/dashboard');
export const instrGetProfile        = ()             => API.get('/instructor/profile');
export const instrUpdateProfile     = (data)         => API.put('/instructor/profile', data);
export const instrGetCourses        = ()             => API.get('/instructor/courses');
export const instrCreateCourse      = (data)         => API.post('/instructor/courses', data);
export const instrUpdateCourse      = (id, data)     => API.put(`/instructor/courses/${id}`, data);
export const instrDeleteCourse      = (id)           => API.delete(`/instructor/courses/${id}`);
export const instrGetModules        = (courseId)     => API.get(`/instructor/courses/${courseId}/modules`);
export const instrCreateModule      = (courseId, data) => API.post(`/instructor/courses/${courseId}/modules`, data);
export const instrDeleteModule      = (moduleId)     => API.delete(`/instructor/modules/${moduleId}`);
export const instrCreateLesson      = (moduleId, data) => API.post(`/instructor/modules/${moduleId}/lessons`, data);
export const instrDeleteLesson      = (lessonId)     => API.delete(`/instructor/lessons/${lessonId}`);
export const instrGetQuizzes        = (courseId)     => API.get(`/instructor/courses/${courseId}/quizzes`);
export const instrCreateQuiz        = (courseId, data) => API.post(`/instructor/courses/${courseId}/quizzes`, data);
export const instrUpdateQuiz        = (quizId, data) => API.put(`/instructor/quizzes/${quizId}`, data);
export const instrDeleteQuiz        = (quizId)       => API.delete(`/instructor/quizzes/${quizId}`);
export const instrGetQuestions      = (quizId)       => API.get(`/instructor/quizzes/${quizId}/questions`);
export const instrAddQuestion       = (quizId, data) => API.post(`/instructor/quizzes/${quizId}/questions`, data);
export const instrDeleteQuestion    = (questionId)   => API.delete(`/instructor/questions/${questionId}`);
export const instrGetFeedback       = (quizId)       => API.get(`/instructor/quizzes/${quizId}/feedback`);
export const instrAddFeedback       = (quizId, data) => API.post(`/instructor/quizzes/${quizId}/feedback`, data);
export const instrUpdateFeedback    = (feedbackId, data) => API.put(`/instructor/feedback/${feedbackId}`, data);
export const instrDeleteFeedback    = (feedbackId)   => API.delete(`/instructor/feedback/${feedbackId}`);
export const instrGetStudents       = (courseId)     => API.get(`/instructor/courses/${courseId}/students`);
export const instrGetPending        = ()             => API.get('/instructor/submissions/pending');
export const instrGradeSubmission   = (attemptId, data) => API.patch(`/instructor/submissions/${attemptId}/grade`, data);
export const instrGetAnalytics      = (courseId)     => API.get(`/instructor/courses/${courseId}/analytics`);
export const instrGetNotifications  = ()             => API.get('/instructor/notifications');
export const instrMarkRead          = (id)           => API.patch(`/instructor/notifications/${id}/read`);

// Advisor
export const advisorGetDashboard     = ()           => API.get('/advisor/dashboard');
export const advisorGetProfile       = ()           => API.get('/advisor/profile');
export const advisorUpdateProfile    = (data)       => API.put('/advisor/profile', data);
export const advisorGetStudents      = ()           => API.get('/advisor/students');
export const advisorGetStudent       = (id)         => API.get(`/advisor/students/${id}`);
export const advisorGetGrades        = (id)         => API.get(`/advisor/students/${id}/grades`);
export const advisorGetProgress      = ()           => API.get('/advisor/progress');
export const advisorGetReport        = (type)       => API.get(`/advisor/reports?type=${type}`);
export const advisorGetNotifications = ()           => API.get('/advisor/notifications');
export const advisorMarkRead         = (id)         => API.patch(`/advisor/notifications/${id}/read`);

export default API;