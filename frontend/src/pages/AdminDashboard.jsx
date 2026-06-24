import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetUsers, adminAddUser, adminEditUser, adminDeactivateUser,
  adminGetCourses, adminAddCourse, adminEditCourse, adminArchiveCourse,
  adminGetEnrollments, adminAddEnrollment, adminDropEnrollment,
  adminGetReports, adminGetLogs
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

function Modal({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div style={modalBox}>
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
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState('dashboard');
  const [alert, setAlert] = useState({ msg: '', type: '' });

  // data
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [reports, setReports] = useState(null);
  const [logs, setLogs] = useState([]);

  // modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);

  // forms
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'student', department: '', phone_number: '', status: 'active' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', instructor_id: '', status: 'draft' });
  const [enrollForm, setEnrollForm] = useState({ user_id: '', course_id: '' });

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 3000);
  };

  // fetch data when page changes
  useEffect(() => {
    if (page === 'dashboard') adminGetReports().then(r => setReports(r.data)).catch(() => {});
    if (page === 'users') adminGetUsers().then(r => setUsers(r.data)).catch(() => {});
    if (page === 'courses') adminGetCourses().then(r => setCourses(r.data)).catch(() => {});
    if (page === 'enrollments') {
      adminGetEnrollments().then(r => setEnrollments(r.data)).catch(() => {});
      adminGetUsers().then(r => setUsers(r.data)).catch(() => {});
      adminGetCourses().then(r => setCourses(r.data)).catch(() => {});
    }
    if (page === 'logs') adminGetLogs().then(r => setLogs(r.data)).catch(() => {});
  }, [page]);

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
      if (editingUser) {
        await adminEditUser(editingUser.user_id, userForm);
        showAlert('User updated successfully');
      } else {
        await adminAddUser(userForm);
        showAlert('User added successfully');
      }
      setShowUserModal(false);
      adminGetUsers().then(r => setUsers(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to save user', 'error');
    }
  };
  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await adminDeactivateUser(id);
      showAlert('User deactivated');
      adminGetUsers().then(r => setUsers(r.data));
    } catch { showAlert('Failed', 'error'); }
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
      if (editingCourse) {
        await adminEditCourse(editingCourse.course_id, courseForm);
        showAlert('Course updated successfully');
      } else {
        await adminAddCourse(courseForm);
        showAlert('Course created successfully');
      }
      setShowCourseModal(false);
      adminGetCourses().then(r => setCourses(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to save course', 'error');
    }
  };
  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try {
      await adminArchiveCourse(id);
      showAlert('Course archived');
      adminGetCourses().then(r => setCourses(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // ── ENROLLMENT ──
  const saveEnrollment = async () => {
    try {
      await adminAddEnrollment(enrollForm);
      showAlert('Enrollment added successfully');
      setShowEnrollModal(false);
      adminGetEnrollments().then(r => setEnrollments(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed', 'error');
    }
  };
  const dropEnrollment = async (id) => {
    if (!window.confirm('Drop this enrollment?')) return;
    try {
      await adminDropEnrollment(id);
      showAlert('Enrollment dropped');
      adminGetEnrollments().then(r => setEnrollments(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  const instructors = users.filter(u => u.role === 'instructor');
  const students = users.filter(u => u.role === 'student');

  // Navigation config
  const navSections = [
    {
      label: 'Main',
      items: [
        { icon: '📊', label: 'Dashboard', onClick: () => setPage('dashboard'), isActive: page === 'dashboard' },
        { icon: '👥', label: 'Users', onClick: () => setPage('users'), isActive: page === 'users' },
        { icon: '📚', label: 'Courses', onClick: () => setPage('courses'), isActive: page === 'courses' },
      ]
    },
    {
      label: 'Management',
      items: [
        { icon: '📋', label: 'Enrollments', onClick: () => setPage('enrollments'), isActive: page === 'enrollments' },
        { icon: '🗒️', label: 'Activity Logs', onClick: () => setPage('logs'), isActive: page === 'logs' },
      ]
    },
    {
      label: 'Personal',
      items: [
        { icon: '👤', label: 'Profile', onClick: () => { }, isActive: false },
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
              <span style={logoSub}>Admin</span>
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
            <div style={avatar}>A</div>
            <div style={userInfo}>
              <div style={userName}>{user?.username || 'Admin'}</div>
              <div style={userRole}>Administrator</div>
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
            {page === 'users' && '👥 Users'}
            {page === 'courses' && '📚 Courses'}
            {page === 'enrollments' && '📋 Enrollments'}
            {page === 'logs' && '🗒️ Logs'}
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
              <span style={notifDot}></span>
            </button>
            <div style={miniAvatar}>A</div>
          </div>
        </div>

        {/* Content */}
        <div style={content}>
          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD ── */}
          {page === 'dashboard' && reports && (
            <div>
              <div style={statsGrid}>
                <StatCard label="Total Users" value={reports.totalUsers} tone="blue" />
                <StatCard label="Total Courses" value={reports.totalCourses} tone="purple" />
                <StatCard label="Total Enrollments" value={reports.totalEnrollments} tone="green" />
                <StatCard label="Active Students" value={reports.activeStudents} tone="orange" />
              </div>

              <div style={card}>
                <div style={cardHeader}>
                  <h3 style={cardTitle}>Top Courses by Enrollment</h3>
                </div>
                {(reports.courseStats && reports.courseStats.length > 0) ? (
                  <table style={table}>
                    <thead>
                      <tr>{['Course Title', 'Enrollments'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {reports.courseStats.map((c, i) => (
                        <tr key={i}>
                          <td style={td}>{c.title}</td>
                          <td style={td}>{c.enrollments}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p style={{ color: theme.textMuted, fontSize: 13 }}>No course data yet.</p>
                )}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {page === 'users' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>All Users</h3>
                <button style={btnPrimary} onClick={openAddUser}>+ Add User</button>
              </div>
              <table style={table}>
                <thead>
                  <tr>{['Username', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.user_id}>
                      <td style={td}>{u.username}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                      <td style={td}>{u.department || '—'}</td>
                      <td style={td}><span style={statusBadge(u.status)}>{u.status}</span></td>
                      <td style={td}>
                        <button style={btnSmall} onClick={() => openEditUser(u)}>Edit</button>
                        {u.status === 'active' &&
                          <button style={{ ...btnSmall, background: theme.accent5 }} onClick={() => deactivateUser(u.user_id)}>Deactivate</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── COURSES ── */}
          {page === 'courses' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>All Courses</h3>
                <button style={btnPrimary} onClick={openAddCourse}>+ Add Course</button>
              </div>
              <table style={table}>
                <thead>
                  <tr>{['Title', 'Instructor', 'Status', 'Created', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.course_id}>
                      <td style={td}>{c.title}</td>
                      <td style={td}>{c.instructor_name}</td>
                      <td style={td}><span style={statusBadge(c.status)}>{c.status}</span></td>
                      <td style={td}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td style={td}>
                        <button style={btnSmall} onClick={() => openEditCourse(c)}>Edit</button>
                        {c.status !== 'archived' &&
                          <button style={{ ...btnSmall, background: theme.accent4 }} onClick={() => archiveCourse(c.course_id)}>Archive</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── ENROLLMENTS ── */}
          {page === 'enrollments' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>Student Enrollments</h3>
                <button style={btnPrimary} onClick={() => setShowEnrollModal(true)}>+ Add Enrollment</button>
              </div>
              <table style={table}>
                <thead>
                  <tr>{['Student', 'Email', 'Course', 'Status', 'Enrolled At', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.enrollment_id}>
                      <td style={td}>{e.student_name}</td>
                      <td style={td}>{e.student_email}</td>
                      <td style={td}>{e.course_title}</td>
                      <td style={td}><span style={statusBadge(e.status)}>{e.status}</span></td>
                      <td style={td}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                      <td style={td}>
                        {e.status === 'active' &&
                          <button style={{ ...btnSmall, background: theme.accent5 }} onClick={() => dropEnrollment(e.enrollment_id)}>Drop</button>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── LOGS ── */}
          {page === 'logs' && (
            <div style={card}>
              <div style={cardHeader}>
                <h3 style={cardTitle}>User Activity Logs</h3>
              </div>
              <table style={table}>
                <thead>
                  <tr>{['User', 'Role', 'Activity', 'Description', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.activity_log_id}>
                      <td style={td}>{l.username}</td>
                      <td style={td}><span style={roleBadge(l.role)}>{l.role}</span></td>
                      <td style={td}>{l.activity_type}</td>
                      <td style={td}>{l.description}</td>
                      <td style={td}>{new Date(l.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── USER MODAL ── */}
      {showUserModal && (
        <Modal title={editingUser ? 'Edit User' : 'Add New User'} onClose={() => setShowUserModal(false)}>
          {[
            { label: 'Username', key: 'username', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            ...(!editingUser ? [{ label: 'Password', key: 'password', type: 'password' }] : []),
            { label: 'Department', key: 'department', type: 'text' },
            { label: 'Phone', key: 'phone_number', type: 'text' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} type={f.type} value={userForm[f.key]}
                onChange={e => setUserForm({ ...userForm, [f.key]: e.target.value })} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Role</label>
            <select style={formInput} value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
              {['student', 'instructor', 'advisor', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {editingUser && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Status</label>
              <select style={formInput} value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                {['active', 'inactive', 'suspended'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveUser}>
            {editingUser ? 'Update User' : 'Add User'}
          </button>
        </Modal>
      )}

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <Modal title={editingCourse ? 'Edit Course' : 'Add New Course'} onClose={() => setShowCourseModal(false)}>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Title</label>
            <input style={formInput} value={courseForm.title}
              onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Description</label>
            <textarea style={{ ...formInput, height: 80 }} value={courseForm.description}
              onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Assign Instructor</label>
            <select style={formInput} value={courseForm.instructor_id}
              onChange={e => setCourseForm({ ...courseForm, instructor_id: e.target.value })}>
              <option value="">-- Select Instructor --</option>
              {instructors.map(i => <option key={i.user_id} value={i.user_id}>{i.username}</option>)}
            </select>
          </div>
          {editingCourse && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Status</label>
              <select style={formInput} value={courseForm.status}
                onChange={e => setCourseForm({ ...courseForm, status: e.target.value })}>
                {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveCourse}>
            {editingCourse ? 'Update Course' : 'Create Course'}
          </button>
        </Modal>
      )}

      {/* ── ENROLLMENT MODAL ── */}
      {showEnrollModal && (
        <Modal title="Add Enrollment" onClose={() => setShowEnrollModal(false)}>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Student</label>
            <select style={formInput} value={enrollForm.user_id}
              onChange={e => setEnrollForm({ ...enrollForm, user_id: e.target.value })}>
              <option value="">-- Select Student --</option>
              {students.map(s => <option key={s.user_id} value={s.user_id}>{s.username} ({s.email})</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={formLabel}>Course</label>
            <select style={formInput} value={enrollForm.course_id}
              onChange={e => setEnrollForm({ ...enrollForm, course_id: e.target.value })}>
              <option value="">-- Select Course --</option>
              {courses.filter(c => c.status === 'published').map(c => (
                <option key={c.course_id} value={c.course_id}>{c.title}</option>
              ))}
            </select>
          </div>
          <button style={{ ...btnPrimary, width: '100%' }} onClick={saveEnrollment}>
            Add Enrollment
          </button>
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
const sectionTitle = { fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 14 };
const card = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 22, marginBottom: 28 };
const cardHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 };
const cardTitle = { fontFamily: "'DM Serif Display', serif", fontSize: 16, color: theme.text, margin: 0 };
const table = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
const th = { textAlign: 'left', padding: '10px 12px', color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11, borderBottom: `1px solid ${theme.border}` };
const td = { padding: '10px 12px', borderTop: `1px solid ${theme.border}`, color: theme.text };
const btnPrimary = { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', border: 'none', borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
const btnSmall = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500, marginRight: 4 };
const alertBox = { padding: '10px 14px', borderRadius: theme.radiusSm, marginBottom: 14, fontSize: 13, border: `1px solid ${theme.border}` };
const overlay = { position: 'fixed', inset: 0, background: 'rgba(13,15,20,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' };
const modalBox = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' };
const closeBtn = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: theme.textMuted };
const formLabel = { display: 'block', fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6, letterSpacing: 0.5 };
const formInput = { width: '100%', background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '10px 14px', color: theme.text, fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: 'none', boxSizing: 'border-box' };
const statCard = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 20, position: 'relative', overflow: 'hidden' };
const roleBadge = (r) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
  background: { student: 'rgba(108,143,255,0.1)', instructor: 'rgba(167,139,250,0.1)', advisor: 'rgba(52,211,153,0.1)', admin: 'rgba(249,115,22,0.1)' }[r] || theme.surface2,
  color: { student: theme.accent, instructor: theme.accent2, advisor: theme.accent3, admin: theme.accent4 }[r] || theme.textMuted
});
const statusBadge = (s) => ({
  display: 'inline-block', padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600,
  background: { active: 'rgba(52,211,153,0.1)', inactive: 'rgba(122,127,148,0.1)', suspended: 'rgba(251,113,133,0.1)', draft: 'rgba(249,115,22,0.1)', published: 'rgba(52,211,153,0.1)', archived: 'rgba(122,127,148,0.1)' }[s] || theme.surface2,
  color: { active: theme.accent3, inactive: theme.textMuted, suspended: theme.accent5, draft: theme.accent4, published: theme.accent3, archived: theme.textMuted }[s] || theme.textMuted
});
