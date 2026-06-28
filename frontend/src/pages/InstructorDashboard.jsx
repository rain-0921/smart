import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  instrGetDashboard, instrGetProfile, instrUpdateProfile,
  instrGetCourses, instrCreateCourse, instrUpdateCourse, instrDeleteCourse,
  instrGetModules, instrCreateModule, instrUpdateModule, instrDeleteModule,
  instrCreateLesson, instrUpdateLesson, instrDeleteLesson,
  instrGetQuizzes, instrCreateQuiz, instrUpdateQuiz, instrDeleteQuiz,
  instrGetQuestions, instrAddQuestion, instrUpdateQuestion, instrDeleteQuestion,
  instrGetFeedback, instrAddFeedback, instrUpdateFeedback, instrDeleteFeedback,
  instrGetStudents, instrExportStudents, instrExportStudentsPdf, instrGetStudentDetail, instrGetPending, instrGradeSubmission,
  instrGetAnalytics, instrGetNotifications, instrMarkRead,
} from '../services/api';
import { Alert } from '../components/shared';
import { DashboardShell, Sidebar, Header } from '../components/layout';
import { useDashboardAlerts } from '../hooks';
import { token, fontMono } from '../theme';

import InstructorDashboardSection       from './instructor/sections/InstructorDashboardSection';
import InstructorCoursesSection         from './instructor/sections/InstructorCoursesSection';
import InstructorCourseBuilderSection   from './instructor/sections/InstructorCourseBuilderSection';
import InstructorGradingSection         from './instructor/sections/InstructorGradingSection';
import InstructorNotificationsSection   from './instructor/sections/InstructorNotificationsSection';
import { BuilderAnalyticsShell }        from './instructor/sections/InstructorCourseBuilderSection';
import {
  CourseModal, ModuleModal, LessonModal, QuizModal, QuestionModal,
  GradeModal, FeedbackBandModal, ProfileModal, StudentDetailModal,
} from './instructor/modals/InstructorModals';

