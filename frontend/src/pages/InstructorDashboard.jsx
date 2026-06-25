import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  instrGetDashboard, instrGetProfile, instrUpdateProfile,
  instrGetCourses, instrCreateCourse, instrUpdateCourse, instrDeleteCourse,
  instrGetModules, instrCreateModule, instrDeleteModule,
  instrCreateLesson, instrDeleteLesson,
  instrGetQuizzes, instrCreateQuiz, instrUpdateQuiz, instrDeleteQuiz,
  instrGetQuestions, instrAddQuestion, instrDeleteQuestion,
  instrGetFeedback, instrAddFeedback, instrUpdateFeedback, instrDeleteFeedback,
  instrGetStudents, instrGetPending, instrGradeSubmission,
  instrGetAnalytics, instrGetNotifications, instrMarkRead
} from '../services/api';

/* ════════════════════════════════════════════════════════════
   DESIGN TOKENS
   Instructor variant of the warm paper / ledger aesthetic.
   Brass is the primary accent (scholarly, authoritative).
   ════════════════════════════════════════════════════════════ */
const token = {
  paper:      '#F6F4EE',
  surface:    '#FFFFFF',
  surface2:   '#F1E6D2',
  surface3:   '#E7E2D5',
  line:       '#E7E2D5',
  ink:        '#1C2541',
  inkSoft:    '#5B6478',
  inkFaint:   '#94A0B4',
  brass:      '#A9792C',
  brassSoft:  '#F1E6D2',
  brassDeep:  '#7C5A1E',
  danger:     '#B3261E',
  dangerSoft: '#FBEAE9',
  warn:       '#92400E',
  warnSoft:   '#FDF1DF',
  good:       '#1F7A4D',
  goodSoft:   '#E7F5EE',
  info:       '#2454A6',
  infoSoft:   '#EAF1FB',
  accent:     '#A9792C',
  accent2:    '#2454A6',
  accent3:    '#1F7A4D',
  accent4:    '#92400E',
  accent5:    '#B3261E',
};

const fontDisplay = "'Lora', Georgia, serif";
const fontBody    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono    = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

