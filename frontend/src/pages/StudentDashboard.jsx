import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  studentGetDashboard, studentGetProfile, studentUpdateProfile,
  studentGetCourses, studentEnroll, studentGetModules, studentCompleteLesson,
  studentGetQuizzes, studentStartQuiz, studentSubmitQuiz,
  studentGetAssignment, studentSubmitAssignment,
  studentGetGrades, studentGetGradeDetail, studentGetProgress,
  studentGetNotifications, studentMarkRead, studentLogActivity
} from '../services/api';

const token = {
  paper: '#F6F4EE',
  surface: '#FFFFFF',
  surface2: '#F1E6D2',
  surface3: '#E7E2D5',
  line: '#E7E2D5',
  border: '#E7E2D5',
  border2: '#D6CBBF',
  ink: '#1C2541',
  inkSoft: '#5B6478',
  inkFaint: '#94A0B4',
  brass: '#A9792C',
  brassSoft: '#F1E6D2',
  brassDeep: '#7C5A1E',
  danger: '#B3261E',
  dangerSoft: '#FBEAE9',
  warn: '#92400E',
  warnSoft: '#FDF1DF',
  good: '#1F7A4D',
  goodSoft: '#E7F5EE',
  info: '#2454A6',
  infoSoft: '#EAF1FB',
  accent: '#2454A6',
  accent2: '#A9792C',
  accent3: '#1F7A4D',
  accent4: '#92400E',
  accent5: '#B3261E',
  radius: 14,
  radiusSm: 8
};

const theme = {
  bg: token.paper,
  surface: token.surface,
  surface2: token.surface2,
  surface3: token.surface3,
  border: token.border,
  border2: token.border2,
  text: token.ink,
  textMuted: token.inkSoft,
  textDim: token.inkFaint,
  accent: token.accent,
  accent2: token.accent2,
  accent3: token.accent3,
  accent4: token.accent4,
  accent5: token.accent5,
  radius: token.radius,
  radiusSm: token.radiusSm
};

const courseTones = [
  {
    thumb: 'linear-gradient(135deg,#2454A6,#183E7F)',
    tagBg: 'rgba(36,84,166,0.12)',
    tagColor: token.accent,
    progress: 'linear-gradient(90deg,#2454A6,#A9792C)'
  },
  {
    thumb: 'linear-gradient(135deg,#1F7A4D,#16603C)',
    tagBg: 'rgba(31,122,77,0.12)',
    tagColor: token.accent3,
    progress: 'linear-gradient(90deg,#1F7A4D,#2454A6)'
  },
  {
    thumb: 'linear-gradient(135deg,#92400E,#7A320B)',
    tagBg: 'rgba(146,64,14,0.12)',
    tagColor: token.accent4,
    progress: 'linear-gradient(90deg,#92400E,#B3261E)'
  },
  {
    thumb: 'linear-gradient(135deg,#7C5A1E,#A9792C)',
    tagBg: 'rgba(169,121,44,0.12)',
    tagColor: token.accent2,
    progress: 'linear-gradient(90deg,#A9792C,#2454A6)'
  }
];

const fontDisplay = "'Lora', Georgia, serif";
const fontBody = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .adv-root * { box-sizing: border-box; }
      .adv-root { font-family: ${fontBody}; color: ${token.ink}; background: ${token.paper}; }

      .adv-nav-item { transition: background-color .15s ease, color .15s ease; position: relative; }
      .adv-nav-item:hover { background: rgba(36,84,166,0.08); color: ${token.surface}; }
      .adv-nav-item.active::before {
        content: ''; position: absolute; left: -16px; top: 8px; bottom: 8px; width: 3px;
        background: ${token.brass}; border-radius: 2px;
      }

      .adv-btn { transition: filter .15s ease, transform .1s ease; }
      .adv-btn:hover { filter: brightness(1.05); }
      .adv-btn:active { transform: translateY(1px); }
      .adv-btn:focus-visible, .adv-input:focus-visible, .adv-icon-btn:focus-visible, .adv-row-btn:focus-visible, .adv-tab-btn:focus-visible {
        outline: 2px solid ${token.brass}; outline-offset: 2px;
      }

      .adv-row-btn { transition: background-color .15s ease, border-color .15s ease; }

      .adv-table-row { transition: background-color .12s ease; }
      .adv-table-row:hover { background: ${token.paper} !important; }

      .adv-card { animation: adv-rise .22s ease both; }
      @keyframes adv-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      .adv-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
      .adv-scroll::-webkit-scrollbar-thumb { background: ${token.line}; border-radius: 8px; }

      .adv-table-wrap { overflow-x: auto; }

      @media (prefers-reduced-motion: reduce) {
        .adv-card { animation: none; }
      }

      @media (max-width: 860px) {
        .adv-sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto; padding: 12px !important; position: sticky; top: 0; z-index: 50; }
        .adv-sidebar .adv-brand, .adv-sidebar .adv-spacer, .adv-sidebar .adv-foot { display: none !important; }
        .adv-shell { flex-direction: column !important; }
        .adv-nav-item { white-space: nowrap; }
        .adv-nav-item.active::before { left: 0; top: auto; bottom: -10px; right: 8px; width: auto; height: 3px; }
      }
    `}</style>
  );
}

function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home': return <svg {...common}><path d="M3 11.5 12 3l9 8.5" /><path d="M5 12v8h14v-8" /><path d="M9 21v-6h6v6" /></svg>;
    case 'courses': return <svg {...common}><path d="M4 5h16v14H4z" /><path d="M4 8h16" /><path d="M8 5v14" /></svg>;
    case 'lessons': return <svg {...common}><path d="M5 18h14" /><path d="M5 6h14" /><path d="M5 12h14" /></svg>;
    case 'progress': return <svg {...common}><path d="M4 16l4-4 3 3 5-5" /><path d="M21 21H3" /></svg>;
    case 'notifications': return <svg {...common}><path d="M18 8a6 6 0 0 0-12 0v4H4l1 2h14l1-2h-2V8" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case 'profile': return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 14 0v1" /></svg>;
    case 'logout': return <svg {...common}><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
    case 'check': return <svg {...common}><path d="M5 13l4 4L19 7" /></svg>;
    case 'x': return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    default: return null;
  }
}

// ─── Avatar ──────────────────────────────────────────────
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
}
function Avatar({ name, photoUrl, size = 38 }) {
  const [broken, setBroken] = useState(false);
  if (photoUrl && !broken) {
    return (
      <img src={photoUrl} alt={name} onError={() => setBroken(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${token.line}`, flexShrink: 0 }} />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: token.brassSoft, color: token.brassDeep,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fontDisplay, fontWeight: 600, fontSize: size * 0.38,
      border: `1px solid ${token.brass}33`,
    }}>{initials(name)}</div>
  );
}


