import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  studentGetDashboard, studentGetProfile, studentUpdateProfile,
  studentGetCourses, studentEnroll, studentGetModules, studentCompleteLesson,
  studentGetQuizzes, studentStartQuiz, studentSubmitQuiz,
  studentGetAssignment, studentSubmitAssignment,
  studentGetGrades, studentGetNotifications, studentMarkRead
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

const courseTones = [
  {
    thumb: 'linear-gradient(135deg,#1a237e,#283593)',
    tagBg: 'rgba(108,143,255,0.1)',
    tagColor: theme.accent,
    progress: 'linear-gradient(90deg,#6c8fff,#a78bfa)'
  },
  {
    thumb: 'linear-gradient(135deg,#1a3320,#2e7d32)',
    tagBg: 'rgba(52,211,153,0.1)',
    tagColor: theme.accent3,
    progress: 'linear-gradient(90deg,#34d399,#0891b2)'
  },
  {
    thumb: 'linear-gradient(135deg,#3e1f00,#7c4d00)',
    tagBg: 'rgba(249,115,22,0.1)',
    tagColor: theme.accent4,
    progress: 'linear-gradient(90deg,#f97316,#f59e0b)'
  },
  {
    thumb: 'linear-gradient(135deg,#2d004f,#6a0080)',
    tagBg: 'rgba(167,139,250,0.1)',
    tagColor: theme.accent2,
    progress: 'linear-gradient(90deg,#a78bfa,#fb7185)'
  }
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
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

function Modal({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif" }}>{title}</h3>
          <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
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

  // selected course context
  const [selectedCourse, setSelectedCourse] = useState(null);

  // quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  // assignment (file_upload) state
  const [assignmentData, setAssignmentData] = useState(null); // { quiz, question, submission, deadline_passed }
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [assignmentUploading, setAssignmentUploading] = useState(false);

  // profile form
  const [profileForm, setProfileForm] = useState({});
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    setModules([]);
    setQuizzes([]);
    setGrades([]);
    setTab('lessons');
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

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // ── Profile ──
  const openProfile = async () => {
    setProfileLoading(true);
    setShowProfileModal(true);
    try {
      const res = await studentGetProfile();
      setProfileData(res.data);
      setProfileForm({
        username: res.data.username || '',
        phone_number: res.data.phone_number || '',
        email: res.data.email || '',
        department: res.data.department || '',
      });
    } catch {
      showAlert('Failed to load profile', 'error');
      setShowProfileModal(false);
    } finally {
      setProfileLoading(false);
    }
  };
  const saveProfile = async () => {
    try {
      await studentUpdateProfile(profileForm);
      showAlert('Profile updated successfully!');
      setShowProfileModal(false);
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
    <div style={appShell}>
      {/* Sidebar */}
      <nav style={sidebar}>
        <div style={sidebarLogo}>
          <div style={logoBadge}>
            <div style={logoIcon}>🎓</div>
            <div>
              <div style={logoText}>SILS</div>
              <span style={logoSub}>Learning System</span>
            </div>
          </div>
        </div>

        <div style={navSection}>
          <div style={navLabel}>Main</div>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: '⊞' },
            { key: 'courses', label: 'Browse Courses', icon: '📚' },
            { key: 'lessons', label: 'My Lessons', icon: '▶' }
          ].map(item => (
            <div
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{ ...navItem, ...(tab === item.key ? navItemActive : {}) }}
            >
              <span style={navIcon}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div style={navSection}>
          <div style={navLabel}>Personal</div>
          <div
            onClick={() => setTab('notifications')}
            style={{ ...navItem, ...(tab === 'notifications' ? navItemActive : {}) }}
          >
            <span style={navIcon}>🔔</span>
            Notifications
            {unreadCount > 0 && <span style={navBadge}>{unreadCount}</span>}
          </div>
          <div onClick={openProfile} style={navItem}>
            <span style={navIcon}>◑</span>
            Profile
          </div>
          <div onClick={logout} style={{ ...navItem, color: theme.accent5 }}>
            <span style={navIcon}>🚪</span>
            Logout
          </div>
        </div>


      </nav>

      {/* Main */}
      <div style={main}>
        <header style={topbar}>
          <div style={pageTitle}>{tabTitle(tab, selectedCourse)}</div>
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
              🔔
              {unreadCount > 0 && <span style={notifDot} />}
            </button>
            <button style={iconBtn} onClick={openProfile} aria-label="Profile">
              <div style={miniAvatar}>{user.username?.[0]?.toUpperCase() || 'S'}</div>
            </button>
          </div>
        </header>

        <div style={content}>
          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && !dashboard && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: theme.textMuted }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div style={{ fontSize: 14 }}>Loading your dashboard…</div>
            </div>
          )}
          {tab === 'dashboard' && dashboard && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={greetingTitle}>{getGreeting()}, {user.username} 👋</h2>
                <p style={greetingSub}>
                  You have {deadlinesCount} upcoming {deadlinesCount === 1 ? 'deadline' : 'deadlines'}. Keep going!
                </p>
              </div>

              <div style={statsGrid}>
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
              </div>

              <div style={gridTwoOne}>
                <div>
                  <div style={sectionTitle}>Continue Learning</div>
                  {dashboard.enrollments.length === 0 ? (
                    <div style={emptyState}>No courses yet. Browse the catalogue!</div>
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
                            <tr key={i}>
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
                              <div key={l.lesson_id} style={lessonRow}>
                                <span style={{ fontSize: 16 }}>
                                  {l.content_type === 'video' ? '🎬' : l.content_type === 'pdf' ? '📄' : '📝'}
                                </span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                                  {l.duration_minutes &&
                                    <div style={{ fontSize: 12, color: theme.textDim }}>{l.duration_minutes} min</div>
                                  }
                                  {l.content_url &&
                                    <a href={l.content_url} target="_blank" rel="noreferrer" style={link}>
                                      Open Content ↗
                                    </a>
                                  }
                                  {l.content_text &&
                                    <div style={lessonText}>
                                      {l.content_text}
                                    </div>
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

                      {!activeQuiz && !quizResult && !assignmentData && (
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
                                  <div style={{ ...gradeBadge, ...gradeBadgeTone(g) }}>
                                    {g.status === 'graded' ? `${parseFloat(g.score).toFixed(0)}%` : '—'}
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

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={() => setShowProfileModal(false)}>
          {profileLoading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: theme.textMuted }}>
              Loading profile…
            </div>
          ) : (
            <>
              {/* Read-only info */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Email', value: profileData?.email || '—' },
                ].map(f => (
                  <div key={f.label} style={{ flex: 1, background: theme.surface2, borderRadius: theme.radiusSm, padding: '10px 14px', border: `1px solid ${theme.border}` }}>
                    <div style={{ fontSize: 10, color: theme.textDim, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{f.value}</div>
                  </div>
                ))}
              </div>
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
  const palette = {
    blue: { accent: theme.accent, iconBg: 'rgba(108,143,255,0.12)' },
    green: { accent: theme.accent3, iconBg: 'rgba(52,211,153,0.12)' },
    purple: { accent: theme.accent2, iconBg: 'rgba(167,139,250,0.12)' },
    orange: { accent: theme.accent4, iconBg: 'rgba(249,115,22,0.12)' }
  }[tone] || { accent: theme.accent, iconBg: 'rgba(108,143,255,0.12)' };

  return (
    <div style={{ ...statCard, borderTop: `2px solid ${palette.accent}` }}>
      <div style={{ ...statIcon, background: palette.iconBg }}>{icon}</div>
      <div style={statValue}>{value}</div>
      <div style={statLabel}>{label}</div>
      {trend && (
        <div style={{
          ...statTrend,
          color: trend.type === 'down' ? theme.accent5 : theme.accent3
        }}>
          {trend.type === 'down' ? '⚠' : '↑'} {trend.text}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
const tabTitle = (t, course) => ({
  dashboard: 'Dashboard',
  courses: 'Browse Courses',
  lessons: course ? course.title : 'My Lessons',
  notifications: 'Notifications',
}[t] || '');

const statusPill = (type) => ({
  due: { background: 'rgba(249,115,22,0.12)', color: theme.accent4 },
  open: { background: 'rgba(52,211,153,0.12)', color: theme.accent3 },
  done: { background: 'rgba(108,143,255,0.12)', color: theme.accent }
}[type] || { background: theme.surface2, color: theme.textMuted });

const gradeBadgeTone = (g) => {
  if (g.status !== 'graded') return { background: theme.surface2, color: theme.textMuted };
  if (g.score >= 70) return { background: 'rgba(52,211,153,0.12)', color: theme.accent3 };
  if (g.score >= 50) return { background: 'rgba(249,115,22,0.12)', color: theme.accent4 };
  return { background: 'rgba(251,113,133,0.12)', color: theme.accent5 };
};

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
const navItem = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: theme.radiusSm, color: theme.textMuted, fontSize: 14, cursor: 'pointer', transition: 'all 0.15s ease' };
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
const pageTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 22, color: theme.text, letterSpacing: -0.3 };
const topbarRight = { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 };
const searchBox = { display: 'flex', alignItems: 'center', gap: 8, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '8px 14px', width: 240 };
const searchInput = { background: 'none', border: 'none', outline: 'none', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, width: '100%' };
const iconBtn = { width: 38, height: 38, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', color: theme.textMuted };
const notifDot = { position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: theme.accent5, borderRadius: '50%', border: `2px solid ${theme.bg}` };
const miniAvatar = { width: 26, height: 26, borderRadius: 6, background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff' };
const content = { padding: '28px 32px', flex: 1 };
const greetingTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 26, color: theme.text, letterSpacing: -0.5, marginBottom: 4 };
const greetingSub = { fontSize: 14, color: theme.textMuted };
const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 };
const gridTwoOne = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 };
const courseGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 };
const courseGridWide = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 };
const sectionTitle = { fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 14 };
const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 22 };
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 };
const cardTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: theme.text };
const courseCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' };
const courseThumb = { height: 90, borderRadius: theme.radiusSm, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 };
const courseTag = { fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 };
const courseTitle = { fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 6, lineHeight: 1.4 };
const courseMeta = { fontSize: 12, color: theme.textMuted, marginBottom: 12 };
const courseDesc = { fontSize: 13, color: theme.textMuted, marginBottom: 14, minHeight: 40 };
const progressBar = { background: theme.surface3, borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 6 };
const progressFill = { height: '100%', borderRadius: 4, transition: 'width 1s ease' };
const progressLabel = { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: theme.textMuted };
const quizItem = { display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: theme.radiusSm, background: theme.surface2, border: `1px solid ${theme.border}`, marginBottom: 8 };
const quizIcon = { width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 };
const quizInfo = { flex: 1, minWidth: 0 };
const quizName = { fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 2 };
const quizMeta = { fontSize: 11, color: theme.textMuted };
const quizStatus = { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' };
const notifItem = { display: 'flex', gap: 12, padding: 12, borderRadius: theme.radiusSm, marginBottom: 6, transition: 'background 0.15s', cursor: 'pointer', borderLeft: '3px solid transparent' };
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
const lessonText = { fontSize: 13, color: theme.textMuted, marginTop: 6, background: theme.surface2, padding: 10, borderRadius: 6 };
const link = { fontSize: 13, color: theme.accent, display: 'inline-block', marginTop: 4, textDecoration: 'none' };
const quizQuestion = { marginBottom: 20, padding: 16, background: theme.surface2, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` };
const radioLabel = { display: 'block', marginBottom: 6, cursor: 'pointer', color: theme.text };
const gradeRow = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` };
const gradeTitle = { fontWeight: 600, fontSize: 13, color: theme.text };
const gradeBadge = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 26, borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: "'DM Serif Display', serif" };
const btnPrimary = { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', border: 'none', borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnGhost = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnSmall = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 };
const alertBox = { padding: '10px 14px', borderRadius: theme.radiusSm, marginBottom: 14, fontSize: 13, border: `1px solid ${theme.border}` };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalBox = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };
const closeBtn = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textMuted };
const formLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6, letterSpacing: 0.5 };
const formInput = { width: '100%', background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '10px 14px', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const emptyState = { textAlign: 'center', padding: '36px 20px', color: theme.textMuted };
const emptyStateSmall = { textAlign: 'left', padding: '12px 4px', color: theme.textDim, fontSize: 12 };
const statCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 20, position: 'relative', overflow: 'hidden' };
const statIcon = { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginBottom: 14 };
const statValue = { fontFamily: "'DM Serif Display', serif", fontSize: 28, color: theme.text, letterSpacing: -0.5, lineHeight: 1, marginBottom: 4 };
const statLabel = { fontSize: 13, color: theme.textMuted };
const statTrend = { fontSize: 11, fontWeight: 500, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4 };
const statusBadge = (s) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: { not_started: theme.surface2, in_progress: 'rgba(249,115,22,0.12)', completed: 'rgba(52,211,153,0.12)' }[s] || theme.surface2,
  color: { not_started: theme.textMuted, in_progress: theme.accent4, completed: theme.accent3 }[s] || theme.textMuted
});