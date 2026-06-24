import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetUsers, adminAddUser, adminEditUser, adminDeactivateUser,
  adminGetCourses, adminAddCourse, adminEditCourse, adminArchiveCourse,
  adminGetEnrollments, adminAddEnrollment, adminDropEnrollment,
  adminGetReports, adminGetLogs
} from '../services/api';

/* ════════════════════════════════════════════════════════════
   DESIGN TOKENS
   Admin console variant of the same ledger/register aesthetic:
   warm paper background, deep-ink navy structure, indigo
   primary accent (admin authority), brass reserved for brand.
   ════════════════════════════════════════════════════════════ */
const token = {
  paper:     '#F6F4EE',
  surface:   '#FFFFFF',
  line:      '#E7E2D5',
  ink:       '#1C2541',
  inkSoft:   '#5B6478',
  inkFaint:  '#94A0B4',
  indigo:    '#4F46E5',
  indigoSoft:'#EEF2FF',
  brass:     '#A9792C',
  brassSoft: '#F1E6D2',
  brassDeep: '#7C5A1E',
  danger:    '#B3261E',
  dangerSoft:'#FBEAE9',
  warn:      '#92400E',
  warnSoft:  '#FDF1DF',
  good:      '#1F7A4D',
  goodSoft:  '#E7F5EE',
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

      .adm-root * { box-sizing: border-box; }
      .adm-root { font-family: ${fontBody}; }

      .adm-nav-item { transition: background-color .15s ease, color .15s ease; position: relative; }
      .adm-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
      .adm-nav-item.active::before {
        content: ''; position: absolute; left: -16px; top: 8px; bottom: 8px; width: 3px;
        background: ${token.indigo}; border-radius: 2px;
      }

      .adm-btn { transition: filter .15s ease, transform .1s ease; }
      .adm-btn:hover { filter: brightness(1.08); }
      .adm-btn:active { transform: translateY(1px); }
      .adm-btn:focus-visible, .adm-icon-btn:focus-visible, .adm-row-btn:focus-visible,
      .adm-input:focus-visible, .adm-tab-btn:focus-visible {
        outline: 2px solid ${token.indigo}; outline-offset: 2px;
      }

      .adm-row-btn { transition: background-color .15s ease, border-color .15s ease; }

      .adm-table-row { transition: background-color .12s ease; }
      .adm-table-row:hover { background: ${token.paper} !important; }

      .adm-card { animation: adm-rise .22s ease both; }
      @keyframes adm-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

      .adm-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
      .adm-scroll::-webkit-scrollbar-thumb { background: ${token.line}; border-radius: 8px; }

      .adm-table-wrap { overflow-x: auto; }

      @media (prefers-reduced-motion: reduce) {
        .adm-card { animation: none; }
      }

      @media (max-width: 860px) {
        .adm-sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto;
          padding: 12px !important; position: sticky; top: 0; z-index: 50; }
        .adm-sidebar .adm-brand, .adm-sidebar .adm-spacer, .adm-sidebar .adm-foot { display: none !important; }
        .adm-shell { flex-direction: column !important; }
        .adm-nav-item { white-space: nowrap; }
        .adm-nav-item.active::before { left: 0; top: auto; bottom: -10px; left: 8px; right: 8px; width: auto; height: 3px; }
      }
    `}</style>
  );
}

/* ── Inline SVG icon set ── */
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':    return <svg {...c}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>;
    case 'people':  return <svg {...c}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17.5" cy="9.5" r="2.2" /><path d="M14.6 14.2c2.4.3 4.4 2.1 4.4 4.8" /></svg>;
    case 'trend':   return <svg {...c}><path d="M4 16l5-5 4 3 7-8" /><path d="M15 6h5v5" /></svg>;
    case 'doc':     return <svg {...c}><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></svg>;
    case 'bell':    return <svg {...c}><path d="M7 10a5 5 0 0 1 10 0v4l1.5 2.5h-13L7 14Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
    case 'user':    return <svg {...c}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>;
    case 'logout':  return <svg {...c}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 16l5-4-5-4" /><path d="M19 12H9" /></svg>;
    case 'warn':    return <svg {...c}><path d="M12 4 21 19H3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r=".4" fill={color} /></svg>;
    case 'check':   return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.3 2.3 5-5.3" /></svg>;
    case 'x':       return <svg {...c}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case 'camera':  return <svg {...c}><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13.5" r="3.3" /></svg>;
    case 'spark':   return <svg {...c}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>;
    case 'clipboard': return <svg {...c}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
    default: return null;
  }
}

/* ── Avatar ── */
function initials(name = '') {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';
}
function Avatar({ name, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `${token.indigo}18`, color: token.indigo,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fontDisplay, fontWeight: 600, fontSize: size * 0.38,
      border: `1px solid ${token.indigo}40`,
    }}>{initials(name)}</div>
  );
}

/* ── Alert ── */
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
      <Icon name={ok ? 'check' : 'warn'} size={16} />
      {msg}
    </div>
  );
}

/* ── Modal ── */
function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalBox, maxWidth: wide ? 860 : 480 }} onClick={(e) => e.stopPropagation()} className="adm-scroll adm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} className="adm-icon-btn" style={closeBtn} aria-label="Close">
            <Icon name="x" size={16} color={token.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── StatCard ── */
function StatCard({ label, value, accent = token.ink, icon }) {
  return (
    <div style={{
      background: token.surface, borderRadius: 10, padding: '16px 20px', minWidth: 150,
      border: `1px solid ${token.line}`, borderLeft: `4px solid ${accent}`, flex: '1 1 150px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: token.inkSoft }}>{label}</span>
        {icon && <Icon name={icon} size={15} color={accent} />}
      </div>
      <div style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 600, color: token.ink, marginTop: 6 }}>{value}</div>
    </div>
  );
}

/* ── Empty / Loading states ── */
function Empty({ children }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{children}</p>;
}
function Loading({ label = 'Loading…' }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{label}</p>;
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState('dashboard');
  const [alert, setAlert]         = useState({ msg: '', type: '' });
  const [loading, setLoading]     = useState({});

  // data
  const [reports, setReports]     = useState(null);
  const [users, setUsers]         = useState([]);
  const [courses, setCourses]     = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [logs, setLogs]           = useState([]);   // raw array from backend

  // modals
  const [showUserModal, setShowUserModal]         = useState(false);
  const [showCourseModal, setShowCourseModal]     = useState(false);
  const [showEnrollModal, setShowEnrollModal]     = useState(false);
  const [editingUser, setEditingUser]             = useState(null);
  const [editingCourse, setEditingCourse]         = useState(null);

  // forms
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'student', department: '', phone_number: '', status: 'active' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', instructor_id: '', status: 'draft' });
  const [enrollForm, setEnrollForm] = useState({ user_id: '', course_id: '' });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 3500);
  };

  const withLoading = useCallback(async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); }
    catch (e) { showAlert(e.response?.data?.message || 'Could not load data. Try again.', 'error'); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  }, []);

  // ── fetch on tab change ──
  useEffect(() => {
    if (tab === 'dashboard')   withLoading('dashboard',  async () => setReports((await adminGetReports()).data));
    if (tab === 'users')       withLoading('users',      async () => setUsers((await adminGetUsers()).data));
    if (tab === 'courses')     withLoading('courses',    async () => setCourses((await adminGetCourses()).data));
    if (tab === 'enrollments') withLoading('enrollments', async () => {
      setEnrollments((await adminGetEnrollments()).data);
      setUsers((await adminGetUsers()).data);
      setCourses((await adminGetCourses()).data);
    });
    if (tab === 'logs')        withLoading('logs',        async () => {
      const res = await adminGetLogs();
      // Backend wraps: { isEmpty, message, data }
      setLogs(res.data?.data ?? res.data ?? []);
    });
  }, [tab]);

  // ── USER CRUD ──
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ username: '', email: '', password: '', role: 'student', department: '', phone_number: '', status: 'active' });
    setShowUserModal(true);
  };
  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ username: u.username, email: u.email, password: '', role: u.role, department: u.department || '', phone_number: u.phone_number || '', status: u.status });
    setShowUserModal(true);
  };
  const saveUser = async () => {
    try {
      if (editingUser) { await adminEditUser(editingUser.user_id, userForm); showAlert('User updated'); }
      else             { await adminAddUser(userForm); showAlert('User added'); }
      setShowUserModal(false);
      adminGetUsers().then(r => setUsers(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await adminDeactivateUser(id); showAlert('User deactivated'); adminGetUsers().then(r => setUsers(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // ── COURSE CRUD ──
  const openAddCourse = () => {
    setEditingCourse(null);
    setCourseForm({ title: '', description: '', instructor_id: '', status: 'draft' });
    setShowCourseModal(true);
  };
  const openEditCourse = (c) => {
    setEditingCourse(c);
    const inst = users.find(u => u.username === c.instructor_name);
    setCourseForm({ title: c.title, description: c.description || '', instructor_id: inst?.user_id || '', status: c.status });
    setShowCourseModal(true);
  };
  const saveCourse = async () => {
    try {
      if (editingCourse) { await adminEditCourse(editingCourse.course_id, courseForm); showAlert('Course updated'); }
      else               { await adminAddCourse(courseForm); showAlert('Course created'); }
      setShowCourseModal(false);
      adminGetCourses().then(r => setCourses(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try { await adminArchiveCourse(id); showAlert('Course archived'); adminGetCourses().then(r => setCourses(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // ── ENROLLMENT ──
  const saveEnrollment = async () => {
    try { await adminAddEnrollment(enrollForm); showAlert('Enrollment added'); setShowEnrollModal(false); adminGetEnrollments().then(r => setEnrollments(r.data)); }
    catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const dropEnrollment = async (id) => {
    if (!window.confirm('Drop this enrollment?')) return;
    try { await adminDropEnrollment(id); showAlert('Enrollment dropped'); adminGetEnrollments().then(r => setEnrollments(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  const instructors = users.filter(u => u.role === 'instructor');
  const students     = users.filter(u => u.role === 'student');

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="adm-root">
      <GlobalStyle />
      <div className="adm-shell" style={{ display: 'flex', minHeight: '100vh', background: token.paper }}>

        {/* ── Sidebar ── */}
        <div className="adm-sidebar" style={{ width: 232, background: token.ink, padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div className="adm-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '0 14px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${token.indigo}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 600, color: token.indigo, fontSize: 14,
            }}>A</div>
            <div>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, color: '#fff', fontSize: 16, lineHeight: 1.1 }}>SILS</div>
              <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.12em', color: '#8893A8', textTransform: 'uppercase' }}>Admin console</div>
            </div>
          </div>

          {[
            { key: 'dashboard',    label: 'Dashboard',     icon: 'home' },
            { key: 'users',        label: 'Users',         icon: 'people' },
            { key: 'courses',      label: 'Courses',       icon: 'doc' },
            { key: 'enrollments',  label: 'Enrollments',   icon: 'clipboard' },
            { key: 'logs',         label: 'Activity Logs', icon: 'trend' },
          ].map(item => (
            <div key={item.key} onClick={() => setTab(item.key)}
              className={`adm-nav-item${tab === item.key ? ' active' : ''}`}
              style={{ ...navItem, background: tab === item.key ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === item.key ? '#fff' : '#B7BFCF' }}>
              <Icon name={item.icon} size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
            </div>
          ))}

          <div className="adm-spacer" style={{ flex: 1 }} />

          <div style={{ ...navItem, display: 'flex', alignItems: 'center', gap: 10, color: '#E2A6A1' }} onClick={logout}>
            <Icon name="logout" size={16} /> Log out
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: token.inkFaint, marginBottom: 4 }}>
                {tabEyebrow(tab)}
              </div>
              <h2 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 26 }}>{tabTitle(tab)}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={user?.username || 'Admin'} size={36} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: token.ink }}>{user?.username || 'Admin'}</div>
                <div style={{ fontSize: 11.5, color: token.inkFaint }}>Administrator</div>
              </div>
            </div>
          </div>

          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            loading.dashboard ? <Loading />
              : reports && (
                <div className="adm-card">
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                    <StatCard label="Total Users"      value={reports.totalUsers}      accent={token.ink}     icon="people" />
                    <StatCard label="Total Courses"    value={reports.totalCourses}    accent={token.indigo}  icon="doc" />
                    <StatCard label="Total Enrollments" value={reports.totalEnrollments} accent={token.good}  icon="clipboard" />
                    <StatCard label="Active Students"  value={reports.activeStudents}  accent={token.brass}   icon="spark" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <div style={card}>
                      <h3 style={cardTitle}><Icon name="doc" size={15} color={token.indigo} /> Top Courses by Enrollment</h3>
                      {(reports.courseStats && reports.courseStats.length > 0)
                        ? <div className="adm-table-wrap"><table style={table}>
                            <thead><tr>{['Course Title', 'Enrollments'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                            <tbody>{reports.courseStats.map((c, i) => (
                              <tr key={i} className="adm-table-row">
                                <td style={{ ...td, fontWeight: 600, color: token.ink }}>{c.title}</td>
                                <td style={{ ...td, fontFamily: fontMono, fontWeight: 600 }}>{c.enrollments}</td>
                              </tr>
                            ))}</tbody>
                          </table></div>
                        : <Empty>No course data yet.</Empty>
                      }
                    </div>

                    <div style={card}>
                      <h3 style={cardTitle}><Icon name="bell" size={15} color={token.brass} /> Recent Activity</h3>
                      <Empty>Activity log feed coming soon — check the Activity Logs tab for full history.</Empty>
                    </div>
                  </div>
                </div>
              )
          )}

          {/* ── USERS ── */}
          {tab === 'users' && (
            <div style={card} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ ...cardTitle, margin: 0 }}>All Users</h3>
                <button className="adm-btn" style={btnPrimary} onClick={openAddUser}>+ Add User</button>
              </div>
              {loading.users ? <Loading /> : users.length === 0
                ? <Empty>No users registered yet.</Empty>
                : <div className="adm-table-wrap"><table style={table}>
                    <thead><tr>{['Username', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{users.map(u => (
                      <tr key={u.user_id} className="adm-table-row">
                        <td style={{ ...td, fontWeight: 600, color: token.ink }}>{u.username}</td>
                        <td style={td}>{u.email}</td>
                        <td style={td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                        <td style={td}>{u.department || '—'}</td>
                        <td style={td}><span style={statusBadge(u.status)}>{u.status}</span></td>
                        <td style={td}>
                          <button className="adm-row-btn" style={btnSmall} onClick={() => openEditUser(u)}>Edit</button>
                          {u.status === 'active' &&
                            <button className="adm-row-btn" style={{ ...btnSmall, background: token.danger, color: '#fff' }} onClick={() => deactivateUser(u.user_id)}>Deactivate</button>
                          }
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
              }
            </div>
          )}

          {/* ── COURSES ── */}
          {tab === 'courses' && (
            <div style={card} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ ...cardTitle, margin: 0 }}>All Courses</h3>
                <button className="adm-btn" style={btnPrimary} onClick={openAddCourse}>+ Add Course</button>
              </div>
              {loading.courses ? <Loading /> : courses.length === 0
                ? <Empty>No courses created yet.</Empty>
                : <div className="adm-table-wrap"><table style={table}>
                    <thead><tr>{['Title', 'Instructor', 'Status', 'Created', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{courses.map(c => (
                      <tr key={c.course_id} className="adm-table-row">
                        <td style={{ ...td, fontWeight: 600, color: token.ink }}>{c.title}</td>
                        <td style={td}>{c.instructor_name}</td>
                        <td style={td}><span style={statusBadge(c.status)}>{c.status}</span></td>
                        <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                        <td style={td}>
                          <button className="adm-row-btn" style={btnSmall} onClick={() => openEditCourse(c)}>Edit</button>
                          {c.status !== 'archived' &&
                            <button className="adm-row-btn" style={{ ...btnSmall, background: token.warn, color: '#fff' }} onClick={() => archiveCourse(c.course_id)}>Archive</button>
                          }
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
              }
            </div>
          )}

          {/* ── ENROLLMENTS ── */}
          {tab === 'enrollments' && (
            <div style={card} className="adm-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ ...cardTitle, margin: 0 }}>Student Enrollments</h3>
                <button className="adm-btn" style={btnPrimary} onClick={() => setShowEnrollModal(true)}>+ Add Enrollment</button>
              </div>
              {loading.enrollments ? <Loading /> : enrollments.length === 0
                ? <Empty>No enrollment records yet.</Empty>
                : <div className="adm-table-wrap"><table style={table}>
                    <thead><tr>{['Student', 'Email', 'Course', 'Status', 'Enrolled At', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>{enrollments.map(e => (
                      <tr key={e.enrollment_id} className="adm-table-row">
                        <td style={{ ...td, fontWeight: 600, color: token.ink }}>{e.student_name}</td>
                        <td style={td}>{e.student_email}</td>
                        <td style={td}>{e.course_title}</td>
                        <td style={td}><span style={statusBadge(e.status)}>{e.status}</span></td>
                        <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                        <td style={td}>
                          {e.status === 'active' &&
                            <button className="adm-row-btn" style={{ ...btnSmall, background: token.danger, color: '#fff' }} onClick={() => dropEnrollment(e.enrollment_id)}>Drop</button>
                          }
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
              }
            </div>
          )}

          {/* ── ACTIVITY LOGS ── */}
          {tab === 'logs' && (
            <div style={card} className="adm-card">
              <h3 style={cardTitle}><Icon name="trend" size={15} /> User Activity Logs</h3>
              {loading.logs ? <Loading />
                : logs.length === 0
                  ? <Empty>No activity records found.</Empty>
                  : <div className="adm-table-wrap"><table style={table}>
                      <thead><tr>{['User', 'Role', 'Activity', 'Description', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                      <tbody>{logs.map(l => (
                        <tr key={l.activity_log_id} className="adm-table-row">
                          <td style={{ ...td, fontWeight: 600, color: token.ink }}>{l.username}</td>
                          <td style={td}><span style={roleBadge(l.role)}>{l.role}</span></td>
                          <td style={td}>{l.activity_type}</td>
                          <td style={td}>{l.description}</td>
                          <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(l.created_at).toLocaleString()}</td>
                        </tr>
                      ))}</tbody>
                    </table></div>
              }
            </div>
          )}
        </div>

        {/* ── USER MODAL ── */}
        {showUserModal && (
          <Modal title={editingUser ? 'Edit User' : 'Add New User'} onClose={() => setShowUserModal(false)}>
            {[
              { label: 'Username', key: 'username', type: 'text' },
              { label: 'Email',    key: 'email',    type: 'email' },
              ...(!editingUser ? [{ label: 'Password', key: 'password', type: 'password' }] : []),
              { label: 'Department', key: 'department', type: 'text' },
              { label: 'Phone',      key: 'phone_number', type: 'text' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={formLabel}>{f.label}</label>
                <input className="adm-input" style={formInput} type={f.type} value={userForm[f.key]}
                  onChange={e => setUserForm({ ...userForm, [f.key]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Role</label>
              <select className="adm-input" style={formInput} value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                {['student', 'instructor', 'advisor', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {editingUser && (
              <div style={{ marginBottom: 12 }}>
                <label style={formLabel}>Status</label>
                <select className="adm-input" style={formInput} value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                  {['active', 'inactive', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={saveUser}>
              {editingUser ? 'Update User' : 'Add User'}
            </button>
          </Modal>
        )}

        {/* ── COURSE MODAL ── */}
        {showCourseModal && (
          <Modal title={editingCourse ? 'Edit Course' : 'Add New Course'} onClose={() => setShowCourseModal(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Title</label>
              <input className="adm-input" style={formInput} value={courseForm.title}
                onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Description</label>
              <textarea className="adm-input" style={{ ...formInput, height: 80 }} value={courseForm.description}
                onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Assign Instructor</label>
              <select className="adm-input" style={formInput} value={courseForm.instructor_id}
                onChange={e => setCourseForm({ ...courseForm, instructor_id: e.target.value })}>
                <option value="">-- Select Instructor --</option>
                {instructors.map(i => <option key={i.user_id} value={i.user_id}>{i.username}</option>)}
              </select>
            </div>
            {editingCourse && (
              <div style={{ marginBottom: 12 }}>
                <label style={formLabel}>Status</label>
                <select className="adm-input" style={formInput} value={courseForm.status}
                  onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}>
                  {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={saveCourse}>
              {editingCourse ? 'Update Course' : 'Create Course'}
            </button>
          </Modal>
        )}

        {/* ── ENROLLMENT MODAL ── */}
        {showEnrollModal && (
          <Modal title="Add Enrollment" onClose={() => setShowEnrollModal(false)}>
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Student</label>
              <select className="adm-input" style={formInput} value={enrollForm.user_id}
                onChange={e => setEnrollForm({ ...enrollForm, user_id: e.target.value })}>
                <option value="">-- Select Student --</option>
                {students.map(s => <option key={s.user_id} value={s.user_id}>{s.username} ({s.email})</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Course</label>
              <select className="adm-input" style={formInput} value={enrollForm.course_id}
                onChange={e => setEnrollForm({ ...enrollForm, course_id: e.target.value })}>
                <option value="">-- Select Course --</option>
                {courses.filter(c => c.status === 'published').map(c =>
                  <option key={c.course_id} value={c.course_id}>{c.title}</option>
                )}
              </select>
            </div>
            <button className="adm-btn" style={{ ...btnPrimary, width: '100%' }} onClick={saveEnrollment}>
              Add Enrollment
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   STYLES & HELPERS
   ════════════════════════════════════════════════════════════ */
const tabEyebrow = (t) => ({
  dashboard: 'Overview', users: 'Management', courses: 'Catalogue',
  enrollments: 'Registrations', logs: 'Audit',
}[t] || '');
const tabTitle = (t) => ({
  dashboard: 'Dashboard', users: 'Users', courses: 'Courses',
  enrollments: 'Student Enrollments', logs: 'Activity Logs',
}[t] || '');

const navItem    = { padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 };
const card       = { background: token.surface, borderRadius: 12, padding: 22, border: `1px solid ${token.line}` };
const cardTitle  = { marginTop: 0, marginBottom: 16, fontSize: 15, fontFamily: fontDisplay, fontWeight: 600, color: token.ink };
const table      = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 };
const th         = { textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` };
const td         = { padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink };
const btnPrimary = { background: token.indigo, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const btnSmall   = { background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 };
const overlay    = { position: 'fixed', inset: 0, background: 'rgba(28,37,65,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalBox   = { background: token.surface, borderRadius: 14, padding: 30, width: '100%', maxHeight: '88vh', overflowY: 'auto' };
const closeBtn   = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, lineHeight: 0 };
const formLabel  = { display: 'block', fontSize: 12.5, fontWeight: 600, color: token.inkSoft, marginBottom: 5 };
const formInput  = { width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: fontBody, color: token.ink };
const roleBadge = (r) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { student: token.indigoSoft, instructor: '#F3E8FF', advisor: token.goodSoft, admin: token.brassSoft }[r] || token.line,
  color: { student: token.indigo, instructor: '#7C3AED', advisor: token.good, admin: token.brass }[r] || token.inkSoft,
});
const statusBadge = (s) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { active: token.goodSoft, inactive: token.line, suspended: token.dangerSoft, draft: token.warnSoft, published: token.goodSoft, archived: token.line }[s] || token.line,
  color: { active: token.good, inactive: token.inkSoft, suspended: token.danger, draft: token.warn, published: token.good, archived: token.inkSoft }[s] || token.inkSoft,
});