/* ── GlobalStyle: inject fonts + CSS-only features (hover, focus-rings,
     scrollbars, keyframes, responsive breakpoint)                  ── */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .ins-root * { box-sizing: border-box; }
      .ins-root { font-family: ${fontBody}; }

      .ins-nav-item { transition: background-color .15s ease, color .15s ease; position: relative; }
      .ins-nav-item:hover { background: ${token.brassSoft}; color: ${token.ink}; }
      .ins-nav-item.active {
        background: ${token.brassSoft};
        color: ${token.brass};
        font-weight: 600;
      }
      .ins-nav-item.active::before {
        content: ''; position: absolute; left: -12px; top: 4px; bottom: 4px; width: 3px;
        background: ${token.brass}; border-radius: 2px;
      }

      .ins-btn { transition: filter .15s ease, transform .1s ease; }
      .ins-btn:hover { filter: brightness(0.95); }
      .ins-btn:active { transform: translateY(1px); }
      .ins-btn:focus-visible, .ins-input:focus-visible, .ins-select:focus-visible {
        outline: 2px solid ${token.brass}; outline-offset: 2px;
      }

      .ins-card { animation: ins-rise .22s ease both; }
      @keyframes ins-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      .ins-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .ins-scroll::-webkit-scrollbar-thumb { background: ${token.line}; border-radius: 8px; }

      .ins-table-row { transition: background-color .12s ease; }
      .ins-table-row:hover td { background: ${token.paper} !important; }

      @media (prefers-reduced-motion: reduce) {
        .ins-card, .ins-nav-item, .ins-btn { animation: none; transition: none; }
      }
    `}</style>
  );
}

// ─── Reusable Components ───────────────────────────────────

function Badge({ count }) {
  if (!count) return null;
  return (
    <span style={{
      background: token.danger, color: '#fff', fontSize: 10, fontWeight: 700,
      borderRadius: 99, padding: '1px 6px', minWidth: 18, textAlign: 'center',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

function StatCard({ label, value, mono }) {
  return (
    <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, fontFamily: fontBody }}>
        {label}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: mono ? fontMono : fontDisplay, lineHeight: 1 }}>
        {value ?? '—'}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    draft:       { bg: token.warnSoft,   color: token.warn },
    published:   { bg: token.goodSoft,    color: token.good },
    archived:    { bg: token.surface3,    color: token.inkSoft },
    graded:      { bg: token.goodSoft,    color: token.good },
    submitted:   { bg: token.warnSoft,    color: token.warn },
    in_progress: { bg: token.infoSoft,    color: token.info },
    expired:     { bg: token.dangerSoft, color: token.danger },
  };
  const s = map[status] || { bg: token.surface3, color: token.inkSoft };
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(28,37,65,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{
        background: token.surface, borderRadius: token.radius, padding: 28, width: '100%',
        maxWidth: wide ? 700 : 520, maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(28,37,65,0.2)',
        border: `1px solid ${token.line}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${token.line}` }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, color: token.ink, fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: token.inkFaint, padding: 4, lineHeight: 1 }} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [alert, setAlert] = useState({ msg: '', type: '' });

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
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [gradingItem, setGradingItem] = useState(null);

  // Forms
  const blankCourse   = { title: '', description: '', status: 'draft' };
  const blankModule  = { title: '', description: '' };
  const blankLesson  = { title: '', content_type: 'text', content_url: '', content_text: '', duration_minutes: '' };
  const blankQuiz    = { title: '', description: '', due_date: '', time_limit_minutes: '', max_attempts: 1, randomize_questions: false, submission_type: 'online_quiz', status: 'draft' };
  const blankQ       = { question_type: 'mcq', question_text: '', options: ['', '', '', ''], correct_answer: '', points: 1, improvement_tip: '' };
  const blankGrade   = { score: '', feedback: '' };
  const blankProfile = { username: '', phone_number: '', department: '', specialization: '', subjects_taught: '', office_hours: '' };
  const blankFeedback= { min_score: '', max_score: '', feedback_message: '' };

  const [courseForm, setCourseForm]   = useState(blankCourse);
  const [moduleForm, setModuleForm] = useState(blankModule);
  const [lessonForm, setLessonForm]   = useState(blankLesson);
  const [quizForm, setQuizForm]       = useState(blankQuiz);
  const [qForm, setQForm]             = useState(blankQ);
  const [gradeForm, setGradeForm]     = useState(blankGrade);
  const [profileForm, setProfileForm]  = useState(blankProfile);
  const [feedbackForm, setFeedbackForm]= useState(blankFeedback);
  const [photoFile, setPhotoFile]     = useState(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 4000);
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
      instrGetQuizzes(course.course_id),
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
    const [qRes, fbRes] = await Promise.all([
      instrGetQuestions(quiz.quiz_id),
      instrGetFeedback(quiz.quiz_id),
    ]);
    setQuestions(qRes.data);
    setFeedbackBands(fbRes.data.feedback);
    setFeedbackWarning(fbRes.data.alreadyAttempted);
  };

  // ── COURSE CRUD ──
  const saveCourse = async () => {
    try {
      if (editingCourse) {
        await instrUpdateCourse(editingCourse.course_id, courseForm);
        showAlert('Course updated.');
      } else {
        await instrCreateCourse(courseForm);
        showAlert('Course created.');
      }
      setShowCourseModal(false);
      instrGetCourses().then(r => setCourses(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try {
      await instrDeleteCourse(id);
      showAlert('Course archived.');
      instrGetCourses().then(r => setCourses(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── MODULE CRUD ──
  const saveModule = async () => {
    try {
      await instrCreateModule(selectedCourse.course_id, moduleForm);
      showAlert('Module added.');
      setShowModuleModal(false);
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

  // ── LESSON CRUD ──
  const saveLesson = async () => {
    try {
      await instrCreateLesson(selectedModule.module_id, lessonForm);
      showAlert('Lesson added.');
      setShowLessonModal(false);
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await instrDeleteLesson(lessonId);
      showAlert('Lesson deleted.');
      instrGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── QUIZ CRUD ──
  const saveQuiz = async () => {
    try {
      if (editingQuiz) {
        await instrUpdateQuiz(editingQuiz.quiz_id, quizForm);
        showAlert('Quiz updated.');
      } else {
        await instrCreateQuiz(selectedCourse.course_id, quizForm);
        showAlert('Quiz created.');
      }
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
      showAlert('Question added.');
      setShowQModal(false);
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await instrDeleteQuestion(questionId);
      showAlert('Question deleted.');
      instrGetQuestions(selectedQuiz.quiz_id).then(r => setQuestions(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── QUIZ FEEDBACK CRUD ──
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
      if (editingFeedback) {
        await instrUpdateFeedback(editingFeedback.quiz_feedback_id, feedbackForm);
        showAlert('Feedback band updated.');
      } else {
        await instrAddFeedback(selectedQuiz.quiz_id, feedbackForm);
        showAlert('Feedback band added.');
      }
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

  // ── GRADING ──
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

  // ── PROFILE ──
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
      await instrUpdateProfile(fd);
      showAlert('Profile updated.');
      setShowProfileModal(false);
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const markRead = async (id) => {
    await instrMarkRead(id);
    instrGetNotifications().then(r => setNotifications(r.data));
  };

  // Nav items
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

  const S = (k) => ({ '--token': token })[k];

  // ─────────────────────────────────────────────────────────
  return (
    <div className="ins-root" style={{ display: 'flex', minHeight: '100vh', background: token.paper, fontFamily: fontBody }}>
      <GlobalStyle />

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 240, minWidth: 240, background: token.surface,
        borderRight: `2px solid ${token.brassSoft}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', zIndex: 100, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `1px solid ${token.line}`, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, background: `linear-gradient(135deg, ${token.brass}, ${token.brassDeep})`,
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#fff', fontFamily: fontDisplay, fontWeight: 700, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(169,121,44,0.3)',
            }}>S</div>
            <div>
              <div style={{ fontFamily: fontDisplay, fontSize: 17, color: token.ink, letterSpacing: -0.3, lineHeight: 1.2 }}>SILS</div>
              <div style={{ fontSize: 9, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>Instructor</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`ins-nav-item${page === item.key ? ' active' : ''}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: page === item.key ? 600 : 400,
                background: 'none', border: 'none', width: '100%', textAlign: 'left',
                color: page === item.key ? token.brass : token.inkSoft,
              }}
            >
              <span style={{ fontSize: 16, flexShrink: 0, color: 'inherit', opacity: 0.7 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <Badge count={item.badge} />
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 12px 20px', borderTop: `1px solid ${token.line}` }}>
          <button onClick={openProfile} className="ins-nav-item"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: 'none', border: 'none', width: '100%', textAlign: 'left', color: token.inkSoft, marginBottom: 4 }}>
            <span style={{ fontSize: 16, opacity: 0.7 }}>◈</span> My Profile
          </button>
          <button onClick={logout} className="ins-nav-item"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: 'none', border: 'none', width: '100%', textAlign: 'left', color: token.danger }}>
            <span style={{ fontSize: 16, opacity: 0.7 }}>⏻</span> Logout
          </button>
          <div style={{ marginTop: 14, padding: '10px 12px', background: token.surface2, borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: token.ink }}>{user?.username || 'Instructor'}</div>
            <div style={{ fontSize: 11, color: token.brass }}>Instructor</div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* Topbar */}
        <div style={{
          background: token.paper, borderBottom: `1px solid ${token.line}`,
          padding: '18px 32px', position: 'sticky', top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <h1 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 22, color: token.ink, letterSpacing: -0.3 }}>
            {pageTitle}
          </h1>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            {unreadCount > 0 && (
              <button
                onClick={() => setPage('notifications')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', fontSize: 18, color: token.inkSoft, padding: 4 }}
                title="Notifications"
              >
                ◩
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  width: 8, height: 8, background: token.danger, borderRadius: '50%',
                  border: `2px solid ${token.paper}`,
                }} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 32px', flex: 1 }} className="ins-scroll">

          {/* Alert */}
          {alert.msg && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 500,
              background: alert.type === 'error' ? token.dangerSoft : token.goodSoft,
              color: alert.type === 'error' ? token.danger : token.good,
              border: `1px solid ${alert.type === 'error' ? token.danger : token.good}30`,
            }}>
              {alert.msg}
            </div>
          )}

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && dashboard && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
                <StatCard label="My Courses" value={dashboard.totalCourses} />
                <StatCard label="Total Students" value={dashboard.totalStudents} />
                <StatCard label="Total Quizzes" value={dashboard.totalQuizzes} />
                <StatCard label="Pending Grading" value={dashboard.pendingGrading} />
              </div>

              <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 24 }}>
                <h3 style={{ margin: '0 0 20px 0', fontFamily: fontDisplay, fontSize: 18, color: token.ink }}>Recent Submissions</h3>
                {dashboard.recentSubmissions.length === 0
                  ? <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>No submissions yet.</p>
                  : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr>
                            {['Student', 'Quiz', 'Score', 'Status', 'Date'].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}`, fontFamily: fontBody }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.recentSubmissions.map(s => (
                            <tr key={s.quiz_attempt_id} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                              <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{s.student_name}</td>
                              <td style={{ padding: '10px 12px', color: token.inkSoft }}>{s.quiz_title}</td>
                              <td style={{ padding: '10px 12px', fontFamily: fontMono, fontWeight: 600, color: s.score != null ? token.brass : token.inkFaint }}>
                                {s.score != null ? `${parseFloat(s.score).toFixed(1)}%` : '—'}
                              </td>
                              <td style={{ padding: '10px 12px' }}><StatusBadge status={s.status} /></td>
                              <td style={{ padding: '10px 12px', color: token.inkSoft, fontFamily: fontMono, fontSize: 12 }}>
                                {new Date(s.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ── COURSES ── */}
          {page === 'courses' && (
            <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 18, color: token.ink }}>My Courses</h3>
                <button className="ins-btn" onClick={() => { setEditingCourse(null); setCourseForm(blankCourse); setShowCourseModal(true); }}
                  style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: fontBody }}>
                  + New Course
                </button>
              </div>
              {courses.length === 0
                ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No courses yet. Create your first course!</p>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {courses.map(c => (
                      <div key={c.course_id} style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 10, padding: 18, borderTop: `3px solid ${token.brassSoft}` }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: token.ink, marginBottom: 6, fontFamily: fontDisplay }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: token.inkSoft, marginBottom: 10 }}>
                          {c.enrolled_count} enrolled student{c.enrolled_count !== 1 ? 's' : ''}
                        </div>
                        <div style={{ marginBottom: 12 }}><StatusBadge status={c.status} /></div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="ins-btn" onClick={() => openCourse(c)}
                            style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            Open
                          </button>
                          <button className="ins-btn" onClick={() => { setEditingCourse(c); setCourseForm({ title: c.title, description: c.description || '', status: c.status }); setShowCourseModal(true); }}
                            style={{ background: token.surface2, color: token.ink, border: `1px solid ${token.line}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                            Edit
                          </button>
                          {c.status !== 'archived' && (
                            <button className="ins-btn" onClick={() => archiveCourse(c.course_id)}
                              style={{ background: token.dangerSoft, color: token.danger, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
          )}

          {/* ── COURSE BUILDER ── */}
          {page === 'builder' && (
            !selectedCourse
              ? <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 24 }}>
                  <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>Select a course from My Courses to open the builder.</p>
                </div>
              : <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                  {/* Modules */}
                  <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 16, color: token.ink }}>Modules & Lessons</h4>
                      <button className="ins-btn" onClick={() => { setModuleForm(blankModule); setShowModuleModal(true); }}
                        style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        + Module
                      </button>
                    </div>
                    {modules.length === 0
                      ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No modules yet.</p>
                      : modules.map(mod => (
                        <div key={mod.module_id} style={{ marginBottom: 14, border: `1px solid ${token.line}`, borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ background: token.surface2, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: token.ink }}>{mod.title}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="ins-btn" onClick={() => { setSelectedModule(mod); setLessonForm(blankLesson); setShowLessonModal(true); }}
                                style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                + Lesson
                              </button>
                              <button className="ins-btn" onClick={() => deleteModule(mod.module_id)}
                                style={{ background: token.dangerSoft, color: token.danger, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>
                                Del
                              </button>
                            </div>
                          </div>
                          {(mod.lessons || []).map(l => (
                            <div key={l.lesson_id} style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${token.line}`, color: token.ink, fontSize: 13 }}>
                              <div>
                                <span style={{ marginRight: 6, opacity: 0.5 }}>◆</span>
                                {l.title}
                                {l.duration_minutes && <span style={{ fontSize: 11, color: token.inkFaint, marginLeft: 6, fontFamily: fontMono }}>{l.duration_minutes}min</span>}
                              </div>
                              <button className="ins-btn" onClick={() => deleteLesson(l.lesson_id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: token.danger, padding: '2px 4px' }}>✕</button>
                            </div>
                          ))}
                        </div>
                      ))
                    }
                  </div>

                  {/* Quizzes */}
                  <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h4 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 16, color: token.ink }}>Quizzes & Assignments</h4>
                      <button className="ins-btn" onClick={() => { setEditingQuiz(null); setQuizForm(blankQuiz); setShowQuizModal(true); }}
                        style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        + Quiz
                      </button>
                    </div>
                    {quizzes.length === 0
                      ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No quizzes yet.</p>
                      : quizzes.map(q => (
                        <div key={q.quiz_id} style={{ padding: '12px 0', borderBottom: `1px solid ${token.line}` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14, color: token.ink }}>{q.title}</div>
                              <div style={{ fontSize: 11, color: token.inkSoft, marginTop: 2, fontFamily: fontMono }}>
                                {q.question_count} Q · {q.attempt_count} attempt{q.attempt_count !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                              <StatusBadge status={q.status} />
                              <button className="ins-btn" onClick={() => openQuiz(q)}
                                style={{ background: token.brassSoft, color: token.brass, border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                Manage
                              </button>
                            </div>
                          </div>

                          {/* Expanded quiz detail */}
                          {selectedQuiz?.quiz_id === q.quiz_id && (
                            <div style={{ marginTop: 10, padding: 12, background: token.paper, borderRadius: 8, border: `1px solid ${token.line}` }}>

                              {/* Questions */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: token.ink }}>Questions ({questions.length})</span>
                                <button className="ins-btn" onClick={() => { setQForm(blankQ); setShowQModal(true); }}
                                  style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                  + Add
                                </button>
                              </div>
                              {questions.map((qs, i) => (
                                <div key={qs.question_id} style={{ fontSize: 12, padding: '5px 0', borderBottom: `1px solid ${token.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', color: token.inkSoft }}>
                                  <div><span style={{ color: token.inkFaint }}>Q{i + 1}.</span> {qs.question_text}</div>
                                  <button className="ins-btn" onClick={() => deleteQuestion(qs.question_id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.danger, fontSize: 11, padding: '0 4px', flexShrink: 0 }}>✕</button>
                                </div>
                              ))}

                              {/* Score-band feedback */}
                              <div style={{ marginTop: 14, borderTop: `1px solid ${token.line}`, paddingTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: token.ink }}>Score-Band Feedback ({feedbackBands.length})</span>
                                  <button className="ins-btn" onClick={openAddFeedback}
                                    style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                                    + Band
                                  </button>
                                </div>
                                {feedbackWarning && (
                                  <div style={{ fontSize: 11, color: token.warn, background: token.warnSoft, border: `1px solid ${token.warn}30`, borderRadius: 5, padding: '6px 10px', marginBottom: 8 }}>
                                    ⚠ Quiz already attempted — changes apply to future attempts only.
                                  </div>
                                )}
                                {feedbackBands.length === 0
                                  ? <p style={{ fontSize: 11, color: token.inkFaint, margin: 0 }}>No bands yet.</p>
                                  : feedbackBands.map(band => (
                                    <div key={band.quiz_feedback_id} style={{ fontSize: 11, padding: '4px 0', borderBottom: `1px solid ${token.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <span style={{ color: token.brass, fontWeight: 600, fontFamily: fontMono }}>{band.min_score}% – {band.max_score}%</span>
                                        <span style={{ color: token.inkSoft, marginLeft: 8 }}>{band.feedback_message}</span>
                                      </div>
                                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <button className="ins-btn" onClick={() => openEditFeedback(band)}
                                          style={{ background: 'none', border: `1px solid ${token.line}`, borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontSize: 11, color: token.inkSoft }}>Edit</button>
                                        <button className="ins-btn" onClick={() => deleteFeedback(band.quiz_feedback_id)}
                                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.danger, fontSize: 11, padding: '1px 4px' }}>✕</button>
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>

                  {/* Students */}
                  <div className="ins-card" style={{ gridColumn: '1 / -1', background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 }}>
                    <h4 style={{ margin: '0 0 16px 0', fontFamily: fontDisplay, fontSize: 16, color: token.ink }}>Enrolled Students</h4>
                    {students.length === 0
                      ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No enrolled students yet.</p>
                      : (
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                              <tr>
                                {['Student', 'Email', 'Progress', 'Avg Score', 'Quizzes', 'Risk'].map(h => (
                                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}`, fontFamily: fontBody }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {students.map(s => (
                                <tr key={s.user_id} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                                  <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{s.username}</td>
                                  <td style={{ padding: '10px 12px', color: token.inkSoft }}>{s.email}</td>
                                  <td style={{ padding: '10px 12px', minWidth: 120 }}>
                                    <div style={{ background: token.surface3, borderRadius: 99, height: 6, marginBottom: 4 }}>
                                      <div style={{ background: token.brass, height: 6, borderRadius: 99, width: `${s.completion_percent}%` }} />
                                    </div>
                                    <span style={{ fontSize: 11, color: token.inkSoft, fontFamily: fontMono }}>{s.completion_percent}%</span>
                                  </td>
                                  <td style={{ padding: '10px 12px', fontFamily: fontMono, fontWeight: 700, color: s.avg_score >= 70 ? token.good : s.avg_score >= 50 ? token.warn : token.danger }}>
                                    {parseFloat(s.avg_score || 0).toFixed(1)}%
                                  </td>
                                  <td style={{ padding: '10px 12px', fontFamily: fontMono, color: token.inkSoft }}>{s.quizzes_taken}</td>
                                  <td style={{ padding: '10px 12px' }}>
                                    {s.is_at_risk
                                      ? <span style={{ color: token.danger, fontWeight: 600, fontSize: 12 }}>⚠ At Risk</span>
                                      : <span style={{ color: token.good, fontWeight: 600, fontSize: 12 }}>✓ OK</span>
                                    }
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    }
                  </div>

                  {/* Analytics */}
                  {analytics && (
                    <div className="ins-card" style={{ gridColumn: '1 / -1', background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 }}>
                      <h4 style={{ margin: '0 0 16px 0', fontFamily: fontDisplay, fontSize: 16, color: token.ink }}>Course Analytics</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                        <StatCard label="Completed" value={analytics.completed} />
                        <StatCard label="Total Enrolled" value={analytics.total} />
                        <StatCard label="Completion Rate"
                          value={analytics.total > 0 ? `${Math.round(analytics.completed / analytics.total * 100)}%` : '0%'} />
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr>
                            {['Quiz', 'Avg Score', 'Attempts'].map(h => (
                              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}` }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.quizStats.map((q, i) => (
                            <tr key={i} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                              <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{q.title}</td>
                              <td style={{ padding: '10px 12px', fontFamily: fontMono, fontWeight: 700, color: q.avg_score >= 70 ? token.good : q.avg_score >= 50 ? token.warn : token.danger }}>
                                {parseFloat(q.avg_score || 0).toFixed(1)}%
                              </td>
                              <td style={{ padding: '10px 12px', fontFamily: fontMono, color: token.inkSoft }}>{q.attempts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
          )}

          {/* ── GRADING ── */}
          {page === 'grading' && (
            <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: fontDisplay, fontSize: 18, color: token.ink }}>Pending Submissions</h3>
              {pending.length === 0
                ? <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>No pending submissions.</p>
                : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          {['Student', 'Quiz', 'Course', 'Submitted', 'Action'].map(h => (
                            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}`, fontFamily: fontBody }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map(p => (
                          <tr key={p.quiz_attempt_id} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                            <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{p.student_name}</td>
                            <td style={{ padding: '10px 12px', color: token.inkSoft }}>{p.quiz_title}</td>
                            <td style={{ padding: '10px 12px', color: token.inkSoft }}>{p.course_title}</td>
                            <td style={{ padding: '10px 12px', color: token.inkSoft, fontFamily: fontMono, fontSize: 12 }}>
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <button className="ins-btn" onClick={() => openGrade(p)}
                                style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                                Grade
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {page === 'notifications' && (
            <div className="ins-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: fontDisplay, fontSize: 18, color: token.ink }}>Notifications</h3>
              {notifications.length === 0
                ? <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>No notifications.</p>
                : notifications.map(n => (
                  <div key={n.notification_id} style={{
                    padding: '14px 16px', borderRadius: 8, marginBottom: 8,
                    background: n.is_read ? token.surface2 : token.brassSoft,
                    border: `1px solid ${n.is_read ? token.line : token.brass}30`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 14, color: token.ink }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: token.inkFaint, fontFamily: fontMono, flexShrink: 0, marginLeft: 12 }}>
                        {new Date(n.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: token.inkSoft, marginBottom: 8 }}>{n.message}</div>
                    {!n.is_read && (
                      <button className="ins-btn" onClick={() => markRead(n.notification_id)}
                        style={{ background: 'none', border: `1px solid ${token.line}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: token.inkSoft }}>
                        Mark Read
                      </button>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Course */}
      {showCourseModal && (
        <Modal title={editingCourse ? 'Edit Course' : 'New Course'} onClose={() => setShowCourseModal(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Title</label>
            <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Description</label>
            <textarea className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', height: 80, resize: 'vertical' }}
              value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Status</label>
            <select className="ins-select" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={courseForm.status} onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}>
              {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="ins-btn" onClick={saveCourse}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: fontBody }}>
            {editingCourse ? 'Update' : 'Create'} Course
          </button>
        </Modal>
      )}

      {/* Module */}
      {showModuleModal && (
        <Modal title="Add Module" onClose={() => setShowModuleModal(false)}>
          {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>{f.label}</label>
              <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={moduleForm[f.key]} onChange={e => setModuleForm({ ...moduleForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <button className="ins-btn" onClick={saveModule}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Add Module
          </button>
        </Modal>
      )}

      {/* Lesson */}
      {showLessonModal && (
        <Modal title="Add Lesson" onClose={() => setShowLessonModal(false)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Title</label>
            <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Content Type</label>
            <select className="ins-select" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={lessonForm.content_type} onChange={e => setLessonForm({ ...lessonForm, content_type: e.target.value })}>
              {['text', 'video', 'pdf', 'other'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(lessonForm.content_type === 'video' || lessonForm.content_type === 'pdf') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Content URL</label>
              <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={lessonForm.content_url} placeholder="https://..." onChange={e => setLessonForm({ ...lessonForm, content_url: e.target.value })} />
            </div>
          )}
          {lessonForm.content_type === 'text' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Content Text</label>
              <textarea className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', height: 100, resize: 'vertical' }}
                value={lessonForm.content_text} onChange={e => setLessonForm({ ...lessonForm, content_text: e.target.value })} />
            </div>
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Duration (minutes)</label>
            <input className="ins-input" type="number" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={lessonForm.duration_minutes} onChange={e => setLessonForm({ ...lessonForm, duration_minutes: e.target.value })} />
          </div>
          <button className="ins-btn" onClick={saveLesson}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Add Lesson
          </button>
        </Modal>
      )}

      {/* Quiz */}
      {showQuizModal && (
        <Modal title={editingQuiz ? 'Edit Quiz' : 'New Quiz'} onClose={() => setShowQuizModal(false)}>
          {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>{f.label}</label>
              <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={quizForm[f.key]} onChange={e => setQuizForm({ ...quizForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Due Date</label>
              <input className="ins-input" type="datetime-local" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={quizForm.due_date} onChange={e => setQuizForm({ ...quizForm, due_date: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Time Limit (mins)</label>
              <input className="ins-input" type="number" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={quizForm.time_limit_minutes} onChange={e => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Max Attempts</label>
              <input className="ins-input" type="number" min="1" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={quizForm.max_attempts} onChange={e => setQuizForm({ ...quizForm, max_attempts: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Submission Type</label>
              <select className="ins-select" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={quizForm.submission_type} onChange={e => setQuizForm({ ...quizForm, submission_type: e.target.value })}>
                {['online_quiz', 'file_upload', 'mixed'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Status</label>
            <select className="ins-select" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={quizForm.status} onChange={e => setQuizForm({ ...quizForm, status: e.target.value })}>
              {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, cursor: 'pointer', fontSize: 13, color: token.inkSoft }}>
            <input type="checkbox" checked={quizForm.randomize_questions}
              onChange={e => setQuizForm({ ...quizForm, randomize_questions: e.target.checked })} style={{ accentColor: token.brass }} />
            Randomize Questions
          </label>
          <button className="ins-btn" onClick={saveQuiz}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {editingQuiz ? 'Update' : 'Create'} Quiz
          </button>
        </Modal>
      )}

      {/* Question */}
      {showQModal && (
        <Modal title="Add Question" onClose={() => setShowQModal(false)} wide>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Question Type</label>
            <select className="ins-select" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={qForm.question_type} onChange={e => setQForm({ ...qForm, question_type: e.target.value })}>
              {['mcq', 'fill_blank', 'short_answer'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Question Text</label>
            <textarea className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', height: 80, resize: 'vertical' }}
              value={qForm.question_text} onChange={e => setQForm({ ...qForm, question_text: e.target.value })} />
          </div>
          {qForm.question_type === 'mcq' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Options</label>
              {qForm.options.map((opt, i) => (
                <input key={i} className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '8px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', marginBottom: 6, display: 'block' }}
                  placeholder={`Option ${String(i + 1)}`}
                  value={opt} onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; setQForm({ ...qForm, options: opts }); }} />
              ))}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Correct Answer</label>
            <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
              value={qForm.correct_answer} onChange={e => setQForm({ ...qForm, correct_answer: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Points</label>
              <input className="ins-input" type="number" min="1" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={qForm.points} onChange={e => setQForm({ ...qForm, points: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Improvement Tip</label>
              <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={qForm.improvement_tip} placeholder="Hint for wrong answers" onChange={e => setQForm({ ...qForm, improvement_tip: e.target.value })} />
            </div>
          </div>
          <button className="ins-btn" onClick={saveQuestion}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Add Question
          </button>
        </Modal>
      )}

      {/* Grade */}
      {showGradeModal && gradingItem && (
        <Modal title="Grade Submission" onClose={() => setShowGradeModal(false)}>
          <div style={{ background: token.surface2, padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 13, color: token.inkSoft }}>
            <div><strong>Student:</strong> {gradingItem.student_name}</div>
            <div><strong>Quiz:</strong> {gradingItem.quiz_title}</div>
            <div><strong>Course:</strong> {gradingItem.course_title}</div>
            {gradingItem.submission_type !== 'online_quiz' && (
              <div style={{ marginTop: 8 }}>
                <strong>File:</strong>{' '}
                {gradingItem.file_url
                  ? <a href={`http://localhost:5000${gradingItem.file_url}`} target="_blank" rel="noreferrer" style={{ color: token.brass }}>Download</a>
                  : <span style={{ color: token.inkFaint }}>No file</span>
                }
              </div>
            )}
            {gradingItem.text_note && <div style={{ marginTop: 4 }}><strong>Note:</strong> {gradingItem.text_note}</div>}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Score (0–100)</label>
            <input className="ins-input" type="number" min="0" max="100" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontMono, outline: 'none', boxSizing: 'border-box' }}
              value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Feedback / Comments</label>
            <textarea className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', height: 80, resize: 'vertical' }}
              value={gradeForm.feedback} placeholder="Optional feedback for the student..." onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
          </div>
          <button className="ins-btn" onClick={saveGrade}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Submit Grade
          </button>
        </Modal>
      )}

      {/* Feedback Band */}
      {showFeedbackModal && (
        <Modal title={editingFeedback ? 'Edit Feedback Band' : 'Add Feedback Band'} onClose={() => setShowFeedbackModal(false)}>
          <p style={{ fontSize: 13, color: token.inkSoft, marginTop: 0, marginBottom: 16 }}>
            Define a score range. Students see the matching message after submitting.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Min Score (%)</label>
              <input className="ins-input" type="number" min="0" max="100" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontMono, outline: 'none', boxSizing: 'border-box' }}
                value={feedbackForm.min_score} onChange={e => setFeedbackForm({ ...feedbackForm, min_score: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Max Score (%)</label>
              <input className="ins-input" type="number" min="0" max="100" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontMono, outline: 'none', boxSizing: 'border-box' }}
                value={feedbackForm.max_score} onChange={e => setFeedbackForm({ ...feedbackForm, max_score: e.target.value })} />
            </div>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Message (max 500 chars)</label>
            <textarea className="ins-input"
              style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box', height: 90, resize: 'vertical' }}
              maxLength={500}
              value={feedbackForm.feedback_message}
              placeholder="e.g. Great work! You have a solid grasp of this topic."
              onChange={e => setFeedbackForm({ ...feedbackForm, feedback_message: e.target.value })} />
            <div style={{ fontSize: 11, color: token.inkFaint, textAlign: 'right', marginTop: 4 }}>{feedbackForm.feedback_message.length}/500</div>
          </div>
          <button className="ins-btn" onClick={saveFeedback}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            {editingFeedback ? 'Update' : 'Add'} Feedback Band
          </button>
        </Modal>
      )}

      {/* Profile */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={() => setShowProfileModal(false)}>
          <div style={{ background: token.surface2, padding: '12px 16px', borderRadius: 10, marginBottom: 18, border: `1px solid ${token.line}` }}>
            <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Profile Photo (JPG/PNG, max 5MB)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${token.line}`, background: token.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {profileForm.photo_url
                  ? <img src={`http://localhost:5000${profileForm.photo_url}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                  : <span style={{ fontSize: 24 }}>👨‍🏫</span>
                }
              </div>
              <label style={{ cursor: 'pointer', fontSize: 12, color: token.brass, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: `1px solid ${token.brass}40`, background: token.brassSoft }}>
                Choose Photo
                <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={e => setPhotoFile(e.target.files[0] || null)} />
              </label>
              {photoFile && <span style={{ fontSize: 11, color: token.inkSoft }}>{photoFile.name}</span>}
            </div>
          </div>
          {[
            { label: 'Username', key: 'username' },
            { label: 'Phone Number', key: 'phone_number' },
            { label: 'Department', key: 'department' },
            { label: 'Specialization', key: 'specialization' },
            { label: 'Subjects Taught', key: 'subjects_taught' },
            { label: 'Office Hours', key: 'office_hours' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>{f.label}</label>
              <input className="ins-input" style={{ width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: fontBody, outline: 'none', boxSizing: 'border-box' }}
                value={profileForm[f.key] || ''} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <button className="ins-btn" onClick={saveProfile}
            style={{ width: '100%', background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginTop: 6 }}>
            Save Profile
          </button>
        </Modal>
      )}
    </div>
  );
}