export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const { alert, showAlert } = useDashboardAlerts(4000);

  // Data
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [feedbackBands, setFeedbackBands] = useState([]);
  const [feedbackWarning, setFeedbackWarning] = useState(false);
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState({ from: '', to: '' });
  const [notifications, setNotifications] = useState([]);

  // Selected context
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // Modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [gradingItem, setGradingItem] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Forms
  const blankCourse   = { title: '', description: '', status: 'draft' };
  const blankModule  = { title: '', description: '' };
  const blankLesson  = { title: '', content_type: 'text', content_url: '', content_text: '', duration_minutes: '', file: null };
  const blankQuiz    = { title: '', description: '', due_date: '', time_limit_minutes: '', max_attempts: 1, randomize_questions: false, submission_type: 'online_quiz', num_questions_per_attempt: '', status: 'draft' };
  const blankQ       = { question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', points: 1, improvement_tip: '' };
  const blankGrade   = { score: '', feedback: '' };
  const blankProfile = { username: '', phone_number: '', department: '', specialization: '', subjects_taught: '', office_hours: '' };
  const blankFeedback= { min_score: '', max_score: '', feedback_message: '' };

  const [courseForm, setCourseForm]   = useState(blankCourse);
  const [moduleForm, setModuleForm] = useState(blankModule);
  const [lessonForm, setLessonForm]   = useState(blankLesson);
  const [quizForm, setQuizForm]       = useState(blankQuiz);
  const [qForm, setQForm]             = useState(blankQ);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [gradeForm, setGradeForm]     = useState(blankGrade);
  const [profileForm, setProfileForm]  = useState(blankProfile);
  const [feedbackForm, setFeedbackForm]= useState(blankFeedback);
  const [photoFile, setPhotoFile]     = useState(null);

  // Fetch on page change
  useEffect(() => {
    if (page === 'dashboard') instrGetDashboard().then(r => setDashboard(r.data)).catch(() => {});
    if (page === 'courses') instrGetCourses().then(r => setCourses(r.data)).catch(() => {});
    if (page === 'grading') instrGetPending().then(r => setPending(r.data)).catch(() => {});
    if (page === 'notifications') instrGetNotifications().then(r => setNotifications(r.data)).catch(() => {});
  }, [page]);

  // Open course builder
  const openCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedQuiz(null);
    setPage('builder');
    const [m, q] = await Promise.all([
      instrGetModules(course.course_id),
      instrGetQuizzes(course.course_id),
    ]);
    setModules(m.data);
    setQuizzes(q.data);
    if (course.course_id) {
      instrGetStudents(course.course_id).then(r => setStudents(r.data)).catch(() => {});
      loadAnalytics(course.course_id, analyticsRange);
    }
  };

  const loadAnalytics = (courseId, range) => {
    const params = {};
    if (range.from) params.from = range.from;
    if (range.to)   params.to   = range.to;
    instrGetAnalytics(courseId, params).then(r => setAnalytics(r.data)).catch(() => {});
  };

  const openQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    const [qRes, fbRes] = await Promise.all([
      instrGetQuestions(quiz.quiz_id),
      instrGetFeedback(quiz.quiz_id),
    ]);
    setQuestions(qRes.data);
    setFeedbackBands(fbRes.data.feedback);
    setFeedbackWarning(fbRes.data.alreadyAttempted);
  };

  // COURSE
  const saveCourse = async () => {
    try {
      if (editingCourse) { await instrUpdateCourse(editingCourse.course_id, courseForm); showAlert('Course updated.'); }
      else               { await instrCreateCourse(courseForm); showAlert('Course created.'); }
      setShowCourseModal(false);
      instrGetCourses().then(r => setCourses(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try { await instrDeleteCourse(id); showAlert('Course archived.'); instrGetCourses().then(r => setCourses(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // MODULE
  const saveModule = async () => {
    try {
      if (editingModule) {
        await instrUpdateModule(editingModule.module_id, moduleForm);
        showAlert('Module updated.');
      } else {
        await instrCreateModule(selectedCourse.course_id, moduleForm);
        showAlert('Module added.');
      }
      setShowModuleModal(false);
      setEditingModule(null);
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await instrDeleteModule(moduleId);
      showAlert('Module deleted.');
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // LESSON
  const saveLesson = async () => {
    try {
      if (editingLesson) {
        const fd = new FormData();
        fd.append('title', lessonForm.title);
        fd.append('content_type', lessonForm.content_type);
        fd.append('content_url', lessonForm.content_url || '');
        fd.append('content_text', lessonForm.content_text || '');
        fd.append('duration_minutes', lessonForm.duration_minutes || '');
        if (lessonForm.file) fd.append('file', lessonForm.file);
        await instrUpdateLesson(editingLesson.lesson_id, fd);
        showAlert('Lesson updated.');
      } else {
        if (lessonForm.file) {
          const fd = new FormData();
          fd.append('title', lessonForm.title);
          fd.append('duration_minutes', lessonForm.duration_minutes || '');
          fd.append('file', lessonForm.file);
          await instrCreateLesson(selectedModule.module_id, fd);
        } else {
          await instrCreateLesson(selectedModule.module_id, lessonForm);
        }
        showAlert('Lesson added.');
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try { await instrDeleteLesson(lessonId); showAlert('Lesson deleted.'); instrGetModules(selectedCourse.course_id).then(r => setModules(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // QUIZ
  const saveQuiz = async () => {
    try {
      if (editingQuiz) { await instrUpdateQuiz(editingQuiz.quiz_id, quizForm); showAlert('Quiz updated.'); }
      else             { await instrCreateQuiz(selectedCourse.course_id, quizForm); showAlert('Quiz created.'); }
      setShowQuizModal(false);
      instrGetQuizzes(selectedCourse.course_id).then(r => setQuizzes(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await instrDeleteQuiz(quizId);
      showAlert('Quiz deleted.');
      instrGetQuizzes(selectedCourse.course_id).then(r => setQuizzes(r.data));
      setSelectedQuiz(null);
    } catch { showAlert('Failed', 'error'); }
  };

  // QUESTION
  const saveQuestion = async () => {
    try {
      const payload = { ...qForm };
      if (qForm.question_type === 'mcq') payload.options = qForm.options.filter(o => o.trim() !== '');
      else payload.options = null;
      if (editingQuestionId) {
        await instrUpdateQuestion(editingQuestionId, payload);
        showAlert('Question updated.');
      } else {
        await instrAddQuestion(selectedQuiz.quiz_id, payload);
        showAlert('Question added.');
      }
      setShowQModal(false);
      setEditingQuestionId(null);
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const openEditQuestion = (qs) => {
    setEditingQuestionId(qs.question_id);
    let parsedOptions = ['', '', '', ''];
    if (qs.options) {
      try {
        const arr = typeof qs.options === 'string' ? JSON.parse(qs.options) : qs.options;
        if (Array.isArray(arr)) parsedOptions = [arr[0] || '', arr[1] || '', arr[2] || '', arr[3] || ''];
      } catch {}
    }
    setQForm({
      question_type: qs.question_type,
      question_text: qs.question_text,
      options: parsedOptions,
      correct_answer: qs.correct_answer || '',
      points: qs.points,
      improvement_tip: qs.improvement_tip || ''
    });
    setShowQModal(true);
  };
  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await instrDeleteQuestion(questionId);
      showAlert('Question deleted.');
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // STUDENT DETAIL + EXPORT
  const openStudentDetail = async (studentId) => {
    setStudentDetail(null);
    setStudentDetailLoading(true);
    try {
      const res = await instrGetStudentDetail(studentId);
      setStudentDetail(res.data);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to load student', 'error');
    } finally {
      setStudentDetailLoading(false);
    }
  };
  const exportStudentsCsv = async () => {
    try {
      const res = await instrExportStudents(selectedCourse.course_id);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course_${selectedCourse.course_id}_students_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export: ' + (err.response?.data?.message || err.message));
    }
  };
  const exportStudentsPdf = async () => {
    try {
      const res = await instrExportStudentsPdf(selectedCourse.course_id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `course_${selectedCourse.course_id}_students_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export PDF: ' + (err.response?.data?.message || err.message));
    }
  };

  // FEEDBACK BAND
  const openAddFeedback = () => {
    setEditingFeedback(null);
    setFeedbackForm({ min_score: '', max_score: '', feedback_message: '' });
    setShowFeedbackModal(true);
  };
  const openEditFeedback = (band) => {
    setEditingFeedback(band);
    setFeedbackForm({ min_score: band.min_score, max_score: band.max_score, feedback_message: band.feedback_message });
    setShowFeedbackModal(true);
  };
  const saveFeedback = async () => {
    try {
      if (editingFeedback) { await instrUpdateFeedback(editingFeedback.quiz_feedback_id, feedbackForm); showAlert('Feedback band updated.'); }
      else                 { await instrAddFeedback(selectedQuiz.quiz_id, feedbackForm); showAlert('Feedback band added.'); }
      setShowFeedbackModal(false);
      const res = await instrGetFeedback(selectedQuiz.quiz_id);
      setFeedbackBands(res.data.feedback);
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteFeedback = async (id) => {
    if (!window.confirm('Delete this feedback band?')) return;
    try {
      await instrDeleteFeedback(id);
      showAlert('Feedback band deleted.');
      const res = await instrGetFeedback(selectedQuiz.quiz_id);
      setFeedbackBands(res.data.feedback);
    } catch { showAlert('Failed', 'error'); }
  };

  // GRADING
  const openGrade = (item) => {
    setGradingItem(item);
    setGradeForm({ score: '', feedback: '' });
    setShowGradeModal(true);
  };
  const saveGrade = async () => {
    try {
      await instrGradeSubmission(gradingItem.quiz_attempt_id, gradeForm);
      showAlert('Submission graded.');
      setShowGradeModal(false);
      instrGetPending().then(r => setPending(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  // PROFILE
  const openProfile = async () => {
    const res = await instrGetProfile();
    setProfileForm({
      username: res.data.username || '',
      phone_number: res.data.phone_number || '',
      department: res.data.department || '',
      specialization: res.data.specialization || '',
      subjects_taught: res.data.subjects_taught || '',
      office_hours: res.data.office_hours || '',
      photo_url: res.data.photo_url || '',
    });
    setPhotoFile(null);
    setShowProfileModal(true);
  };
  const saveProfile = async () => {
    try {
      const fd = new FormData();
      fd.append('username', profileForm.username);
      fd.append('phone_number', profileForm.phone_number || '');
      fd.append('department', profileForm.department || '');
      fd.append('specialization', profileForm.specialization || '');
      fd.append('subjects_taught', profileForm.subjects_taught || '');
      fd.append('office_hours', profileForm.office_hours || '');
      if (photoFile) fd.append('photo', photoFile);
      const res = await instrUpdateProfile(fd);
      const returnedPhotoUrl = res?.data?.photo_url;
      setProfileForm(pf => ({ ...pf, photo_url: returnedPhotoUrl || pf.photo_url }));
      showAlert('Profile updated.');
      setShowProfileModal(false);
      setPhotoFile(null);
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const markRead = async (id) => {
    await instrMarkRead(id);
    instrGetNotifications().then(r => setNotifications(r.data));
  };

  const navItems = [
    { label: 'Dashboard',     icon: '◈', key: 'dashboard' },
    { label: 'My Courses',   icon: '◉', key: 'courses' },
    { label: 'Course Builder', icon: '◧', key: 'builder' },
    { label: 'Grading',      icon: '◨', key: 'grading', badge: pending.length },
    { label: 'Notifications', icon: '◩', key: 'notifications', badge: unreadCount },
  ];

  const pageTitle = {
    dashboard:    'Instructor Dashboard',
    courses:      'My Courses',
    builder:      selectedCourse ? `${selectedCourse.title}` : 'Course Builder',
    grading:      'Grading',
    notifications: 'Notifications',
  }[page] || '';

  const navGroups = [
    {
      label: 'Main',
      items: navItems.map(item => ({ key: item.key, label: item.label, icon: item.iconName || 'home', badge: item.badge })),
    },
  ];

  // ───── Charts (kept in parent because recharts lives here) ─────
  const renderCharts = () => {
    if (!analytics) return null;
    return (
      <BuilderAnalyticsShell
        analytics={analytics}
        range={analyticsRange}
        onChangeFrom={v => setAnalyticsRange(r => ({ ...r, from: v }))}
        onChangeTo={v => setAnalyticsRange(r => ({ ...r, to: v }))}
        onApply={() => loadAnalytics(selectedCourse.course_id, analyticsRange)}
        onReset={() => { setAnalyticsRange({ from: '', to: '' }); loadAnalytics(selectedCourse.course_id, { from: '', to: '' }); }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <div className="sils-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Completed</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: '"IBM Plex Mono", monospace' }}>{analytics.completed}</div>
          </div>
          <div className="sils-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Total Enrolled</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: '"IBM Plex Mono", monospace' }}>{analytics.total}</div>
          </div>
          <div className="sils-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Completion Rate</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: '"IBM Plex Mono", monospace' }}>
              {analytics.total > 0 ? `${Math.round(analytics.completed / analytics.total * 100)}%` : '0%'}
            </div>
          </div>
          <div className="sils-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
            <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Submission Rate</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: '"IBM Plex Mono", monospace' }}>{analytics.submissionRate?.pct ?? 0}%</div>
            <div style={{ fontSize: 11, color: token.inkSoft, marginTop: 6, fontFamily: fontMono }}>
              {analytics.submissionRate ? `${analytics.submissionRate.submitted}/${analytics.submissionRate.active} students` : ''}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
          <div style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: token.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Average Quiz Score
            </div>
            {analytics.quizStats.length === 0 || analytics.quizStats.every(q => Number(q.attempts) === 0) ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: token.inkFaint, fontSize: 12 }}>
                No quiz attempts in this range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics.quizStats.map(q => ({ name: q.title.length > 14 ? q.title.slice(0, 14) + '…' : q.title, score: parseFloat(parseFloat(q.avg_score).toFixed(1)) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={token.line} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: token.inkSoft }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: token.inkSoft }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${token.line}` }} />
                  <Bar dataKey="score" fill={token.brass} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: token.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Enrollment Trend
            </div>
            {analytics.enrollmentTrend.length === 0 ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: token.inkFaint, fontSize: 12 }}>
                No enrollment data in this range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.enrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={token.line} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: token.inkSoft }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: token.inkSoft }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${token.line}` }} />
                  <Line type="monotone" dataKey="count" stroke={token.brass} strokeWidth={2.5} dot={{ r: 4, fill: token.brass }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 10, padding: 16, marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: token.inkSoft, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
            Score Distribution (graded attempts)
          </div>
          {analytics.scoreDistribution.every(b => b.count === 0) ? (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: token.inkFaint, fontSize: 12 }}>
              No graded attempts in this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={analytics.scoreDistribution}
                  dataKey="count"
                  nameKey="bucket"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ bucket, count }) => `${bucket}: ${count}`}
                  labelLine={false}
                >
                  {analytics.scoreDistribution.map((entry, i) => (
                    <Cell key={i} fill={['#B3261E', '#D97706', '#A9792C', '#1F7A4D', '#2454A6'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${token.line}` }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <h5 style={{ margin: '18px 0 8px 0', fontFamily: '"Lora", serif', fontSize: 13, color: token.ink, textTransform: 'uppercase', letterSpacing: 0.6 }}>
          Per-Quiz Breakdown
        </h5>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              {['Quiz', 'Avg Score', 'Attempts'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analytics.quizStats.length === 0
              ? <tr><td colSpan={3} style={{ padding: 20, color: token.inkFaint, fontSize: 12, textAlign: 'center' }}>No quizzes yet.</td></tr>
              : analytics.quizStats.map((q, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${token.line}` }}>
                  <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{q.title}</td>
                  <td style={{ padding: '10px 12px', fontFamily: fontMono, fontWeight: 700, color: q.avg_score >= 70 ? token.good : q.avg_score >= 50 ? token.warn : token.danger }}>
                    {parseFloat(q.avg_score || 0).toFixed(1)}%
                  </td>
                  <td style={{ padding: '10px 12px', fontFamily: fontMono, color: token.inkSoft }}>{q.attempts}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </BuilderAnalyticsShell>
    );
  };

  return (
    <DashboardShell
      sidebar={
        <Sidebar
          user={user}
          portalName="Instructor"
          navGroups={navGroups}
          activeKey={page}
          onNavigate={setPage}
          onLogout={logout}
          onProfile={openProfile}
        />
      }
      header={
        <Header
          eyebrow="Instructor"
          title={pageTitle}
          onNotifications={() => setPage('notifications')}
          notificationsBadge={unreadCount > 0}
          onProfile={openProfile}
          user={user}
        />
      }
    >
      <Alert msg={alert.msg} type={alert.type} />

      {page === 'dashboard'     && <InstructorDashboardSection dashboard={dashboard} />}
      {page === 'courses'       && <InstructorCoursesSection
          courses={courses}
          onAddNew={() => { setEditingCourse(null); setCourseForm(blankCourse); setShowCourseModal(true); }}
          onOpenCourse={openCourse}
          onEditCourse={(c) => { setEditingCourse(c); setCourseForm({ title: c.title, description: c.description || '', status: c.status }); setShowCourseModal(true); }}
          onArchiveCourse={archiveCourse}
        />}
      {page === 'builder' && <InstructorCourseBuilderSection
          selectedCourse={selectedCourse}
          modules={modules}
          quizzes={quizzes}
          selectedQuizId={selectedQuiz?.quiz_id}
          questions={questions}
          feedbackBands={feedbackBands}
          feedbackWarning={feedbackWarning}
          students={students}
          onAddModule={() => { setEditingModule(null); setModuleForm(blankModule); setShowModuleModal(true); }}
          onEditModule={(mod) => { setEditingModule(mod); setModuleForm({ title: mod.title, description: mod.description || '' }); setShowModuleModal(true); }}
          onAddLesson={(mod) => { setSelectedModule(mod); setEditingLesson(null); setLessonForm(blankLesson); setShowLessonModal(true); }}
          onEditLesson={(l) => { setEditingLesson(l); setLessonForm({ title: l.title, content_type: l.content_type || 'text', content_url: l.content_url || '', content_text: l.content_text || '', duration_minutes: l.duration_minutes || '', file: null }); setShowLessonModal(true); }}
          onDeleteModule={deleteModule}
          onDeleteLesson={deleteLesson}
          onAddQuiz={() => { setEditingQuiz(null); setQuizForm(blankQuiz); setShowQuizModal(true); }}
          onEditQuiz={(q) => { setEditingQuiz(q); setQuizForm({ title: q.title, description: q.description || '', due_date: q.due_date || '', time_limit_minutes: q.time_limit_minutes || '', max_attempts: q.max_attempts || 1, randomize_questions: q.randomize_questions || false, submission_type: q.submission_type || 'online_quiz', num_questions_per_attempt: q.num_questions_per_attempt || '', status: q.status || 'draft' }); setShowQuizModal(true); }}
          onDeleteQuiz={deleteQuiz}
          onToggleQuiz={(q) => selectedQuiz?.quiz_id === q.quiz_id ? setSelectedQuiz(null) : openQuiz(q)}
          onAddQuestion={() => { setEditingQuestionId(null); setQForm(blankQ); setShowQModal(true); }}
          onEditQuestion={openEditQuestion}
          onDeleteQuestion={deleteQuestion}
          onAddBand={openAddFeedback}
          onEditBand={openEditFeedback}
          onDeleteBand={deleteFeedback}
          onOpenStudent={openStudentDetail}
          onExportStudentsCsv={exportStudentsCsv}
          onExportStudentsPdf={exportStudentsPdf}
        >{renderCharts()}</InstructorCourseBuilderSection>}
      {page === 'grading'      && <InstructorGradingSection pending={pending} onOpenGrade={openGrade} />}
      {page === 'notifications' && <InstructorNotificationsSection notifications={notifications} onMarkRead={markRead} />}

      {showCourseModal && (
        <CourseModal
          editingCourse={editingCourse}
          courseForm={courseForm}
          onChange={setCourseForm}
          onClose={() => setShowCourseModal(false)}
          onSubmit={saveCourse}
        />
      )}
      {showModuleModal && (
        <ModuleModal
          editingModule={editingModule}
          moduleForm={moduleForm}
          onChange={setModuleForm}
          onClose={() => { setShowModuleModal(false); setEditingModule(null); }}
          onSubmit={saveModule}
        />
      )}
      {showLessonModal && (
        <LessonModal
          editingLesson={editingLesson}
          lessonForm={lessonForm}
          onChange={setLessonForm}
          onClose={() => { setShowLessonModal(false); setEditingLesson(null); }}
          onSubmit={saveLesson}
        />
      )}
      {showQuizModal && (
        <QuizModal
          editingQuiz={editingQuiz}
          quizForm={quizForm}
          onChange={setQuizForm}
          onClose={() => setShowQuizModal(false)}
          onSubmit={saveQuiz}
        />
      )}
      {showQModal && (
        <QuestionModal
          editingQuestionId={editingQuestionId}
          qForm={qForm}
          onChange={setQForm}
          onClose={() => { setShowQModal(false); setEditingQuestionId(null); }}
          onSubmit={saveQuestion}
        />
      )}
      {showGradeModal && (
        <GradeModal
          gradingItem={gradingItem}
          gradeForm={gradeForm}
          onChange={setGradeForm}
          onClose={() => setShowGradeModal(false)}
          onSubmit={saveGrade}
        />
      )}
      {showFeedbackModal && (
        <FeedbackBandModal
          editingFeedback={editingFeedback}
          feedbackForm={feedbackForm}
          onChange={setFeedbackForm}
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={saveFeedback}
        />
      )}
      {showProfileModal && (
        <ProfileModal
          profileForm={profileForm}
          photoFile={photoFile}
          onChange={setProfileForm}
          onPhotoSelect={setPhotoFile}
          onClose={() => setShowProfileModal(false)}
          onSubmit={saveProfile}
        />
      )}
      {(studentDetail || studentDetailLoading) && (
        <StudentDetailModal
          studentDetail={studentDetail || { profile: { username: 'Loading…' }, courses: [], quizAttempts: [], submissions: [] }}
          onClose={() => { setStudentDetail(null); setStudentDetailLoading(false); }}
        />
      )}
    </DashboardShell>
  );
}