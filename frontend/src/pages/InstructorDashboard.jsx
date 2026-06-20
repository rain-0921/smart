import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  instrGetDashboard, instrGetProfile, instrUpdateProfile,
  instrGetCourses, instrCreateCourse, instrUpdateCourse, instrDeleteCourse,
  instrGetModules, instrCreateModule, instrDeleteModule,
  instrCreateLesson, instrDeleteLesson,
  instrGetQuizzes, instrCreateQuiz, instrUpdateQuiz, instrDeleteQuiz,
  instrGetQuestions, instrAddQuestion, instrDeleteQuestion,
  instrGetStudents, instrGetPending, instrGradeSubmission,
  instrGetAnalytics, instrGetNotifications, instrMarkRead
} from '../services/api';

const theme = {
  bg: '#0d0f14',
  surface: '#13161e',
  surface2: '#1a1e29',
  surface3: '#222636',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text: '#e8eaf0',
  textMuted: '#7a7f94',
  textDim: '#4a4f62',
  accent: '#6c8fff',
  accent2: '#a78bfa',
  accent3: '#34d399',
  accent4: '#f97316',
  accent5: '#fb7185',
  radius: 14,
  radiusSm: 8
};

// ─── Reusable UI ─────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  const palette = type === 'error'
    ? { bg: 'rgba(251,113,133,0.12)', color: theme.accent5, border: 'rgba(251,113,133,0.35)' }
    : { bg: 'rgba(52,211,153,0.12)', color: theme.accent3, border: 'rgba(52,211,153,0.35)' };
  return (
    <div style={{ ...alertBox, background: palette.bg, color: palette.color, borderColor: palette.border }}>
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: wide ? 700 : 520 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", color: theme.text }}>{title}</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = 'blue' }) {
  const toneColors = {
    blue: { bg: 'rgba(108, 139, 255, 0.1)', text: '#6c8fff' },
    purple: { bg: 'rgba(167, 139, 250, 0.1)', text: '#a78bfa' },
    green: { bg: 'rgba(52, 211, 153, 0.1)', text: '#34d399' },
    orange: { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
  };
  const color = toneColors[tone] || toneColors.blue;
  return (
    <div style={{ ...statCard, background: color.bg, borderColor: color.text + '40' }}>
      <p style={{ color: theme.textMuted, fontSize: 12, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </p>
      <h3 style={{ color: color.text, fontSize: 28, margin: '0 0 4px 0', fontFamily: "'DM Serif Display', serif" }}>
        {value}
      </h3>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [alert, setAlert] = useState({ msg: '', type: '' });

  // data
  const [dashboard, setDashboard] = useState(null);
  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [pending, setPending] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // selected context
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  // modals
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showQModal, setShowQModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [gradingItem, setGradingItem] = useState(null);

  // forms
  const blankCourse = { title: '', description: '', status: 'draft' };
  const blankModule = { title: '', description: '' };
  const blankLesson = { title: '', content_type: 'text', content_url: '', content_text: '', duration_minutes: '' };
  const blankQuiz = { title: '', description: '', due_date: '', time_limit_minutes: '', max_attempts: 1, randomize_questions: false, submission_type: 'online_quiz', status: 'draft' };
  const blankQ = { question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', points: 1, improvement_tip: '' };
  const blankGrade = { score: '', feedback: '' };
  const blankProfile = { username: '', phone_number: '', department: '', specialization: '', subjects_taught: '', office_hours: '' };

  const [courseForm, setCourseForm] = useState(blankCourse);
  const [moduleForm, setModuleForm] = useState(blankModule);
  const [lessonForm, setLessonForm] = useState(blankLesson);
  const [quizForm, setQuizForm] = useState(blankQuiz);
  const [qForm, setQForm] = useState(blankQ);
  const [gradeForm, setGradeForm] = useState(blankGrade);
  const [profileForm, setProfileForm] = useState(blankProfile);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 3000);
  };

  // ── Fetch on page change ──
  useEffect(() => {
    if (page === 'dashboard') instrGetDashboard().then(r => setDashboard(r.data)).catch(() => {});
    if (page === 'courses') instrGetCourses().then(r => setCourses(r.data)).catch(() => {});
    if (page === 'grading') instrGetPending().then(r => setPending(r.data)).catch(() => {});
    if (page === 'notifications') instrGetNotifications().then(r => setNotifications(r.data)).catch(() => {});
  }, [page]);

  // ── Open course builder ──
  const openCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedQuiz(null);
    setPage('builder');
    const [m, q] = await Promise.all([
      instrGetModules(course.course_id),
      instrGetQuizzes(course.course_id)
    ]);
    setModules(m.data);
    setQuizzes(q.data);
    if (course.course_id) {
      instrGetStudents(course.course_id).then(r => setStudents(r.data)).catch(() => {});
      instrGetAnalytics(course.course_id).then(r => setAnalytics(r.data)).catch(() => {});
    }
  };

  // ── Open quiz questions ──
  const openQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    const res = await instrGetQuestions(quiz.quiz_id);
    setQuestions(res.data);
  };

  // ── COURSE CRUD ──
  const saveCourse = async () => {
    try {
      if (editingCourse) {
        await instrUpdateCourse(editingCourse.course_id, courseForm);
        showAlert('Course updated!');
      } else {
        await instrCreateCourse(courseForm);
        showAlert('Course created!');
      }
      setShowCourseModal(false);
      instrGetCourses().then(r => setCourses(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try {
      await instrDeleteCourse(id);
      showAlert('Course archived');
      instrGetCourses().then(r => setCourses(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── MODULE CRUD ──
  const saveModule = async () => {
    try {
      await instrCreateModule(selectedCourse.course_id, moduleForm);
      showAlert('Module added!');
      setShowModuleModal(false);
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await instrDeleteModule(moduleId);
      showAlert('Module deleted');
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── LESSON CRUD ──
  const saveLesson = async () => {
    try {
      await instrCreateLesson(selectedModule.module_id, lessonForm);
      showAlert('Lesson added!');
      setShowLessonModal(false);
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await instrDeleteLesson(lessonId);
      showAlert('Lesson deleted');
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── QUIZ CRUD ──
  const saveQuiz = async () => {
    try {
      if (editingQuiz) {
        await instrUpdateQuiz(editingQuiz.quiz_id, quizForm);
        showAlert('Quiz updated!');
      } else {
        await instrCreateQuiz(selectedCourse.course_id, quizForm);
        showAlert('Quiz created!');
      }
      setShowQuizModal(false);
      instrGetQuizzes(selectedCourse.course_id).then(r => setQuizzes(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await instrDeleteQuiz(quizId);
      showAlert('Quiz deleted');
      instrGetQuizzes(selectedCourse.course_id).then(r => setQuizzes(r.data));
      setSelectedQuiz(null);
    } catch { showAlert('Failed', 'error'); }
  };

  // ── QUESTION CRUD ──
  const saveQuestion = async () => {
    try {
      const payload = { ...qForm };
      if (qForm.question_type === 'mcq') {
        payload.options = qForm.options.filter(o => o.trim() !== '');
      } else {
        payload.options = null;
      }
      await instrAddQuestion(selectedQuiz.quiz_id, payload);
      showAlert('Question added!');
      setShowQModal(false);
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await instrDeleteQuestion(questionId);
      showAlert('Question deleted');
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── GRADING ──
  const openGrade = (item) => {
    setGradingItem(item);
    setGradeForm({ score: '', feedback: '' });
    setShowGradeModal(true);
  };
  const saveGrade = async () => {
    try {
      await instrGradeSubmission(gradingItem.quiz_attempt_id, gradeForm);
      showAlert('Submission graded!');
      setShowGradeModal(false);
      instrGetPending().then(r => setPending(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  // ── PROFILE ──
  const openProfile = async () => {
    const res = await instrGetProfile();
    setProfileForm({
      username: res.data.username || '',
      phone_number: res.data.phone_number || '',
      department: res.data.department || '',
      specialization: res.data.specialization || '',
      subjects_taught: res.data.subjects_taught || '',
      office_hours: res.data.office_hours || ''
    });
    setShowProfileModal(true);
  };
  const saveProfile = async () => {
    try {
      await instrUpdateProfile(profileForm);
      showAlert('Profile updated!');
      setShowProfileModal(false);
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const markRead = async (id) => {
    await instrMarkRead(id);
    instrGetNotifications().then(r => setNotifications(r.data));
  };

  // Navigation config
  const navSections = [
    {
      label: 'Main',
      items: [
        { icon: '📊', label: 'Dashboard', onClick: () => setPage('dashboard'), isActive: page === 'dashboard' },
        { icon: '📚', label: 'My Courses', onClick: () => setPage('courses'), isActive: page === 'courses' },
      ]
    },
    {
      label: 'Content',
      items: [
        { icon: '🔧', label: 'Course Builder', onClick: () => setPage('builder'), isActive: page === 'builder' },
      ]
    },
    {
      label: 'Assessment',
      items: [
        { icon: '✏️', label: 'Grading', onClick: () => setPage('grading'), isActive: page === 'grading', badge: pending.length > 0 ? pending.length : null },
        { icon: '🔔', label: 'Notifications', onClick: () => setPage('notifications'), isActive: page === 'notifications', badge: unreadCount > 0 ? unreadCount : null },
        { icon: '👤', label: 'Profile', onClick: openProfile, isActive: false },
        { icon: '🚪', label: 'Logout', onClick: logout, isActive: false },
      ]
    }
  ];

  // ─────────────────────────────────────────────────────────
  return (
    <div style={appShell}>
      {/* Sidebar */}
      <div style={sidebar}>
        {/* Logo */}
        <div style={sidebarLogo}>
          <div style={logoBadge}>
            <div style={logoIcon}>S</div>
            <div>
              <div style={logoText}>SILS</div>
              <span style={logoSub}>Instructor</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {navSections.map((section, idx) => (
          <div key={idx} style={navSection}>
            <p style={navLabel}>{section.label}</p>
            {section.items.map((item, jdx) => (
              <button
                key={jdx}
                onClick={item.onClick}
                style={{ ...navItem, ...(item.isActive ? navItemActive : {}) }}
              >
                <span style={navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span style={navBadge}>{item.badge}</span>}
              </button>
            ))}
          </div>
        ))}

        {/* Footer */}
        <div style={sidebarFooter}>
          <div style={userCard}>
            <div style={avatar}>I</div>
            <div style={userInfo}>
              <div style={userName}>{user?.username || 'Instructor'}</div>
              <div style={userRole}>Instructor</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={main}>
        {/* Topbar */}
        <div style={topbar}>
          <h1 style={pageTitle}>
            {page === 'dashboard' && '📊 Dashboard'}
            {page === 'courses' && '📚 My Courses'}
            {page === 'builder' && selectedCourse && `🔧 ${selectedCourse.title}`}
            {page === 'grading' && '✏️ Grading'}
            {page === 'notifications' && '🔔 Notifications'}
          </h1>
          <div style={topbarRight}>
            <div style={searchBox}>
              <span style={{ fontSize: 14, color: theme.textMuted }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                style={searchInput}
              />
            </div>
            <button style={iconBtn}>
              🔔
              {unreadCount > 0 && <span style={notifDot}></span>}
            </button>
            <div style={miniAvatar}>I</div>
          </div>
        </div>

        {/* Content */}
        <div style={content}>
          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && dashboard && (
            <div>
              <div style={statsGrid}>
                <StatCard label="My Courses" value={dashboard.totalCourses} tone="blue" />
                <StatCard label="Total Students" value={dashboard.totalStudents} tone="purple" />
                <StatCard label="Total Quizzes" value={dashboard.totalQuizzes} tone="green" />
                <StatCard label="Pending Grading" value={dashboard.pendingGrading} tone="orange" />
              </div>

              <div style={card}>
                <div style={cardHeader}>
                  <h3 style={cardTitle}>📋 Recent Submissions</h3>
                </div>
                {dashboard.recentSubmissions.length === 0
                  ? <p style={{ color: theme.textMuted }}>No submissions yet.</p>
                  : <table style={table}>
                    <thead><tr>{['Student', 'Quiz', 'Score', 'Status', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {dashboard.recentSubmissions.map(s => (
                        <tr key={s.quiz_attempt_id}>
                          <td style={td}>{s.student_name}</td>
                          <td style={td}>{s.quiz_title}</td>
                          <td style={td}>{s.score != null ? `${parseFloat(s.score).toFixed(1)}%` : '—'}</td>
                          <td style={td}><span style={statusBadge(s.status)}>{s.status}</span></td>
                          <td style={td}>{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                }
              </div>
            </div>
          )}

          {/* ── COURSES ── */}
          {page === 'courses' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>My Courses</h3>
                <button style={btnPrimary} onClick={() => { setEditingCourse(null); setCourseForm(blankCourse); setShowCourseModal(true); }}>
                  + New Course
                </button>
              </div>
              {courses.length === 0
                ? <p style={{ color: theme.textMuted }}>No courses yet. Create your first course!</p>
                : <div style={courseGrid}>
                  {courses.map(c => (
                    <div key={c.course_id} style={courseCard}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: theme.text }}>{c.title}</div>
                      <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 8 }}>
                        👥 {c.enrolled_count} students
                      </div>
                      <span style={statusBadge(c.status)}>{c.status}</span>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button style={btnPrimary} onClick={() => openCourse(c)}>Open</button>
                        <button style={btnSmall} onClick={() => { setEditingCourse(c); setCourseForm({ title: c.title, description: c.description || '', status: c.status }); setShowCourseModal(true); }}>Edit</button>
                        {c.status !== 'archived' &&
                          <button style={{ ...btnSmall, background: theme.accent4 }} onClick={() => archiveCourse(c.course_id)}>Archive</button>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          )}

          {/* ── COURSE BUILDER ── */}
          {page === 'builder' && (
            !selectedCourse
              ? <div style={card}><p style={{ color: theme.textMuted }}>Select a course from My Courses to open the builder.</p></div>
              : <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Modules panel */}
                  <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, color: theme.text }}>📖 Modules & Lessons</h4>
                      <button style={btnPrimary} onClick={() => { setModuleForm(blankModule); setShowModuleModal(true); }}>
                        + Module
                      </button>
                    </div>
                    {modules.length === 0
                      ? <p style={{ color: theme.textMuted, fontSize: 13 }}>No modules yet.</p>
                      : modules.map(mod => (
                        <div key={mod.module_id} style={{ marginBottom: 16, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, overflow: 'hidden' }}>
                          <div style={{ background: theme.surface2, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>{mod.title}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button style={btnSmall} onClick={() => { setSelectedModule(mod); setLessonForm(blankLesson); setShowLessonModal(true); }}>
                                + Lesson
                              </button>
                              <button style={{ ...btnSmall, background: theme.accent5 }} onClick={() => deleteModule(mod.module_id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                          {mod.lessons?.map(l => (
                            <div key={l.lesson_id} style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${theme.border}`, color: theme.text }}>
                              <div>
                                <span style={{ fontSize: 14 }}>
                                  {l.content_type === 'video' ? '🎬' : l.content_type === 'pdf' ? '📄' : '📝'} {l.title}
                                </span>
                                {l.duration_minutes && <span style={{ fontSize: 12, color: theme.textMuted, marginLeft: 6 }}>{l.duration_minutes}min</span>}
                              </div>
                              <button style={{ ...btnSmall, background: theme.accent5 }} onClick={() => deleteLesson(l.lesson_id)}>✕</button>
                            </div>
                          ))}
                        </div>
                      ))
                    }
                  </div>

                  {/* Quizzes panel */}
                  <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, color: theme.text }}>📝 Quizzes</h4>
                      <button style={btnPrimary} onClick={() => { setEditingQuiz(null); setQuizForm(blankQuiz); setShowQuizModal(true); }}>
                        + Quiz
                      </button>
                    </div>
                    {quizzes.length === 0
                      ? <p style={{ color: theme.textMuted, fontSize: 13 }}>No quizzes yet.</p>
                      : quizzes.map(q => (
                        <div key={q.quiz_id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{q.title}</div>
                              <div style={{ fontSize: 12, color: theme.textMuted }}>
                                {q.question_count} questions · {q.attempt_count} attempts
                              </div>
                              <span style={statusBadge(q.status)}>{q.status}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end' }}>
                              <button style={btnSmall} onClick={() => openQuiz(q)}>Questions</button>
                              <button style={btnSmall} onClick={() => { setEditingQuiz(q); setQuizForm({ title: q.title, description: q.description || '', due_date: q.due_date ? q.due_date.slice(0, 16) : '', time_limit_minutes: q.time_limit_minutes || '', max_attempts: q.max_attempts, randomize_questions: q.randomize_questions, submission_type: q.submission_type, status: q.status }); setShowQuizModal(true); }}>Edit</button>
                              <button style={{ ...btnSmall, background: theme.accent5 }} onClick={() => deleteQuiz(q.quiz_id)}>Delete</button>
                            </div>
                          </div>

                          {/* Questions inline */}
                          {selectedQuiz?.quiz_id === q.quiz_id && (
                            <div style={{ marginTop: 10, padding: 10, background: theme.surface2, borderRadius: theme.radiusSm }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>Questions ({questions.length})</span>
                                <button style={{ ...btnSmall, fontSize: 11 }} onClick={() => { setQForm(blankQ); setShowQModal(true); }}>+ Add</button>
                              </div>
                              {questions.map((qs, i) => (
                                <div key={qs.question_id} style={{ fontSize: 13, padding: '6px 0', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', color: theme.text }}>
                                  <div>
                                    <span style={{ color: theme.textMuted }}>Q{i + 1}.</span> {qs.question_text}
                                    <span style={{ fontSize: 11, color: theme.accent, marginLeft: 6 }}>[{qs.question_type}]</span>
                                  </div>
                                  <button style={{ ...btnSmall, background: theme.accent5, padding: '2px 6px' }} onClick={() => deleteQuestion(qs.question_id)}>✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>

                  {/* Students panel */}
                  <div style={{ ...card, gridColumn: '1/-1' }}>
                    <h4 style={{ marginTop: 0, color: theme.text }}>👥 Enrolled Students</h4>
                    {students.length === 0
                      ? <p style={{ color: theme.textMuted, fontSize: 13 }}>No enrolled students yet.</p>
                      : <table style={table}>
                        <thead><tr>{['Student', 'Email', 'Progress', 'Avg Score', 'Quizzes', 'Risk'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {students.map(s => (
                            <tr key={s.user_id}>
                              <td style={td}>{s.username}</td>
                              <td style={td}>{s.email}</td>
                              <td style={td}>
                                <div style={{ background: theme.surface2, borderRadius: 99, height: 6, width: 100 }}>
                                  <div style={{ background: theme.accent, height: 6, borderRadius: 99, width: `${s.completion_percent}%` }} />
                                </div>
                                <span style={{ fontSize: 12, color: theme.textMuted }}>{s.completion_percent}%</span>
                              </td>
                              <td style={td}>
                                <span style={{ fontWeight: 700, color: s.avg_score >= 70 ? theme.accent3 : s.avg_score >= 50 ? theme.accent4 : theme.accent5 }}>
                                  {parseFloat(s.avg_score).toFixed(1)}%
                                </span>
                              </td>
                              <td style={td}>{s.quizzes_taken}</td>
                              <td style={td}>
                                {s.is_at_risk
                                  ? <span style={{ color: theme.accent5, fontWeight: 700 }}>⚠️ At Risk</span>
                                  : <span style={{ color: theme.accent3 }}>✅ OK</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    }
                  </div>

                  {/* Analytics */}
                  {analytics && (
                    <div style={{ ...card, gridColumn: '1/-1' }}>
                      <h4 style={{ marginTop: 0, color: theme.text }}>📊 Course Analytics</h4>
                      <div style={statsGrid}>
                        <StatCard label="Completed" value={analytics.completed} tone="green" />
                        <StatCard label="Total Enrolled" value={analytics.total} tone="blue" />
                        <StatCard label="Completion Rate"
                          value={analytics.total > 0 ? `${Math.round(analytics.completed / analytics.total * 100)}%` : '0%'}
                          tone="purple" />
                      </div>
                      <table style={table}>
                        <thead><tr>{['Quiz', 'Avg Score', 'Attempts'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                          {analytics.quizStats.map((q, i) => (
                            <tr key={i}>
                              <td style={td}>{q.title}</td>
                              <td style={td}>
                                <span style={{ fontWeight: 700, color: q.avg_score >= 70 ? theme.accent3 : q.avg_score >= 50 ? theme.accent4 : theme.accent5 }}>
                                  {parseFloat(q.avg_score).toFixed(1)}%
                                </span>
                              </td>
                              <td style={td}>{q.attempts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
          )}

          {/* ── GRADING ── */}
          {page === 'grading' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>✏️ Pending Submissions</h3>
              </div>
              {pending.length === 0
                ? <p style={{ color: theme.textMuted }}>No pending submissions.</p>
                : <table style={table}>
                  <thead><tr>{['Student', 'Quiz', 'Course', 'Submitted', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {pending.map(p => (
                      <tr key={p.quiz_attempt_id}>
                        <td style={td}>{p.student_name}</td>
                        <td style={td}>{p.quiz_title}</td>
                        <td style={td}>{p.course_title}</td>
                        <td style={td}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={td}>
                          <button style={btnPrimary} onClick={() => openGrade(p)}>Grade</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {page === 'notifications' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>🔔 Notifications</h3>
              </div>
              {notifications.length === 0
                ? <p style={{ color: theme.textMuted }}>No notifications.</p>
                : notifications.map(n => (
                  <div key={n.notification_id} style={{
                    padding: '12px 16px', borderRadius: theme.radiusSm, marginBottom: 8,
                    background: n.is_read ? theme.surface2 : 'rgba(108,143,255,0.08)',
                    border: `1px solid ${n.is_read ? theme.border : theme.accent}40`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 14, color: theme.text }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 4 }}>{n.message}</div>
                    {!n.is_read && <button style={{ ...btnSmall, marginTop: 8 }} onClick={() => markRead(n.notification_id)}>Mark Read</button>}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <Modal title={editingCourse ? 'Edit Course' : 'New Course'} onClose={() => setShowCourseModal(false)}>
          {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={formLabel}>{f.label}</label>
              {f.key === 'description'
                ? <textarea style={{ ...formInput, height: 80 }} value={courseForm[f.key]} onChange={e => setCourseForm({ ...courseForm, [f.key]: e.target.value })} />
                : <input style={formInput} value={courseForm[f.key]} onChange={e => setCourseForm({ ...courseForm, [f.key]: e.target.value })} />
              }
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Status</label>
            <select style={formInput} value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}>
              {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveCourse}>
            {editingCourse ? 'Update' : 'Create'} Course
          </button>
        </Modal>
      )}

      {/* ── MODULE MODAL ── */}
      {showModuleModal && (
        <Modal title="Add Module" onClose={() => setShowModuleModal(false)}>
          {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={moduleForm[f.key]} onChange={e => setModuleForm({ ...moduleForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveModule}>Add Module</button>
        </Modal>
      )}

      {/* ── LESSON MODAL ── */}
      {showLessonModal && (
        <Modal title="Add Lesson" onClose={() => setShowLessonModal(false)}>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Title</label>
            <input style={formInput} value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Content Type</label>
            <select style={formInput} value={lessonForm.content_type} onChange={e => setLessonForm({ ...lessonForm, content_type: e.target.value })}>
              {['text', 'video', 'pdf', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(lessonForm.content_type === 'video' || lessonForm.content_type === 'pdf') && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Content URL</label>
              <input style={formInput} value={lessonForm.content_url} onChange={e => setLessonForm({ ...lessonForm, content_url: e.target.value })} placeholder="https://..." />
            </div>
          )}
          {lessonForm.content_type === 'text' && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Content Text</label>
              <textarea style={{ ...formInput, height: 100 }} value={lessonForm.content_text} onChange={e => setLessonForm({ ...lessonForm, content_text: e.target.value })} />
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Duration (minutes)</label>
            <input style={formInput} type="number" value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })} />
          </div>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveLesson}>Add Lesson</button>
        </Modal>
      )}

      {/* ── QUIZ MODAL ── */}
      {showQuizModal && (
        <Modal title={editingQuiz ? 'Edit Quiz' : 'New Quiz'} onClose={() => setShowQuizModal(false)}>
          {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={quizForm[f.key]} onChange={e => setQuizForm({ ...quizForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={formLabel}>Due Date</label>
              <input style={formInput} type="datetime-local" value={quizForm.due_date} onChange={e => setQuizForm({ ...quizForm, due_date: e.target.value })} />
            </div>
            <div>
              <label style={formLabel}>Time Limit (mins)</label>
              <input style={formInput} type="number" value={quizForm.time_limit_minutes} onChange={e => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} />
            </div>
            <div>
              <label style={formLabel}>Max Attempts</label>
              <input style={formInput} type="number" min="1" value={quizForm.max_attempts} onChange={e => setQuizForm({ ...quizForm, max_attempts: e.target.value })} />
            </div>
            <div>
              <label style={formLabel}>Submission Type</label>
              <select style={formInput} value={quizForm.submission_type} onChange={e => setQuizForm({ ...quizForm, submission_type: e.target.value })}>
                {['online_quiz', 'file_upload', 'mixed'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Status</label>
            <select style={formInput} value={quizForm.status} onChange={e => setQuizForm({ ...quizForm, status: e.target.value })}>
              {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14, color: theme.text }}>
            <input type="checkbox" checked={quizForm.randomize_questions}
              onChange={e => setQuizForm({ ...quizForm, randomize_questions: e.target.checked })} />
            Randomize Questions
          </label>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveQuiz}>
            {editingQuiz ? 'Update' : 'Create'} Quiz
          </button>
        </Modal>
      )}

      {/* ── QUESTION MODAL ── */}
      {showQModal && (
        <Modal title="Add Question" onClose={() => setShowQModal(false)} wide>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Question Type</label>
            <select style={formInput} value={qForm.question_type} onChange={e => setQForm({ ...qForm, question_type: e.target.value })}>
              {['mcq', 'fill_blank', 'short_answer'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Question Text</label>
            <textarea style={{ ...formInput, height: 80 }} value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })} />
          </div>
          {qForm.question_type === 'mcq' && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Options (one per line)</label>
              {qForm.options.map((opt, i) => (
                <input key={i} style={{ ...formInput, marginBottom: 6 }} value={opt}
                  placeholder={`Option ${i + 1}`}
                  onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} />
              ))}
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Correct Answer</label>
            <input style={formInput} value={qForm.correct_answer} onChange={e => setQForm({ ...qForm, correct_answer: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={formLabel}>Points</label>
              <input style={formInput} type="number" min="1" value={qForm.points} onChange={e => setQForm({ ...qForm, points: e.target.value })} />
            </div>
            <div>
              <label style={formLabel}>Improvement Tip</label>
              <input style={formInput} value={qForm.improvement_tip} onChange={e => setQForm({ ...qForm, improvement_tip: e.target.value })} placeholder="Hint for wrong answers" />
            </div>
          </div>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveQuestion}>Add Question</button>
        </Modal>
      )}

      {/* ── GRADE MODAL ── */}
      {showGradeModal && gradingItem && (
        <Modal title="Grade Submission" onClose={() => setShowGradeModal(false)}>
          <div style={{ background: theme.surface2, padding: 12, borderRadius: theme.radiusSm, marginBottom: 16, fontSize: 14, color: theme.text }}>
            <div><strong>Student:</strong> {gradingItem.student_name}</div>
            <div><strong>Quiz:</strong> {gradingItem.quiz_title}</div>
            <div><strong>Course:</strong> {gradingItem.course_title}</div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Score (0–100)</label>
            <input style={formInput} type="number" min="0" max="100"
              value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={formLabel}>Feedback / Comments</label>
            <textarea style={{ ...formInput, height: 80 }} value={gradeForm.feedback}
              onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              placeholder="Optional written feedback for the student..." />
          </div>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveGrade}>Submit Grade</button>
        </Modal>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={() => setShowProfileModal(false)}>
          {[
            { label: 'Username', key: 'username' },
            { label: 'Phone Number', key: 'phone_number' },
            { label: 'Department', key: 'department' },
            { label: 'Specialization', key: 'specialization' },
            { label: 'Subjects Taught', key: 'subjects_taught' },
            { label: 'Office Hours', key: 'office_hours' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={profileForm[f.key] || ''}
                onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveProfile}>Save Profile</button>
        </Modal>
      )}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────
const appShell = { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: theme.bg, color: theme.text };
const sidebar = { width: 240, minWidth: 240, background: theme.surface, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', height: '100vh', zIndex: 100, overflowY: 'auto' };
const sidebarLogo = { padding: '0 24px 28px', borderBottom: `1px solid ${theme.border}`, marginBottom: 20 };
const logoBadge = { display: 'inline-flex', alignItems: 'center', gap: 10 };
const logoIcon = { width: 36, height: 36, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 };
const logoText = { fontFamily: "'DM Serif Display', serif", fontSize: 18, color: theme.text, letterSpacing: -0.3 };
const logoSub = { fontSize: 10, color: theme.textMuted, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginTop: 1 };
const navSection = { padding: '0 12px', marginBottom: 8 };
const navLabel = { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: theme.textDim, padding: '8px 12px', marginBottom: 4 };
const navItem = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: theme.radiusSm, color: theme.textMuted, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s ease', background: 'none', border: 'none', width: '100%', textAlign: 'left' };
const navItemActive = { background: 'linear-gradient(135deg, rgba(108,143,255,0.15), rgba(167,139,250,0.1))', color: theme.accent, fontWeight: 500 };
const navIcon = { width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const navBadge = { marginLeft: 'auto', background: theme.accent5, color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 20, minWidth: 18, textAlign: 'center' };
const sidebarFooter = { marginTop: 'auto', padding: '20px 12px 0', borderTop: `1px solid ${theme.border}` };
const userCard = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: theme.radiusSm, cursor: 'pointer', transition: 'background 0.15s', background: theme.surface2 };
const avatar = { width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 };
const userInfo = { flex: 1, minWidth: 0 };
const userName = { fontSize: 13, fontWeight: 500, color: theme.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const userRole = { fontSize: 11, color: theme.textMuted };
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' };
const topbar = { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px', borderBottom: `1px solid ${theme.border}`, background: theme.bg, position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' };
const pageTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: theme.text, letterSpacing: -0.3, margin: 0 };
const topbarRight = { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 };
const searchBox = { display: 'flex', alignItems: 'center', gap: 8, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '8px 14px', width: 240 };
const searchInput = { background: 'none', border: 'none', outline: 'none', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, width: '100%' };
const iconBtn = { width: 38, height: 38, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: theme.textMuted };
const notifDot = { position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: theme.accent5, borderRadius: '50%', border: `2px solid ${theme.bg}` };
const miniAvatar = { width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' };
const content = { padding: '28px 32px', flex: 1 };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 };
const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 22, marginBottom: 28 };
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 };
const cardTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: theme.text, margin: 0 };
const courseGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 };
const courseCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease' };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th = { textAlign: 'left', padding: '10px 12px', color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, borderBottom: `1px solid ${theme.border}` };
const td = { padding: '10px 12px', borderTop: `1px solid ${theme.border}`, color: theme.text };
const btnPrimary = { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', border: 'none', borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnSmall = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500, marginRight: 4 };
const alertBox = { padding: '10px 14px', borderRadius: theme.radiusSm, marginBottom: 14, fontSize: 13, border: `1px solid ${theme.border}` };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalBox = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 28, width: '100%', maxHeight: '90vh', overflowY: 'auto' };
const closeBtn = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textMuted };
const formLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6, letterSpacing: 0.5 };
const formInput = { width: '100%', background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '10px 14px', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const statCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 20, position: 'relative', overflow: 'hidden' };
const statusBadge = (s) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
  background: { draft: 'rgba(249,115,22,0.1)', published: 'rgba(52,211,153,0.1)', archived: 'rgba(122,127,148,0.1)', graded: 'rgba(52,211,153,0.1)', submitted: 'rgba(249,115,22,0.1)', in_progress: 'rgba(108,143,255,0.1)' }[s] || theme.surface2,
  color: { draft: theme.accent4, published: theme.accent3, archived: theme.textMuted, graded: theme.accent3, submitted: theme.accent4, in_progress: theme.accent }[s] || theme.textMuted
});