// ─── Reusable UI ─────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  const ok = type !== 'error';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13.5,
      background: ok ? token.goodSoft : token.dangerSoft,
      color: ok ? token.good : token.danger,
      border: `1px solid ${ok ? token.good : token.danger}22`,
    }}>
      <Icon name={ok ? 'check' : 'x'} size={16} />
      {msg}
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalBox, maxWidth: wide ? 860 : 520 }} onClick={(e) => e.stopPropagation()} className="adv-scroll adv-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Close">
            <Icon name="x" size={16} color={token.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [alert, setAlert] = useState({ msg: '', type: '' });
  const [search, setSearch] = useState('');

  // data
  const [dashboard, setDashboard] = useState(null);
  const [catalogue, setCatalogue] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [grades, setGrades] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [gradeDetail, setGradeDetail] = useState(null);
  const [gradeDetailLoading, setGradeDetailLoading] = useState(false);

  // selected course context
  const [selectedCourse, setSelectedCourse] = useState(null);

  // quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // lesson context panel
  const [selectedLesson, setSelectedLesson] = useState(null);

  // assignment (file_upload) state
  const [assignmentData, setAssignmentData] = useState(null); // { quiz, question, submission, deadline_passed }
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignmentUploading, setAssignmentUploading] = useState(false);

  // profile form
  const [profileForm, setProfileForm] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  // Reference state vars to keep ESLint happy (they are used in callbacks/JSX)
  void [profile, fileInputRef];

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 3000);
  };

  useEffect(() => {
    const existing = document.getElementById('sils-dashboard-fonts');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'sils-dashboard-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap';
    document.head.appendChild(link);
  }, []);

  // ── Timer for quiz ──
  useEffect(() => {
    if (!activeQuiz || timeLeft === null) return;
    if (timeLeft <= 0) {
      // Auto-submit with current answers
      const answers = Object.entries(quizAnswers).map(([question_id, user_answer]) => ({
        question_id: parseInt(question_id), user_answer
      }));
      studentSubmitQuiz(activeQuiz.attempt_id, { answers })
        .then(res => {
          setQuizResult(res.data);
          setActiveQuiz(null);
          setTimeLeft(null);
          // use functional update to get latest selectedCourse
          setSelectedCourse(sc => {
            if (sc) studentGetGrades(sc.course_id).then(r => setGrades(r.data));
            return sc;
          });
        })
        .catch(() => showAlert('Time is up! Quiz auto-submitted.', 'error'));
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, activeQuiz, quizAnswers]);

  // ── Fetch data on tab change ──
  useEffect(() => {
    if (tab === 'dashboard') {
      studentGetDashboard().then(r => setDashboard(r.data)).catch(() => {});
      studentGetNotifications().then(r => setNotifications(r.data)).catch(() => {});
    }
    if (tab === 'courses')
      studentGetCourses().then(r => setCatalogue(r.data)).catch(() => {});
    if (tab === 'notifications')
      studentGetNotifications().then(r => setNotifications(r.data)).catch(() => {});
    if (tab === 'progress')
      studentGetProgress().then(r => setProgressData(r.data)).catch(() => {});
  }, [tab]);

  // ── Load modules when course selected ──
  const openCourse = async (course) => {
    if (!course.is_enrolled && course.is_enrolled !== undefined && course.is_enrolled < 1) {
      showAlert('Please enroll in this course first.', 'error');
      return;
    }
    setSelectedCourse(course);
    setActiveQuiz(null);
    setQuizResult(null);
    setSelectedLesson(null);
    setModules([]);
    setQuizzes([]);
    setGrades([]);
    setTab('lessons');
    studentLogActivity({
      activity_type: 'page_visit',
      description: `Viewed course: ${course.title}`,
      related_item_type: 'course',
      related_item_id: course.course_id,
    }).catch(() => {});
    try {
      const [m, q, g] = await Promise.all([
        studentGetModules(course.course_id),
        studentGetQuizzes(course.course_id),
        studentGetGrades(course.course_id)
      ]);
      setModules(m.data);
      setQuizzes(q.data);
      setGrades(g.data);
    } catch { showAlert('Failed to load course content', 'error'); }
  };

  // ── Enroll ──
  const handleEnroll = async (courseId) => {
    try {
      await studentEnroll({ course_id: courseId });
      showAlert('Enrolled successfully!');
      studentGetCourses().then(r => setCatalogue(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Enrollment failed', 'error');
    }
  };

  // ── Mark lesson complete ──
  const handleComplete = async (moduleId) => {
    try {
      await studentCompleteLesson(moduleId);
      showAlert('Lesson marked as complete!');
      studentGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── Start quiz ──
  const handleStartQuiz = async (quizId) => {
    try {
      const res = await studentStartQuiz(quizId);
      setActiveQuiz(res.data);
      setQuizAnswers({});
      setQuizResult(null);
      if (res.data.quiz.time_limit_minutes) {
        setTimeLeft(res.data.quiz.time_limit_minutes * 60);
      }
    } catch (e) {
      showAlert(e.response?.data?.message || 'Cannot start quiz', 'error');
    }
  };

  // ── Submit quiz ──
  const handleSubmitQuiz = async () => {
    try {
      const answers = Object.entries(quizAnswers).map(([question_id, user_answer]) => ({
        question_id: parseInt(question_id), user_answer
      }));
      const res = await studentSubmitQuiz(activeQuiz.attempt_id, { answers });
      setQuizResult(res.data);
      setActiveQuiz(null);
      setTimeLeft(null);
      studentGetGrades(selectedCourse.course_id).then(r => setGrades(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed to submit quiz', 'error'); }
  };

  // ── Open assignment (file_upload quiz) ──
  const handleOpenAssignment = async (quizId) => {
    try {
      const res = await studentGetAssignment(quizId);
      setAssignmentData(res.data);
      setAssignmentFile(null);
      setAssignmentNote('');
      setQuizResult(null);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Cannot load assignment', 'error');
    }
  };

  // ── Submit assignment file ──
  const handleSubmitAssignment = async () => {
    if (!assignmentFile) { showAlert('Please select a file.', 'error'); return; }
    setAssignmentUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', assignmentFile);
      if (assignmentNote) formData.append('text_note', assignmentNote);
      await studentSubmitAssignment(assignmentData.quiz.quiz_id, formData);
      showAlert('Assignment submitted successfully!');
      // Refresh assignment data to reflect new submission
      const res = await studentGetAssignment(assignmentData.quiz.quiz_id);
      setAssignmentData(res.data);
      setAssignmentFile(null);
      setAssignmentNote('');
      studentGetGrades(selectedCourse.course_id).then(r => setGrades(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setAssignmentUploading(false);
    }
  };

  // ── Open grade detail ──
  const handleOpenGradeDetail = async (attemptId) => {
    setGradeDetailLoading(true);
    setGradeDetail(null);
    try {
      const res = await studentGetGradeDetail(attemptId);
      setGradeDetail(res.data);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to load grade detail', 'error');
    } finally {
      setGradeDetailLoading(false);
    }
  };


  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // ── Profile ──
  const openProfile = async () => {
    setProfileLoading(true);
    setShowProfileModal(true);
    try {
      const res = await studentGetProfile();
      setProfile(res.data);
      setProfileData(res.data);
      setProfileForm({
        username: res.data.username || '',
        phone_number: res.data.phone_number || '',
        email: res.data.email || '',
        department: res.data.department || '',
        academic_level: res.data.academic_level || '',
        programme: res.data.programme || '',
        learning_preferences: res.data.learning_preferences || '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch {
      showAlert('Failed to load profile', 'error');
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      showAlert('Photo must be a JPG or PNG file.', 'error');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showAlert('Photo must be 5MB or smaller.', 'error');
      e.target.value = '';
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };
  // eslint-disable-next-line no-unused-vars
  void onPhotoChange;
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const saveProfile = async () => {
    try {
      const fd = new FormData();
      fd.append('username', profileForm.username || '');
      fd.append('phone_number', profileForm.phone_number || '');
      fd.append('department', profileForm.department || '');
      fd.append('academic_level', profileForm.academic_level || '');
      fd.append('programme', profileForm.programme || '');
      fd.append('learning_preferences', profileForm.learning_preferences || '');
      if (photoFile) fd.append('photo', photoFile);

      const res = await studentUpdateProfile(fd);
      showAlert('Profile updated successfully!');
      setShowProfileModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
      if (res?.data?.photo_url) {
        setProfile(p => ({ ...p, photo_url: res.data.photo_url }));
      }
    } catch (e) {
      showAlert(e.response?.data?.message || 'Update failed', 'error');
    }
  };

  // ── Notifications ──
  const markRead = async (id) => {
    await studentMarkRead(id);
    studentGetNotifications().then(r => setNotifications(r.data));
  };
  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => studentMarkRead(n.notification_id)));
    studentGetNotifications().then(r => setNotifications(r.data));
  };
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const filteredCatalogue = catalogue.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.course_code?.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredModules = modules.filter(m =>
    !search || m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.lessons?.some(l => l.title?.toLowerCase().includes(search.toLowerCase()))
  );

  const enrolledCount = dashboard?.enrollments?.length || 0;
  const avgCompletion = dashboard?.enrollments?.length
    ? Math.round(dashboard.enrollments.reduce((sum, e) => sum + (Number(e.completion_percent) || 0), 0) / dashboard.enrollments.length)
    : null;
  const gpaValue = dashboard?.profile?.gpa;
  const gpa = gpaValue != null && !Number.isNaN(Number(gpaValue))
    ? Number(gpaValue).toFixed(2)
    : '—';
  const atRisk = dashboard?.profile?.is_at_risk;
  const deadlinesCount = dashboard?.deadlines?.length || 0;

  // ─────────────────────────────────────────────────────────
  return (
    <div className="adv-root" style={appShell}>
      <GlobalStyle />
      {/* Sidebar */}
      <nav style={sidebar}>
        <div className="adv-brand" style={sidebarLogo}>
          <div style={logoBadge}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${token.brass}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 600, color: token.brass, fontSize: 14,
            }}>SL</div>
            <div>
              <div style={logoText}>SILS</div>
              <span style={logoSub}>Student Portal</span>
            </div>
          </div>
        </div>

        <div style={navSection}>
          <div style={navLabel}>Main</div>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'home' },
            { key: 'courses', label: 'Browse Courses', icon: 'courses' },
            { key: 'lessons', label: 'My Lessons', icon: 'lessons' },
            { key: 'progress', label: 'My Progress', icon: 'progress' }
          ].map(item => (
            <div
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`adv-nav-item${tab === item.key ? ' active' : ''}`}
              style={{ ...navItem, background: tab === item.key ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === item.key ? '#fff' : '#B7BFCF' }}
            >
              <span style={navIcon}><Icon name={item.icon} size={16} /></span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={navSection}>
          <div style={navLabel}>Personal</div>
          <div
            onClick={() => setTab('notifications')}
            className={`adv-nav-item${tab === 'notifications' ? ' active' : ''}`}
            style={{ ...navItem, background: tab === 'notifications' ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === 'notifications' ? '#fff' : '#B7BFCF' }}
          >
            <span style={navIcon}><Icon name="notifications" size={16} /></span>
            <span style={{ flex: 1 }}>Notifications</span>
            {unreadCount > 0 && (
              <span style={{ background: token.brass, color: '#1C2541', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '1px 7px', fontFamily: fontMono }}>
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="adv-spacer" style={{ flex: 1 }} />

        <div style={{ padding: '0 12px' }}>
          <div onClick={openProfile} className="adv-nav-item" style={{ ...navItem, display: 'flex', alignItems: 'center', gap: 10, color: '#B7BFCF' }}>
            <Avatar name={user?.username} size={28} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: 11, color: '#8893A8' }}>View profile</div>
            </div>
          </div>
          <div onClick={logout} className="adv-nav-item adv-foot" style={{ ...navItem, color: '#E2A6A1', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon name="logout" size={16} /> Log out
          </div>
        </div>
      </nav>

      {/* Main */}
      <div style={main}>
        <header style={topbar}>
          <div>
            <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: token.brassDeep, marginBottom: 4 }}>
              {tabEyebrow(tab)}
            </div>
            <div style={pageTitle}>{tabTitle(tab, selectedCourse)}</div>
          </div>
          <div style={topbarRight}>
            <div style={searchBox}>
              <span style={{ color: theme.textDim }}>🔍</span>
              <input
                style={searchInput}
                placeholder="Search courses, lessons…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button style={iconBtn} onClick={() => setTab('notifications')} aria-label="Notifications">
              <Icon name="notifications" size={17} />
              {unreadCount > 0 && <span style={notifDot} />}
            </button>
            <button style={{ ...iconBtn, border: 'none', background: 'none', cursor: 'pointer' }} onClick={openProfile} aria-label="Profile">
              <Avatar name={user?.username} size={32} />
            </button>
          </div>
        </header>

        <div style={content}>
          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && !dashboard && (
            <Loading label="Loading your dashboard…" />
          )}
          {tab === 'dashboard' && dashboard && (
            <div className="adv-card">
              <div style={{ marginBottom: 24 }}>
                <h2 style={greetingTitle}>{getGreeting()}, {user.username} 👋</h2>
                <p style={greetingSub}>
                  You have {deadlinesCount} upcoming {deadlinesCount === 1 ? 'deadline' : 'deadlines'}. Keep going!
                </p>
              </div>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                <StatCard
                  label="Enrolled Courses"
                  value={enrolledCount}
                  icon="📚"
                  tone="blue"
                  trend={{ type: 'up', text: enrolledCount ? `${enrolledCount} active` : 'Start learning today' }}
                />
                <StatCard
                  label="Avg. Completion"
                  value={avgCompletion !== null ? `${avgCompletion}%` : '—'}
                  icon="◎"
                  tone="green"
                  trend={{ type: 'up', text: avgCompletion !== null ? 'Weekly progress' : 'No data yet' }}
                />
                <StatCard
                  label="Deadlines"
                  value={deadlinesCount}
                  icon="✎"
                  tone="orange"
                  trend={{ type: deadlinesCount > 0 ? 'down' : 'up', text: deadlinesCount > 0 ? 'Due soon' : 'All clear' }}
                />
                <StatCard
                  label="GPA"
                  value={gpa}
                  icon="🎓"
                  tone={atRisk ? 'orange' : 'purple'}
                  trend={{ type: atRisk ? 'down' : 'up', text: atRisk ? '⚠ At-risk student' : 'Keep it up!' }}
                />
              </div>
              {atRisk && (
                <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: theme.radiusSm, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 13, color: theme.accent5, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span><strong>At-Risk Alert:</strong> Your academic advisor has flagged your account. Please review your progress and reach out for support if needed.</span>
                </div>
              )}

              <div style={gridTwoOne}>
                <div>
                  <div style={sectionTitle}>Continue Learning</div>
                  {dashboard.enrollments.length === 0 ? (
                    <Empty>No courses yet. Browse the catalogue!</Empty>
                  ) : (
                    <div style={courseGrid}>
                      {dashboard.enrollments.map((e, i) => {
                        const tone = courseTones[i % courseTones.length];
                        const progress = Math.min(100, Math.max(0, Number(e.completion_percent) || 0));
                        return (
                          <div key={e.course_id} style={courseCard} onClick={() => openCourse(e)}>
                            <div style={{ ...courseThumb, background: tone.thumb }}>{e.title?.[0] || '📘'}</div>
                            <div style={{ ...courseTag, background: tone.tagBg, color: tone.tagColor }}>
                              {e.course_code || `COURSE ${e.course_id}`}
                            </div>
                            <div style={courseTitle}>{e.title}</div>
                            <div style={courseMeta}>by {e.instructor_name}</div>
                            <div style={progressBar}>
                              <div style={{ ...progressFill, width: `${progress}%`, background: tone.progress }} />
                            </div>
                            <div style={progressLabel}>
                              <span>{progress}% complete</span>
                              <span>View lessons</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div style={{ ...sectionTitle, marginTop: 28 }}>Upcoming Deadlines</div>
                  <div style={card}>
                    {dashboard.deadlines.length === 0 ? (
                      <div style={emptyState}>No upcoming deadlines.</div>
                    ) : (
                      dashboard.deadlines.map((d, i) => (
                        <div key={`${d.title}-${i}`} style={quizItem}>
                          <div style={{ ...quizIcon, background: 'rgba(249,115,22,0.12)' }}>⏱</div>
                          <div style={quizInfo}>
                            <div style={quizName}>{d.title}</div>
                            <div style={quizMeta}>{d.course_title}</div>
                          </div>
                          <span style={{ ...quizStatus, ...statusPill('due') }}>
                            Due {new Date(d.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div style={sectionTitle}>Recent Notifications</div>
                  <div style={{ ...card, marginBottom: 20 }}>
                    {notifications.length === 0 ? (
                      <div style={emptyState}>No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 4).map(n => (
                        <div
                          key={n.notification_id}
                          style={{ ...notifItem, ...(n.is_read ? {} : notifItemUnread) }}
                          onClick={() => markRead(n.notification_id)}
                        >
                          <div style={{ ...notifDotSm, background: n.is_read ? theme.textDim : theme.accent5 }} />
                          <div style={{ flex: 1 }}>
                            <div style={notifTitle}>{n.title}</div>
                            <div style={notifMsg}>{n.message}</div>
                            <div style={notifTime}>{new Date(n.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={sectionTitle}>Recent Quiz Scores</div>
                  <div style={card}>
                    {dashboard.quizScores.length === 0 ? (
                      <div style={emptyState}>No quiz scores yet.</div>
                    ) : (
                      <table style={table}>
                        <thead>
                          <tr>
                            {['Quiz', 'Score', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard.quizScores.map((s, i) => (
                            <tr key={i} className="adv-table-row">
                              <td style={td}>{s.quiz_title}</td>
                              <td style={td}>
                                <span style={{
                                  fontWeight: 700,
                                  color: s.score >= 70 ? theme.accent3 : s.score >= 50 ? theme.accent4 : theme.accent5
                                }}>
                                  {parseFloat(s.score).toFixed(1)}%
                                </span>
                              </td>
                              <td style={td}>{new Date(s.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── COURSES TAB ── */}
          {tab === 'courses' && (
            <div style={courseGridWide}>
              {filteredCatalogue.length === 0
                ? <div style={emptyState}>{search ? 'No courses match your search.' : 'No published courses available.'}</div>
                : filteredCatalogue.map((c, i) => {
                  const tone = courseTones[i % courseTones.length];
                  return (
                    <div key={c.course_id} style={courseCard}>
                      <div style={{ ...courseThumb, background: tone.thumb }}>📘</div>
                      <div style={{ ...courseTag, background: tone.tagBg, color: tone.tagColor }}>
                        {c.course_code || `COURSE ${c.course_id}`}
                      </div>
                      <div style={courseTitle}>{c.title}</div>
                      <div style={courseMeta}>👨‍🏫 {c.instructor_name}</div>
                      <div style={courseDesc}>{c.description || 'No description provided.'}</div>
                      {c.is_enrolled > 0
                        ? <button style={{ ...btnPrimary, width: '100%' }} onClick={() => openCourse(c)}>Go to Course</button>
                        : <button style={{ ...btnGhost, width: '100%' }} onClick={() => handleEnroll(c.course_id)}>Enroll Now</button>
                      }
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* ── LESSONS TAB ── */}
          {tab === 'lessons' && (
            <div>
              {!selectedCourse
                ? (
                  <div style={{ ...emptyState, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontSize: 40 }}>📚</div>
                    <div style={{ fontSize: 15, color: theme.textMuted }}>You haven't selected a course yet.</div>
                    <button style={btnPrimary} onClick={() => setTab('courses')}>Browse Courses</button>
                  </div>
                )
                : (
                  <div style={lessonsGrid}>
                    {/* Left: Modules list */}
                    <div>
                      {!activeQuiz && !quizResult && filteredModules.map(mod => (
                        <div key={mod.module_id} style={{ ...card, marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h4 style={{ margin: 0 }}>{mod.title}</h4>
                            <span style={statusBadge(mod.progress_status || 'not_started')}>
                              {mod.progress_status || 'not started'}
                            </span>
                          </div>
                          {mod.description && <p style={{ color: theme.textMuted, fontSize: 13 }}>{mod.description}</p>}
                          <div style={{ marginTop: 12 }}>
                            {mod.lessons?.map(l => (
                              <div key={l.lesson_id} style={{
                                ...lessonRow,
                                background: selectedLesson?.lesson_id === l.lesson_id
                                  ? 'rgba(36,84,166,0.06)' : 'transparent',
                                borderRadius: selectedLesson?.lesson_id === l.lesson_id ? 8 : 0,
                                padding: selectedLesson?.lesson_id === l.lesson_id ? '10px 8px' : '10px 0',
                                margin: selectedLesson?.lesson_id === l.lesson_id ? '0 -8px' : 0,
                              }}>
                                <span style={{ fontSize: 16 }}>
                                  {l.content_type === 'video' ? '🎬' : l.content_type === 'pdf' ? '📄' : '📝'}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                                  {l.duration_minutes &&
                                    <div style={{ fontSize: 12, color: theme.textDim }}>{l.duration_minutes} min</div>
                                  }
                                  {l.content_url && l.content_type === 'video' && (
                                    <button
                                      style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', color: theme.accent }}
                                      onClick={() => {
                                        studentLogActivity({
                                          activity_type: 'video_watch',
                                          description: `Watched video: ${l.title}`,
                                          related_item_type: 'lesson',
                                          related_item_id: l.lesson_id,
                                        }).catch(() => {});
                                        setSelectedLesson(l);
                                        setActiveQuiz(null);
                                        setQuizResult(null);
                                        setAssignmentData(null);
                                      }}
                                    >Open Content ↗</button>
                                  )}
                                  {l.content_url && l.content_type !== 'video' && (
                                    <button
                                      style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', color: theme.accent }}
                                      onClick={() => {
                                        setSelectedLesson(l);
                                        setActiveQuiz(null);
                                        setQuizResult(null);
                                        setAssignmentData(null);
                                      }}
                                    >Open Content ↗</button>
                                  )}
                                  {l.content_text &&
                                    <button
                                      style={{ ...link, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', color: theme.accent, display: 'block', marginTop: 4 }}
                                      onClick={() => {
                                        setSelectedLesson(l);
                                        setActiveQuiz(null);
                                        setQuizResult(null);
                                        setAssignmentData(null);
                                      }}
                                    >Open Content ↗</button>
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                          {mod.progress_status !== 'completed' &&
                            <button style={{ ...btnPrimary, marginTop: 12 }} onClick={() => handleComplete(mod.module_id)}>
                              Mark Module Complete
                            </button>
                          }
                        </div>
                      ))}
                      {filteredModules.length === 0 && !activeQuiz && !quizResult && (
                        <div style={emptyState}>{search ? 'No modules match your search.' : 'No modules yet.'}</div>
                      )}
                    </div>

                    {/* Right: Active quiz OR quizzes + grades */}
                    <div>
                      {activeQuiz && (
                        <div style={card}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif" }}>
                              {activeQuiz.quiz.title}
                            </h3>
                            {timeLeft !== null &&
                              <span style={{ fontWeight: 700, color: timeLeft < 300 ? theme.accent5 : theme.accent, fontSize: 18 }}>
                                ⏱ {formatTime(timeLeft)}
                                {timeLeft < 300 && <span style={{ fontSize: 12, marginLeft: 6 }}>⚠ Time running out!</span>}
                              </span>
                            }
                          </div>
                          {activeQuiz.questions.map((q, i) => (
                            <div key={q.question_id} style={quizQuestion}>
                              <div style={{ fontWeight: 600, marginBottom: 10 }}>
                                Q{i + 1}. {q.question_text}
                                <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 12 }}> ({q.points} pts)</span>
                              </div>
                              {q.question_type === 'mcq' && q.options
                                ? JSON.parse(q.options).map((opt, oi) => (
                                  <label key={oi} style={radioLabel}>
                                    <input
                                      type="radio"
                                      name={`q_${q.question_id}`}
                                      value={opt}
                                      checked={quizAnswers[q.question_id] === opt}
                                      onChange={() => setQuizAnswers({ ...quizAnswers, [q.question_id]: opt })}
                                    />
                                    {' '}{opt}
                                  </label>
                                ))
                                : <input
                                  style={{ ...formInput, marginTop: 6 }}
                                  placeholder={q.question_type === 'fill_blank' ? 'Fill in the blank...' : 'Your answer...'}
                                  value={quizAnswers[q.question_id] || ''}
                                  onChange={e => setQuizAnswers({ ...quizAnswers, [q.question_id]: e.target.value })}
                                />
                              }
                            </div>
                          ))}
                          <button style={{ ...btnPrimary, width: '100%', marginTop: 8 }} onClick={handleSubmitQuiz}>
                            Submit Quiz
                          </button>
                        </div>
                      )}

                      {quizResult && !activeQuiz && (
                        <div style={{ ...card, marginBottom: 20 }}>
                          <h3 style={{ marginTop: 0, fontFamily: "'DM Serif Display', serif" }}>Quiz Results</h3>
                          <div style={{
                            fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8,
                            color: quizResult.score >= 70 ? theme.accent3 : quizResult.score >= 50 ? theme.accent4 : theme.accent5
                          }}>
                            {quizResult.score}%
                          </div>
                          <div style={{ textAlign: 'center', color: theme.textMuted, marginBottom: 20 }}>
                            {quizResult.totalScore} / {quizResult.totalPoints} points
                          </div>
                          {quizResult.overallFeedback && (
                            <div style={{
                              padding: '12px 16px', marginBottom: 16, borderRadius: theme.radiusSm,
                              background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.3)',
                              fontSize: 14, color: theme.text, textAlign: 'center'
                            }}>
                              📝 {quizResult.overallFeedback}
                            </div>
                          )}
                          {quizResult.results.map((r, i) => (
                            <div key={i} style={{
                              padding: 12, marginBottom: 8, borderRadius: theme.radiusSm,
                              background: r.is_correct ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)',
                              border: `1px solid ${r.is_correct ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)'}`
                            }}>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>Q{i + 1}. {r.question_text}</div>
                              <div style={{ fontSize: 12, marginTop: 4 }}>
                                Your answer: <strong>{r.user_answer || '(no answer)'}</strong>
                              </div>
                              {!r.is_correct && r.correct_answer &&
                                <div style={{ fontSize: 12, color: theme.accent3 }}>
                                  Correct: <strong>{r.correct_answer}</strong>
                                </div>
                              }
                              <div style={{ fontSize: 12, color: r.is_correct ? theme.accent3 : theme.accent5, marginTop: 4 }}>
                                💡 {r.feedback}
                              </div>
                            </div>
                          ))}
                          <button style={{ ...btnGhost, marginTop: 12 }} onClick={() => setQuizResult(null)}>
                            Close Results
                          </button>
                        </div>
                      )}

                      {/* ── LESSON CONTENT PANEL ── */}
                      {!activeQuiz && !quizResult && !assignmentData && selectedLesson && (
                        <div style={{ ...card, marginBottom: 16 }} className="adv-card">
                          {/* Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{
                                  fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
                                  padding: '3px 8px', borderRadius: 4,
                                  background: selectedLesson.content_type === 'video'
                                    ? 'rgba(36,84,166,0.12)' : selectedLesson.content_type === 'pdf'
                                    ? 'rgba(179,38,30,0.10)' : 'rgba(31,122,77,0.10)',
                                  color: selectedLesson.content_type === 'video'
                                    ? token.accent : selectedLesson.content_type === 'pdf'
                                    ? token.accent5 : token.accent3
                                }}>
                                  {selectedLesson.content_type === 'video' ? '🎬 Video'
                                    : selectedLesson.content_type === 'pdf' ? '📄 PDF'
                                    : '📝 Reading'}
                                </span>
                                {selectedLesson.duration_minutes && (
                                  <span style={{ fontSize: 11, color: theme.textDim }}>
                                    ⏱ {selectedLesson.duration_minutes} min
                                  </span>
                                )}
                              </div>
                              <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 17, color: token.ink, lineHeight: 1.3 }}>
                                {selectedLesson.title}
                              </h3>
                            </div>
                            <button
                              style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, marginLeft: 12, flexShrink: 0 }}
                              onClick={() => setSelectedLesson(null)}
                            >← Back</button>
                          </div>

                          <div style={{ height: 1, background: token.line, marginBottom: 16 }} />

                          {/* VIDEO content */}
                          {selectedLesson.content_type === 'video' && (
                            <div>
                              {selectedLesson.content_url && (
                                (() => {
                                  const url = selectedLesson.content_url;
                                  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
                                  const ytEmbed = ytMatch
                                    ? `https://www.youtube.com/embed/${ytMatch[1]}`
                                    : null;

                                  return ytEmbed ? (
                                    <div style={{ borderRadius: token.radiusSm, overflow: 'hidden', marginBottom: 16, aspectRatio: '16/9', background: '#000' }}>
                                      <iframe
                                        src={ytEmbed}
                                        title={selectedLesson.title}
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                        allowFullScreen
                                      />
                                    </div>
                                  ) : (
                                    <div style={{
                                      borderRadius: token.radiusSm, marginBottom: 16,
                                      background: `linear-gradient(135deg, ${token.ink}, #2454A6)`,
                                      aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                                      alignItems: 'center', justifyContent: 'center', gap: 14,
                                      color: '#fff', position: 'relative', overflow: 'hidden'
                                    }}>
                                      <div style={{ fontSize: 48, opacity: 0.9 }}>▶</div>
                                      <div style={{ fontFamily: fontDisplay, fontSize: 15, opacity: 0.85, textAlign: 'center', padding: '0 24px' }}>
                                        {selectedLesson.title}
                                      </div>
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                          background: token.brass, color: '#fff', textDecoration: 'none',
                                          padding: '9px 20px', borderRadius: token.radiusSm,
                                          fontSize: 13, fontWeight: 600
                                        }}
                                        onClick={() => studentLogActivity({
                                          activity_type: 'video_watch',
                                          description: `Watched video: ${selectedLesson.title}`,
                                          related_item_type: 'lesson',
                                          related_item_id: selectedLesson.lesson_id,
                                        }).catch(() => {})}
                                      >
                                        Open Video ↗
                                      </a>
                                    </div>
                                  );
                                })()
                              )}
                              <div style={{ fontSize: 13, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 16 }}>ℹ️</span>
                                Video content for this lesson. Watch the full video to complete this lesson.
                              </div>
                            </div>
                          )}

                          {/* PDF content */}
                          {selectedLesson.content_type === 'pdf' && selectedLesson.content_url && (
                            <div>
                              <div style={{
                                borderRadius: token.radiusSm, overflow: 'hidden',
                                border: `1px solid ${token.line}`, marginBottom: 14,
                                height: 420, background: token.surface2
                              }}>
                                <iframe
                                  src={selectedLesson.content_url}
                                  title={selectedLesson.title}
                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                              </div>
                              <a
                                href={selectedLesson.content_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ ...btnPrimary, display: 'inline-block', textDecoration: 'none', marginBottom: 0 }}
                              >
                                📄 Open PDF in new tab ↗
                              </a>
                            </div>
                          )}

                          {/* TEXT content */}
                          {selectedLesson.content_type === 'text' && selectedLesson.content_text && (
                            <div style={{
                              background: token.surface2,
                              border: `1px solid ${token.line}`,
                              borderRadius: token.radiusSm,
                              padding: '20px 22px',
                              fontSize: 14, lineHeight: 1.75,
                              color: token.ink,
                              whiteSpace: 'pre-wrap',
                              fontFamily: fontBody,
                            }}>
                              {selectedLesson.content_text}
                            </div>
                          )}

                          {/* No content fallback */}
                          {!selectedLesson.content_url && !selectedLesson.content_text && (
                            <div style={{ ...emptyState, paddingTop: 24 }}>
                              <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
                              <div>Content for this lesson hasn't been uploaded yet.</div>
                            </div>
                          )}

                          {/* Mark complete prompt */}
                          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${token.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: theme.textMuted }}>Finished this lesson?</span>
                            <button
                              style={btnPrimary}
                              onClick={() => {
                                const parentMod = modules.find(m => m.lessons?.some(l => l.lesson_id === selectedLesson.lesson_id));
                                if (parentMod && parentMod.progress_status !== 'completed') {
                                  handleComplete(parentMod.module_id);
                                }
                                setSelectedLesson(null);
                              }}
                            >
                              ✓ Mark Module Complete
                            </button>
                          </div>
                        </div>
                      )}

                      {!activeQuiz && !quizResult && !assignmentData && !selectedLesson && (
                        <>
                          <div style={card}>
                            <div style={cardHeader}>
                              <div style={cardTitle}>Quizzes & Assignments</div>
                            </div>
                            {quizzes.length === 0
                              ? <div style={emptyStateSmall}>No quizzes yet.</div>
                              : quizzes.map(q => (
                                <div key={q.quiz_id} style={quizItem}>
                                  <div style={{ ...quizIcon, background: q.submission_type !== 'online_quiz' ? 'rgba(167,139,250,0.12)' : 'rgba(108,143,255,0.12)' }}>
                                    {q.submission_type !== 'online_quiz' ? '📎' : '✎'}
                                  </div>
                                  <div style={quizInfo}>
                                    <div style={quizName}>{q.title}</div>
                                    <div style={quizMeta}>
                                      {q.submission_type !== 'online_quiz' ? 'File Upload' : `Attempts: ${q.attempts_taken}/${q.max_attempts}`}
                                    </div>
                                    {q.due_date &&
                                      <div style={{ ...quizMeta, color: theme.accent4 }}>
                                        Due {new Date(q.due_date).toLocaleDateString()}
                                      </div>
                                    }
                                  </div>
                                  {q.submission_type !== 'online_quiz'
                                    ? <button style={{ ...btnSmall, background: theme.accent2 }} onClick={() => handleOpenAssignment(q.quiz_id)}>
                                        {q.attempts_taken > 0 ? 'View / Resubmit' : 'Submit'}
                                      </button>
                                    : q.attempts_taken < q.max_attempts
                                      ? <button style={btnSmall} onClick={() => handleStartQuiz(q.quiz_id)}>Start</button>
                                      : <span style={{ ...quizStatus, ...statusPill('done') }}>Completed</span>
                                  }
                                </div>
                              ))
                            }
                          </div>

                          <div style={{ ...card, marginTop: 16 }}>
                            <div style={cardHeader}>
                              <div style={cardTitle}>My Grades</div>
                            </div>
                            {grades.length === 0
                              ? <div style={emptyStateSmall}>No grades yet.</div>
                              : grades.map(g => (
                                <div key={g.quiz_attempt_id} style={gradeRow}>
                                  <div>
                                    <div style={gradeTitle}>{g.quiz_title}</div>
                                    <div style={{ color: theme.textMuted, fontSize: 11 }}>
                                      {g.status === 'graded' ? 'Graded' : 'Pending'}
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ ...gradeBadge, ...gradeBadgeTone(g) }}>
                                      {g.status === 'graded' ? `${parseFloat(g.score).toFixed(0)}%` : '—'}
                                    </div>
                                    {g.quiz_attempt_id && (
                                      <button style={btnSmall} onClick={() => handleOpenGradeDetail(g.quiz_attempt_id)}>
                                        Detail
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </>
                      )}

                      {/* ── ASSIGNMENT SUBMISSION PANEL ── */}
                      {!activeQuiz && !quizResult && assignmentData && (
                        <div style={{ ...card, marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", color: theme.text }}>
                              📎 {assignmentData.quiz.title}
                            </h3>
                            <button style={btnGhost} onClick={() => setAssignmentData(null)}>← Back</button>
                          </div>

                          {assignmentData.quiz.description && (
                            <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 0, marginBottom: 14 }}>
                              {assignmentData.quiz.description}
                            </p>
                          )}

                          {assignmentData.quiz.due_date && (
                            <div style={{ fontSize: 13, color: assignmentData.deadline_passed ? theme.accent5 : theme.accent4, marginBottom: 14 }}>
                              {assignmentData.deadline_passed ? '⛔ Deadline has passed' : `⏱ Due: ${new Date(assignmentData.quiz.due_date).toLocaleString()}`}
                            </div>
                          )}

                          {/* existing submission */}
                          {assignmentData.submission && (
                            <div style={{ padding: 12, background: theme.surface2, borderRadius: theme.radiusSm, marginBottom: 16, fontSize: 13 }}>
                              <div style={{ fontWeight: 600, color: theme.text, marginBottom: 6 }}>Current Submission</div>
                              <div style={{ color: theme.textMuted }}>
                                Status: <span style={{ color: assignmentData.submission.status === 'graded' ? theme.accent3 : theme.accent4, fontWeight: 600 }}>
                                  {assignmentData.submission.status}
                                </span>
                              </div>
                              {assignmentData.submission.score != null && (
                                <div style={{ color: theme.textMuted }}>
                                  Score: <span style={{ color: theme.accent3, fontWeight: 700 }}>{parseFloat(assignmentData.submission.score).toFixed(1)}%</span>
                                </div>
                              )}
                              {assignmentData.submission.file_url && (
                                <div style={{ marginTop: 6 }}>
                                  <a href={`http://localhost:5000${assignmentData.submission.file_url}`} target="_blank" rel="noreferrer"
                                    style={{ color: theme.accent, fontSize: 13 }}>
                                    📄 View submitted file
                                  </a>
                                </div>
                              )}
                              {assignmentData.submission.feedback && (
                                <div style={{ marginTop: 6, color: theme.textMuted }}>
                                  Feedback: {assignmentData.submission.feedback}
                                </div>
                              )}
                            </div>
                          )}

                          {/* upload form — hidden when deadline passed or already graded */}
                          {!assignmentData.deadline_passed && assignmentData.submission?.status !== 'graded' && (
                            <div>
                              <div style={{ marginBottom: 12 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                                  {assignmentData.submission ? 'Replace Submission (resubmit)' : 'Upload File'}
                                  <span style={{ color: theme.textMuted, fontWeight: 400, marginLeft: 6 }}>
                                    PDF, DOCX, PPTX, ZIP, JPG, PNG · max 50 MB
                                  </span>
                                </label>
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.pptx,.zip,.jpg,.jpeg,.png"
                                  onChange={e => setAssignmentFile(e.target.files[0] || null)}
                                  style={{ display: 'block', fontSize: 13, color: theme.text, width: '100%' }}
                                />
                                {assignmentFile && (
                                  <div style={{ fontSize: 12, color: theme.accent3, marginTop: 4 }}>
                                    Selected: {assignmentFile.name} ({(assignmentFile.size / 1024 / 1024).toFixed(2)} MB)
                                  </div>
                                )}
                              </div>
                              <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
                                  Note (optional)
                                </label>
                                <textarea
                                  style={{ width: '100%', background: theme.surface2, border: `1px solid ${theme.border2}`, borderRadius: theme.radiusSm, padding: '8px 12px', color: theme.text, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
                                  placeholder="Add a note to your instructor…"
                                  value={assignmentNote}
                                  onChange={e => setAssignmentNote(e.target.value)}
                                />
                              </div>
                              <button
                                style={{ ...btnSmall, width: '100%', padding: '10px 0', fontSize: 14, opacity: assignmentUploading ? 0.6 : 1 }}
                                onClick={handleSubmitAssignment}
                                disabled={assignmentUploading}
                              >
                                {assignmentUploading ? 'Uploading…' : assignmentData.submission ? '↑ Resubmit' : '↑ Submit Assignment'}
                              </button>
                            </div>
                          )}

                          {assignmentData.deadline_passed && !assignmentData.submission && (
                            <div style={{ textAlign: 'center', color: theme.accent5, fontSize: 14, padding: '20px 0' }}>
                              The deadline has passed. No submission recorded.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              }
            </div>
          )}

          {/* ── PROGRESS TAB ── */}
          {tab === 'progress' && (
            <div>
              {!progressData ? (
                <Loading label="Loading your progress…" />
              ) : (
                <>
                  {/* GPA & at-risk banner */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ ...statCard, flex: '1 1 180px', borderTop: `2px solid ${progressData.is_at_risk ? theme.accent5 : theme.accent3}` }}>
                      <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Current GPA</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: progressData.gpa != null ? theme.text : theme.textDim, lineHeight: 1 }}>
                        {progressData.gpa != null ? Number(progressData.gpa).toFixed(2) : '—'}
                      </div>
                      {progressData.is_at_risk && (
                        <div style={{ fontSize: 12, color: theme.accent5, marginTop: 8 }}>⚠ At-risk flag active</div>
                      )}
                    </div>
                    <div style={{ ...statCard, flex: '1 1 180px', borderTop: `2px solid ${theme.accent}` }}>
                      <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Active Courses</div>
                      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, color: theme.text, lineHeight: 1 }}>
                        {progressData.courses.filter(c => c.enrollment_status === 'active').length}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {progressData.recommendations?.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                      <div style={sectionTitle}>Recommended Next Steps</div>
                      <div style={card}>
                        {progressData.recommendations.map((r, i) => (
                          <div key={i} style={{ ...quizItem, cursor: r.next_module_id ? 'pointer' : 'default' }}
                            onClick={() => r.next_module_id && setTab('lessons')}>
                            <div style={{ ...quizIcon, background: r.quiz_id ? 'rgba(167,139,250,0.12)' : 'rgba(52,211,153,0.12)' }}>
                              {r.quiz_id ? '✎' : '▶'}
                            </div>
                            <div style={quizInfo}>
                              <div style={quizName}>{r.message}</div>
                              {r.due_date && (
                                <div style={{ ...quizMeta, color: theme.accent4 }}>
                                  Due {new Date(r.due_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            <span style={{ ...quizStatus, ...statusPill(r.quiz_id ? 'due' : 'open') }}>
                              {r.quiz_id ? 'Quiz' : 'Continue'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Per-course breakdown */}
                  <div style={sectionTitle}>Course Breakdown</div>
                  {progressData.courses.length === 0 ? (
                    <div style={emptyState}>No enrolled courses yet.</div>
                  ) : progressData.courses.map((c, ci) => {
                    const tone = courseTones[ci % courseTones.length];
                    const completion = Math.min(100, Math.max(0, Number(c.module_completion_percent) || 0));
                    const avgScore = c.quiz_stats?.avg_score != null ? parseFloat(c.quiz_stats.avg_score).toFixed(1) : null;
                    const bestScore = c.quiz_stats?.best_score != null ? parseFloat(c.quiz_stats.best_score).toFixed(1) : null;
                    return (
                      <div key={c.enrollment_id} style={{ ...card, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 16, color: theme.text, marginBottom: 2 }}>{c.course_title}</div>
                            <div style={{ fontSize: 12, color: theme.textMuted }}>by {c.instructor_name}</div>
                          </div>
                          <span style={statusBadge(c.enrollment_status === 'active' ? 'in_progress' : 'completed')}>
                            {c.enrollment_status}
                          </span>
                        </div>

                        {/* Module completion progress */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                            <span>Module Completion</span>
                            <span style={{ fontWeight: 600, color: theme.text }}>{completion}%</span>
                          </div>
                          <div style={progressBar}>
                            <div style={{ ...progressFill, width: `${completion}%`, background: tone.progress }} />
                          </div>
                        </div>

                        {/* Quiz stats row */}
                        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                          {[
                            { label: 'Attempts', value: c.quiz_stats?.attempts_count ?? 0 },
                            { label: 'Avg Score', value: avgScore != null ? `${avgScore}%` : '—' },
                            { label: 'Best Score', value: bestScore != null ? `${bestScore}%` : '—' },
                          ].map(stat => (
                            <div key={stat.label} style={{ flex: 1, background: theme.surface2, borderRadius: 6, padding: '8px 12px', textAlign: 'center' }}>
                              <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{stat.label}</div>
                              <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{stat.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Module list */}
                        {c.modules?.length > 0 && (
                          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
                            <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Modules</div>
                            {c.modules.map(m => (
                              <div key={m.module_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: `1px solid ${theme.border}` }}>
                                <span style={{ fontSize: 14 }}>
                                  {m.status === 'completed' ? '✅' : m.status === 'in_progress' ? '🔄' : '○'}
                                </span>
                                <div style={{ flex: 1, fontSize: 13, color: theme.text }}>{m.title}</div>
                                <span style={statusBadge(m.status || 'not_started')} />
                                {m.completed_at && (
                                  <div style={{ fontSize: 11, color: theme.textDim }}>{new Date(m.completed_at).toLocaleDateString()}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === 'notifications' && (
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={sectionTitle}>Notifications</div>
                {unreadCount > 0 && (
                  <span style={notifBadge}>{unreadCount} unread</span>
                )}
                {unreadCount > 0 && (
                  <button style={{ ...btnSmall, marginLeft: 'auto' }} onClick={markAllRead}>
                    Mark All as Read
                  </button>
                )}
              </div>
              {notifications.length === 0
                ? <div style={emptyState}>No notifications yet.</div>
                : notifications.map(n => (
                  <div key={n.notification_id} style={{ ...notifItem, ...(n.is_read ? {} : notifItemUnread) }}>
                    <div style={{ ...notifDotSm, background: n.is_read ? theme.textDim : theme.accent5 }} />
                    <div style={{ flex: 1 }}>
                      <div style={notifTitle}>{n.title}</div>
                      <div style={notifMsg}>{n.message}</div>
                      <div style={notifTime}>{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                    {!n.is_read &&
                      <button style={btnSmall} onClick={() => markRead(n.notification_id)}>
                        Mark as Read
                      </button>
                    }
                  </div>
                ))
              }
            </div>
          )}
        </div>
      </div>

      {/* ── GRADE DETAIL MODAL ── */}
      {(gradeDetail || gradeDetailLoading) && (
        <Modal title={gradeDetail ? `${gradeDetail.quiz_title} — Detail` : 'Loading…'} onClose={() => { setGradeDetail(null); setGradeDetailLoading(false); }}>
          {gradeDetailLoading ? (
            <Loading label="Loading detail…" />
          ) : gradeDetail.status === 'pending' ? (
            <div style={{ padding: '20px 0', textAlign: 'center', color: theme.accent4, fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 600 }}>{gradeDetail.message}</div>
              <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 6 }}>{gradeDetail.course_title}</div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Score</div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: gradeDetail.score >= 70 ? theme.accent3 : gradeDetail.score >= 50 ? theme.accent4 : theme.accent5 }}>
                    {parseFloat(gradeDetail.score || 0).toFixed(1)}%
                  </div>
                </div>
                <div style={{ flex: 1, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>Course</div>
                  <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{gradeDetail.course_title}</div>
                </div>
              </div>
              {gradeDetail.overall_feedback && (
                <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: theme.radiusSm, background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.25)', fontSize: 13, color: theme.text }}>
                  📝 {gradeDetail.overall_feedback}
                </div>
              )}
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 12 }}>
                {gradeDetail.answers?.map((a, i) => (
                  <div key={a.answer_id} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Q{i + 1}. {a.question_text}</div>
                    <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 2 }}>
                      Your answer: <strong style={{ color: theme.text }}>{a.user_answer || '(no answer)'}</strong>
                    </div>
                    {a.correct_answer && !a.is_correct && (
                      <div style={{ fontSize: 12, color: theme.accent3, marginBottom: 2 }}>
                        Correct: <strong>{a.correct_answer}</strong>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: a.is_correct ? theme.accent3 : theme.accent5, marginBottom: 2 }}>
                      {a.is_correct ? '✓ Correct' : '✗ Incorrect'} · {a.score_awarded ?? 0}/{a.max_points} pts
                    </div>
                    {a.auto_feedback && (
                      <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, background: theme.surface2, padding: '6px 10px', borderRadius: 6 }}>
                        💡 {a.auto_feedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={() => setShowProfileModal(false)}>
          {profileLoading ? (
            <Loading label="Loading profile…" />
          ) : (
            <>
              {/* Avatar + photo upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                {photoPreview || profile?.photo_url ? (
                  <img src={photoPreview || profile?.photo_url} alt={profileForm.username}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.border}` }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 600 }}>
                    {(profileForm.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={onPhotoChange} style={{ display: 'none' }} />
                  <button type="button" style={{ ...btnPrimary, padding: '7px 12px', fontSize: 12 }} onClick={() => fileInputRef.current?.click()}>
                    Change photo
                  </button>
                  <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>JPG or PNG, up to 5MB.</div>
                </div>
              </div>

              {/* Read-only info */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Email', value: profileData?.email || '—' },
                  { label: 'GPA', value: profileData?.gpa != null ? Number(profileData.gpa).toFixed(2) : '—' },
                  ...(profileData?.advisor_name ? [{ label: 'Advisor', value: profileData.advisor_name }] : []),
                ].map(f => (
                  <div key={f.label} style={{ flex: 1, minWidth: 120, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, color: theme.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {profileData?.is_at_risk && (
                <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: theme.radiusSm, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 12, color: theme.accent5 }}>
                  ⚠ You have been flagged as an at-risk student. Contact your advisor for support.
                </div>
              )}
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, marginBottom: 16 }} />
              {[
                { label: 'Username', key: 'username', type: 'text' },
                { label: 'Phone Number', key: 'phone_number', type: 'text' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={formLabel}>{f.label}</label>
                  <input
                    style={formInput}
                    type={f.type}
                    value={profileForm[f.key] || ''}
                    onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={formLabel}>Department</label>
                <input
                  style={{ ...formInput, opacity: 0.5, cursor: 'not-allowed' }}
                  type="text"
                  value={profileForm.department || ''}
                  readOnly
                />
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 16, marginTop: 4, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Academic Info</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={formLabel}>Academic Level</label>
                  <input
                    style={formInput}
                    type="text"
                    placeholder="e.g. Undergraduate, Postgraduate"
                    value={profileForm.academic_level || ''}
                    onChange={e => setProfileForm({ ...profileForm, academic_level: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={formLabel}>Programme</label>
                  <input
                    style={formInput}
                    type="text"
                    placeholder="e.g. Bachelor of Computer Science"
                    value={profileForm.programme || ''}
                    onChange={e => setProfileForm({ ...profileForm, programme: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={formLabel}>Learning Preferences</label>
                  <textarea
                    style={{ ...formInput, minHeight: 60, resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="e.g. Visual learner, prefer video content…"
                    value={profileForm.learning_preferences || ''}
                    onChange={e => setProfileForm({ ...profileForm, learning_preferences: e.target.value })}
                  />
                </div>
              </div>
              <button style={{ ...btnPrimary, width: '100%' }} onClick={saveProfile}>
                Save Profile
              </button>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── Small components ────────────────────────────────────
function StatCard({ label, value, icon, tone, trend }) {
  const accentColor = {
    blue: token.info,
    green: token.good,
    purple: token.brass,
    orange: token.warn,
  }[tone] || token.ink;

  return (
    <div style={{
      background: token.surface, borderRadius: 10, padding: '16px 20px',
      border: `1px solid ${token.line}`, borderLeft: `4px solid ${accentColor}`, flex: '1 1 180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: token.inkSoft }}>{label}</span>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 600, color: token.ink, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 11, fontWeight: 500, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, color: trend.type === 'down' ? token.danger : token.good }}>
          {trend.type === 'down' ? '⚠' : '↑'} {trend.text}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
const tabEyebrow = (t) => ({
  dashboard: 'Overview',
  courses: 'Catalogue',
  lessons: 'Content',
  progress: 'Analytics',
  notifications: 'Inbox',
}[t] || '');

const tabTitle = (t, course) => ({
  dashboard: 'Dashboard',
  courses: 'Browse Courses',
  lessons: course ? course.title : 'My Lessons',
  progress: 'My Progress',
  notifications: 'Notifications',
}[t] || '');

const statusPill = (type) => ({
  due: { background: 'rgba(249,115,22,0.12)', color: theme.accent4 },
  open: { background: 'rgba(52,211,153,0.12)', color: theme.accent3 },
  done: { background: 'rgba(108,143,255,0.12)', color: theme.accent }
}[type] || { background: theme.surface2, color: theme.textMuted });

function Empty({ children }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{children || 'Nothing here yet.'}</p>;
}
function Loading({ label = 'Loading…' }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{label}</p>;
}

const gradeBadgeTone = (g) => {
  if (g.status !== 'graded') return { background: theme.surface2, color: theme.textMuted };
  if (g.score >= 70) return { background: 'rgba(52,211,153,0.12)', color: theme.accent3 };
  if (g.score >= 50) return { background: 'rgba(249,115,22,0.12)', color: theme.accent4 };
  return { background: 'rgba(251,113,133,0.12)', color: theme.accent5 };
};

// ─── Styles ──────────────────────────────────────────────
const appShell = { display: 'flex', minHeight: '100vh', fontFamily: fontBody, background: theme.bg, color: theme.text };
const sidebar = { width: 240, minWidth: 240, background: token.ink, color: token.surface, display: 'flex', flexDirection: 'column', padding: '28px 0', position: 'fixed', height: '100vh', zIndex: 100, overflowY: 'auto' };
const sidebarLogo = { padding: '0 24px 28px', borderBottom: `1px solid ${token.line}`, marginBottom: 20 };
const logoBadge = { display: 'inline-flex', alignItems: 'center', gap: 10 };
const logoText = { fontFamily: fontDisplay, fontSize: 18, color: token.surface, letterSpacing: -0.3 };
const logoSub = { fontSize: 10, color: token.brassSoft, letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginTop: 1 };
const navSection = { padding: '0 12px', marginBottom: 8 };
const navLabel = { fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: token.brassSoft, padding: '8px 12px', marginBottom: 4 };
const navItem = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: token.radiusSm, color: token.surface, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s ease' };
const navIcon = { width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const main = { marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', background: token.paper };
const topbar = { display: 'flex', alignItems: 'center', gap: 16, padding: '20px 32px', borderBottom: `1px solid ${token.line}`, background: token.paper, position: 'sticky', top: 0, zIndex: 50 };
const pageTitle = { fontFamily: fontDisplay, fontSize: 22, color: token.ink, letterSpacing: -0.3 };
const topbarRight = { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 };
const searchBox = { display: 'flex', alignItems: 'center', gap: 8, background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radiusSm, padding: '8px 14px', width: 240 };
const searchInput = { background: 'none', border: 'none', outline: 'none', color: token.ink, fontFamily: fontBody, fontSize: 13, width: '100%' };
const iconBtn = { width: 38, height: 38, background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: token.inkSoft };
const notifDot = { position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: theme.accent5, borderRadius: '50%', border: `2px solid ${theme.bg}` };
const content = { padding: '28px 32px', flex: 1 };
const greetingTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: theme.text, letterSpacing: -0.5, marginBottom: 4 };
const greetingSub = { fontSize: 14, color: theme.textMuted };
const gridTwoOne = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 };
const courseGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 };
const courseGridWide = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 };
const sectionTitle = { fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 14 };
const card = { background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 };
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 };
const cardTitle = { fontFamily: fontDisplay, fontSize: 16, color: token.ink };
const courseCard = { background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' };
const courseThumb = { height: 90, borderRadius: token.radiusSm, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 };
const courseTag = { fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 };
const courseTitle = { fontSize: 14, fontWeight: 600, color: token.ink, marginBottom: 6, lineHeight: 1.4 };
const courseMeta = { fontSize: 12, color: token.inkSoft, marginBottom: 12 };
const courseDesc = { fontSize: 13, color: token.inkSoft, marginBottom: 14, minHeight: 40 };
const progressBar = { background: token.surface3, borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 6 };
const progressFill = { height: '100%', borderRadius: 4, transition: 'width 1s ease' };
const progressLabel = { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: token.inkSoft };
const quizItem = { display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: token.radiusSm, background: token.surface2, border: `1px solid ${token.line}`, marginBottom: 8 };
const quizIcon = { width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 };
const quizInfo = { flex: 1, minWidth: 0 };
const quizName = { fontSize: 13, fontWeight: 500, color: token.ink, marginBottom: 2 };
const quizMeta = { fontSize: 11, color: token.inkSoft };
const quizStatus = { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' };
const notifItem = { display: 'flex', gap: 12, padding: 12, borderRadius: token.radiusSm, marginBottom: 6, transition: 'background 0.15s', cursor: 'pointer', borderLeft: '3px solid transparent' };
const notifItemUnread = { borderLeftColor: theme.accent, background: 'rgba(108,143,255,0.04)' };
const notifDotSm = { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5 };
const notifTitle = { fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 2 };
const notifMsg = { fontSize: 12, color: theme.textMuted, lineHeight: 1.4 };
const notifTime = { fontSize: 11, color: theme.textDim, marginTop: 3 };
const notifBadge = { background: theme.accent5, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th = { textAlign: 'left', padding: '10px 12px', color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 };
const td = { padding: '10px 12px', borderTop: `1px solid ${theme.border}`, color: theme.text };
const lessonsGrid = { display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: 20 };
const lessonRow = { display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'flex-start' };
const link = { fontSize: 13, color: theme.accent, display: 'inline-block', marginTop: 4, textDecoration: 'none' };
const quizQuestion = { marginBottom: 20, padding: 16, background: theme.surface2, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` };
const radioLabel = { display: 'block', marginBottom: 6, cursor: 'pointer', color: theme.text };
const gradeRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` };
const gradeTitle = { fontWeight: 600, fontSize: 13, color: theme.text };
const gradeBadge = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 26, borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "'DM Serif Display', serif" };
const btnPrimary = { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', border: 'none', borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnGhost = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnSmall = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalBox = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };
const closeBtn = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textMuted };
const formLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6, letterSpacing: 0.5 };
const formInput = { width: '100%', background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '10px 14px', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const emptyState = { textAlign: 'center', padding: '36px 20px', color: theme.textMuted };
const emptyStateSmall = { textAlign: 'left', padding: '12px 4px', color: theme.textDim, fontSize: 12 };
const statCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 20, position: 'relative', overflow: 'hidden' };
const statusBadge = (s) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: { not_started: theme.surface2, in_progress: 'rgba(249,115,22,0.12)', completed: 'rgba(52,211,153,0.12)' }[s] || theme.surface2,
  color: { not_started: theme.textMuted, in_progress: theme.accent4, completed: theme.accent3 }[s] || theme.textMuted
});