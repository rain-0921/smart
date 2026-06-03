import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetUsers, adminAddUser, adminEditUser, adminDeactivateUser,
  adminGetCourses, adminAddCourse, adminEditCourse, adminArchiveCourse,
  adminGetEnrollments, adminAddEnrollment, adminDropEnrollment,
  adminGetReports, adminGetLogs
} from '../services/api';

// ─── small reusable components ───────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: color, borderRadius: 10, padding: '20px 28px', color: '#fff', minWidth: 140 }}>
      <div style={{ fontSize: 32, fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Alert({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontSize: 14,
      background: type === 'error' ? '#fee2e2' : '#dcfce7',
      color: type === 'error' ? '#dc2626' : '#16a34a'
    }}>{msg}</div>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]   = useState('dashboard');

  // shared state
  const [users, setUsers]             = useState([]);
  const [courses, setCourses]         = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [reports, setReports]         = useState(null);
  const [logs, setLogs]               = useState([]);
  const [alert, setAlert]             = useState({ msg: '', type: '' });

  // modal state
  const [showUserModal, setShowUserModal]     = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [editingUser, setEditingUser]         = useState(null);
  const [editingCourse, setEditingCourse]     = useState(null);

  // form state
  const [userForm, setUserForm]     = useState({ username:'', email:'', password:'', role:'student', department:'', phone_number:'', status:'active' });
  const [courseForm, setCourseForm] = useState({ title:'', description:'', instructor_id:'', status:'draft' });
  const [enrollForm, setEnrollForm] = useState({ user_id:'', course_id:'' });

  const showAlert = (msg, type='success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg:'', type:'' }), 3000);
  };

  // fetch data when tab changes
  useEffect(() => {
    if (tab === 'dashboard') adminGetReports().then(r => setReports(r.data)).catch(() => {});
    if (tab === 'users')     adminGetUsers().then(r => setUsers(r.data)).catch(() => {});
    if (tab === 'courses')   adminGetCourses().then(r => setCourses(r.data)).catch(() => {});
    if (tab === 'enrollments') {
      adminGetEnrollments().then(r => setEnrollments(r.data)).catch(() => {});
      adminGetUsers().then(r => setUsers(r.data)).catch(() => {});
      adminGetCourses().then(r => setCourses(r.data)).catch(() => {});
    }
    if (tab === 'logs') adminGetLogs().then(r => setLogs(r.data)).catch(() => {});
  }, [tab]);

  // ── USER CRUD ──
  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({ username:'', email:'', password:'', role:'student', department:'', phone_number:'', status:'active' });
    setShowUserModal(true);
  };
  const openEditUser = (u) => {
    setEditingUser(u);
    setUserForm({ username: u.username, email: u.email, password:'', role: u.role, department: u.department||'', phone_number: u.phone_number||'', status: u.status });
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
    setCourseForm({ title:'', description:'', instructor_id:'', status:'draft' });
    setShowCourseModal(true);
  };
  const openEditCourse = (c) => {
    setEditingCourse(c);
    const inst = users.find(u => u.username === c.instructor_name);
    setCourseForm({ title: c.title, description: c.description||'', instructor_id: inst?.user_id||'', status: c.status });
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

  // ── instructors list for course form ──
  const instructors = users.filter(u => u.role === 'instructor');
  const students    = users.filter(u => u.role === 'student');

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Arial, sans-serif' }}>

      {/* Sidebar */}
      <div style={sidebar}>
        <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 32 }}>
          🎓 SILS Admin
        </div>
        {[
          { key:'dashboard',   label:'📊 Dashboard'   },
          { key:'users',       label:'👥 Users'        },
          { key:'courses',     label:'📚 Courses'      },
          { key:'enrollments', label:'📋 Enrollments'  },
          { key:'logs',        label:'🗒️ Activity Logs' },
        ].map(item => (
          <div key={item.key} onClick={() => setTab(item.key)}
            style={{ ...navItem, background: tab === item.key ? '#2563eb' : 'transparent' }}>
            {item.label}
          </div>
        ))}
        <div onClick={logout} style={{ ...navItem, marginTop: 'auto', color: '#fca5a5' }}>
          🚪 Logout
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32, background: '#f8fafc', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>{tabTitle(tab)}</h2>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Welcome, {user.username}</p>
        </div>

        <Alert msg={alert.msg} type={alert.type} />

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && reports && (
          <div>
            <div style={{ display:'flex', gap: 16, flexWrap:'wrap', marginBottom: 32 }}>
              <StatCard label="Total Users"       value={reports.totalUsers}       color="#2563eb" />
              <StatCard label="Total Courses"     value={reports.totalCourses}     color="#7c3aed" />
              <StatCard label="Total Enrollments" value={reports.totalEnrollments} color="#059669" />
              <StatCard label="Active Students"   value={reports.activeStudents}   color="#d97706" />
            </div>
            <div style={card}>
              <h3 style={{ marginTop:0 }}>Top Courses by Enrollment</h3>
              <table style={table}>
                <thead>
                  <tr>{['Course Title','Enrollments'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
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
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0 }}>All Users</h3>
              <button style={btnPrimary} onClick={openAddUser}>+ Add User</button>
            </div>
            <table style={table}>
              <thead>
                <tr>{['Username','Email','Role','Department','Status','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
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
                        <button style={{ ...btnSmall, background:'#ef4444' }} onClick={() => deactivateUser(u.user_id)}>Deactivate</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── COURSES TAB ── */}
        {tab === 'courses' && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0 }}>All Courses</h3>
              <button style={btnPrimary} onClick={openAddCourse}>+ Add Course</button>
            </div>
            <table style={table}>
              <thead>
                <tr>{['Title','Instructor','Status','Created','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
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
                        <button style={{ ...btnSmall, background:'#f59e0b' }} onClick={() => archiveCourse(c.course_id)}>Archive</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── ENROLLMENTS TAB ── */}
        {tab === 'enrollments' && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0 }}>Student Enrollments</h3>
              <button style={btnPrimary} onClick={() => setShowEnrollModal(true)}>+ Add Enrollment</button>
            </div>
            <table style={table}>
              <thead>
                <tr>{['Student','Email','Course','Status','Enrolled At','Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
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
                        <button style={{ ...btnSmall, background:'#ef4444' }} onClick={() => dropEnrollment(e.enrollment_id)}>Drop</button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── LOGS TAB ── */}
        {tab === 'logs' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>User Activity Logs</h3>
            <table style={table}>
              <thead>
                <tr>{['User','Role','Activity','Description','Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
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

      {/* ── USER MODAL ── */}
      {showUserModal && (
        <Modal title={editingUser ? 'Edit User' : 'Add New User'} onClose={() => setShowUserModal(false)}>
          {[
            { label:'Username', key:'username', type:'text' },
            { label:'Email',    key:'email',    type:'email' },
            ...(!editingUser ? [{ label:'Password', key:'password', type:'password' }] : []),
            { label:'Department', key:'department', type:'text' },
            { label:'Phone',      key:'phone_number', type:'text' },
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
              {['student','instructor','advisor','admin'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {editingUser && (
            <div style={{ marginBottom: 12 }}>
              <label style={formLabel}>Status</label>
              <select style={formInput} value={userForm.status} onChange={e => setUserForm({ ...userForm, status: e.target.value })}>
                {['active','inactive','suspended'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveUser}>
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
                {['draft','published','archived'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveCourse}>
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
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveEnrollment}>
            Add Enrollment
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────
const tabTitle = (t) => ({
  dashboard: '📊 Dashboard Overview',
  users: '👥 Manage Users',
  courses: '📚 Manage Courses',
  enrollments: '📋 Manage Enrollments',
  logs: '🗒️ Activity Logs'
}[t]);

// ─── Styles ──────────────────────────────────────────────
const sidebar  = { width: 220, background: '#1e293b', padding: '28px 16px', display:'flex', flexDirection:'column', gap: 4 };
const navItem  = { padding: '10px 14px', borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', fontSize: 14 };
const card     = { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 24, overflowX: 'auto' };
const table    = { width: '100%', borderCollapse: 'collapse', fontSize: 14 };
const th       = { textAlign: 'left', padding: '10px 12px', background: '#f1f5f9', color: '#475569', fontWeight: 600 };
const td       = { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155' };
const btnPrimary = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const btnSmall   = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, marginRight: 6 };
const overlay    = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalBox   = { background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' };
const closeBtn   = { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#64748b' };
const formLabel  = { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 4 };
const formInput  = { width: '100%', padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' };
const roleBadge  = (r) => ({ display:'inline-block', padding:'2px 10px', borderRadius:99, fontSize:12, fontWeight:600,
  background: {student:'#dbeafe',instructor:'#f3e8ff',advisor:'#dcfce7',admin:'#fee2e2'}[r]||'#f1f5f9',
  color:       {student:'#1d4ed8',instructor:'#7e22ce',advisor:'#15803d',admin:'#dc2626'}[r]||'#334155' });
const statusBadge = (s) => ({ display:'inline-block', padding:'2px 10px', borderRadius:99, fontSize:12, fontWeight:600,
  background: {active:'#dcfce7',inactive:'#f1f5f9',suspended:'#fee2e2',draft:'#fef9c3',published:'#dcfce7',archived:'#f1f5f9',dropped:'#fee2e2',completed:'#dbeafe'}[s]||'#f1f5f9',
  color:       {active:'#15803d',inactive:'#64748b',suspended:'#dc2626',draft:'#854d0e',published:'#15803d',archived:'#64748b',dropped:'#dc2626',completed:'#1d4ed8'}[s]||'#334155' });