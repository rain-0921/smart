import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  adminGetUsers, adminAddUser, adminEditUser, adminDeactivateUser, adminGetDepartments,
  adminGetCourses, adminAddCourse, adminEditCourse, adminArchiveCourse,
  adminGetEnrollments, adminAddEnrollment, adminEditEnrollment, adminDropEnrollment,
  adminGetReports, adminExportReports, adminGetReportTypes, adminGetDashboard, adminGetLogs, adminGetLogFilters, adminGetLogUsers,
  adminExportLogs, adminGetNotifications, adminCreateNotification,
  adminEditNotification, adminDeleteNotification,
  adminGetStudentsWithAdvisor, adminGetAdvisors, adminAssignAdvisor,
} from '../services/api';
import { Alert } from '../components/shared';
import { DashboardShell, Sidebar, Header } from '../components/layout';
import { useDashboardAlerts } from '../hooks';

import AdminDashboardSection     from './admin/sections/AdminDashboardSection';
import AdminUsersSection         from './admin/sections/AdminUsersSection';
import AdminCoursesSection       from './admin/sections/AdminCoursesSection';
import AdminEnrollmentsSection   from './admin/sections/AdminEnrollmentsSection';
import AdminNotificationsSection from './admin/sections/AdminNotificationsSection';
import AdminReportsSection       from './admin/sections/AdminReportsSection';
import AdminLogsSection          from './admin/sections/AdminLogsSection';
import AdminAdvisorAssignmentSection from './admin/sections/AdminAdvisorAssignmentSection';
import {
  AdminUserModal, AdminCourseModal, AdminEnrollmentModal,
  AdminNotificationModal, AdminLogDetailModal,
} from './admin/modals/AdminModals';
import { AdminAdvisorAssignmentModal } from './admin/modals/AdminAdvisorAssignmentModal';

const TAB_META = {
  dashboard:     { eyebrow: 'Overview',    title: 'Dashboard',           icon: 'home' },
  users:         { eyebrow: 'Accounts',    title: 'Users',               icon: 'users' },
  courses:       { eyebrow: 'Catalogue',   title: 'Courses',             icon: 'book' },
  enrollments:   { eyebrow: 'Cohorts',     title: 'Enrollments',         icon: 'users' },
  advisorAssign: { eyebrow: 'Guidance',    title: 'Advisor Assignment',  icon: 'users' },
  notifications: { eyebrow: 'Inbox',       title: 'Notifications',       icon: 'notifications' },
  reports:       { eyebrow: 'Analytics',   title: 'Reports',             icon: 'progress' },
  logs:          { eyebrow: 'Audit',      title: 'Activity Logs',       icon: 'file' },
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]             = useState('dashboard');
  const { alert, showAlert }      = useDashboardAlerts(3500);
  const [loading, setLoading]     = useState({});

  // data
  const [dashboard, setDashboard]  = useState(null);
  const [users, setUsers]         = useState([]);
  const [courses, setCourses]     = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [logs, setLogs]           = useState([]);
  const [logUsers, setLogUsers]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports]     = useState(null);
  const [reportTypes, setReportTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('summary');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd]   = useState('');

  // modals
  const [showUserModal, setShowUserModal]         = useState(false);
  const [showCourseModal, setShowCourseModal]     = useState(false);
  const [showEnrollModal, setShowEnrollModal]     = useState(false);
  const [showNotifModal, setShowNotifModal]       = useState(false);
  const [showLogDetailModal, setShowLogDetailModal] = useState(false);
  const [editingUser, setEditingUser]             = useState(null);
  const [editingCourse, setEditingCourse]         = useState(null);
  const [editingNotif, setEditingNotif]           = useState(null);
  const [editingEnrollment, setEditingEnrollment]  = useState(null);
  const [detailLogs, setDetailLogs]               = useState([]);
  const [detailLogUsername, setDetailLogUsername] = useState('');

  // advisor assignment data
  const [advisorStudents, setAdvisorStudents] = useState([]);
  const [advisors, setAdvisors]             = useState([]);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState(null);
  const [assignForm, setAssignForm]             = useState({ advisor_id: '' });

  const [logViewMode, setLogViewMode] = useState('user-list');

  // forms
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', role: 'student', department: '', phone_number: '', status: 'active' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', instructor_id: '', status: 'draft' });
  const [enrollForm, setEnrollForm] = useState({ user_id: '', course_id: '' });
  const [enrollEditForm, setEnrollEditForm] = useState({ user_id: '', course_id: '', status: 'active' });
  const [notifForm, setNotifForm]   = useState({ title: '', message: '', type: 'announcement', target_mode: 'role', target_role: 'student', user_id: '', course_id: '', target_all: false, scheduled_at: '' });

  // log filters
  const [logFilterRole, setLogFilterRole]         = useState('');
  const [logFilterCategory, setLogFilterCategory] = useState('');
  const [logFilterStart, setLogFilterStart]       = useState('');
  const [logFilterEnd, setLogFilterEnd]           = useState('');
  const [logFilterRoles, setLogFilterRoles]       = useState([]);
  const [logActivityCategories, setLogActivityCategories] = useState([]);
  const [filterLoading, setFilterLoading]         = useState(true); // start true so loading shows on first visit

  const withLoading = useCallback(async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); }
    catch (e) { showAlert(e.response?.data?.message || 'Could not load data. Try again.', 'error'); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  }, [showAlert]);

  // fetch on tab change
  useEffect(() => {
    if (tab === 'dashboard')   withLoading('dashboard',  async () => setDashboard((await adminGetDashboard()).data));
    if (tab === 'users')       withLoading('users',      async () => {
      const r = await adminGetUsers();
      setUsers(r.data);
      const d = await adminGetDepartments();
      setDepartments(d.data || []);
    });
    if (tab === 'courses')     withLoading('courses',    async () => setCourses((await adminGetCourses()).data));
    if (tab === 'enrollments') withLoading('enrollments', async () => {
      setEnrollments((await adminGetEnrollments()).data);
      setUsers((await adminGetUsers()).data);
      setCourses((await adminGetCourses()).data);
    });
    if (tab === 'advisorAssign') withLoading('advisorAssign', async () => {
      const [stu, adv] = await Promise.all([
        adminGetStudentsWithAdvisor(),
        adminGetAdvisors(),
      ]);
      setAdvisorStudents(stu.data);
      setAdvisors(adv.data);
    });
    if (tab === 'notifications') withLoading('notifications', async () => {
      setNotifications((await adminGetNotifications()).data);
      setUsers((await adminGetUsers()).data);
      setCourses((await adminGetCourses()).data);
    });
    if (tab === 'reports')      withLoading('reports',     async () => {
      const types = (await adminGetReportTypes()).data;
      setReportTypes(types);
    });
    if (tab === 'logs') {
      withLoading('logs', async () => {
        setFilterLoading(true);
        setLogViewMode('user-list');
        setLogs([]);
        const res = await adminGetLogUsers();
        setLogUsers(res.data?.data ?? []);
        setFilterLoading(false);
      });
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    adminGetLogFilters().then(r => {
      setLogFilterRoles(r.data?.roles || []);
      setLogActivityCategories(r.data?.activityTypes || []);
    }).catch(() => {});
  }, []);

  // user CRUD
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
    if (editingUser) { await adminEditUser(editingUser.user_id, userForm); showAlert('User updated'); setShowUserModal(false); adminGetUsers().then(r => setUsers(r.data)); }
    else             { await adminAddUser(userForm); showAlert('User added'); setShowUserModal(false); adminGetUsers().then(r => setUsers(r.data)); }
  };
  const deactivateUser = async (id) => {
    if (!window.confirm('Deactivate this user?')) return;
    try { await adminDeactivateUser(id); showAlert('User deactivated'); adminGetUsers().then(r => setUsers(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // course CRUD
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

  // enrollment CRUD
  const saveEnrollment = async () => {
    try { await adminAddEnrollment(enrollForm); showAlert('Enrollment added'); setShowEnrollModal(false); adminGetEnrollments().then(r => setEnrollments(r.data)); }
    catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const dropEnrollment = async (id) => {
    if (!window.confirm('Drop this enrollment?')) return;
    try { await adminDropEnrollment(id); showAlert('Enrollment dropped'); adminGetEnrollments().then(r => setEnrollments(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };
  const openAddEnroll = () => { setEditingEnrollment(null); setShowEnrollModal(true); };
  const openEditEnrollment = (e) => {
    setEditingEnrollment(e);
    setEnrollEditForm({ user_id: e.user_id, course_id: e.course_id, status: e.status });
    setShowEnrollModal(true);
  };
  const closeEnrollModal = () => {
    setShowEnrollModal(false);
    setEditingEnrollment(null);
    setEnrollEditForm({ user_id: '', course_id: '', status: 'active' });
  };
  const saveEnrollmentEdit = async () => {
    try {
      await adminEditEnrollment(editingEnrollment.enrollment_id, enrollEditForm);
      showAlert('Enrollment updated');
      setShowEnrollModal(false);
      adminGetEnrollments().then(r => setEnrollments(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };

  // advisor assignment
  const openAssignAdvisor = (student) => {
    setAssigningStudent(student);
    setAssignForm({ advisor_id: student.advisor_id || '' });
    setShowAdvisorModal(true);
  };
  const saveAdvisorAssignment = async () => {
    try {
      await adminAssignAdvisor(assigningStudent.user_id, assignForm.advisor_id || null);
      showAlert('Advisor assignment saved');
      setShowAdvisorModal(false);
      adminGetStudentsWithAdvisor().then(r => setAdvisorStudents(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to assign advisor', 'error');
    }
  };

  // notification CRUD
  const openAddNotif = () => {
    setEditingNotif(null);
    setNotifForm({ title: '', message: '', type: 'announcement', target_mode: 'role', target_role: 'student', user_id: '', course_id: '', target_all: false, scheduled_at: '' });
    setShowNotifModal(true);
  };
  const openEditNotif = (n) => {
    setEditingNotif(n);
    const mode = n.course_id ? 'course' : n.user_id ? 'user' : n.target_role ? 'role' : 'all';
    setNotifForm({
      title: n.title, message: n.message,
      type: n.type || 'announcement',
      target_mode: mode,
      target_role: n.target_role || 'student',
      user_id: n.user_id || '',
      course_id: n.course_id || '',
      target_all: mode === 'all',
      scheduled_at: n.scheduled_at ? n.scheduled_at.slice(0, 16) : '',
    });
    setShowNotifModal(true);
  };
  const saveNotif = async () => {
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showAlert('Title and message are required', 'error');
      return;
    }
    const payload = { title: notifForm.title, message: notifForm.message, type: notifForm.type };
    if (notifForm.target_mode === 'user')      payload.user_id     = notifForm.user_id;
    if (notifForm.target_mode === 'role')      payload.target_role = notifForm.target_role;
    if (notifForm.target_mode === 'all')       payload.target_all   = true;
    if (notifForm.target_mode === 'course')    payload.course_id   = notifForm.course_id;
    if (notifForm.scheduled_at) payload.scheduled_at = notifForm.scheduled_at;
    try {
      if (editingNotif) { await adminEditNotification(editingNotif.notification_id, payload); showAlert('Notification updated'); }
      else              { await adminCreateNotification(payload); showAlert('Notification created'); }
      setShowNotifModal(false);
      adminGetNotifications().then(r => setNotifications(r.data));
    } catch (e) { showAlert(e.response?.data?.message || 'Failed', 'error'); }
  };
  const deleteNotif = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try { await adminDeleteNotification(id); showAlert('Notification deleted'); adminGetNotifications().then(r => setNotifications(r.data)); }
    catch { showAlert('Failed', 'error'); }
  };

  // reports
  const changeReportType = (type) => { setSelectedReportType(type); setReports(null); };
  const runReport = useCallback(async () => {
    setReportLoading(true);
    try {
      const params = { type: selectedReportType };
      if (reportStart) params.startDate = reportStart;
      if (reportEnd)   params.endDate   = reportEnd;
      const res = await adminGetReports(params);
      setReports(res.data);
    } catch (e) { showAlert(e.response?.data?.message || 'Failed to load report', 'error'); }
    finally { setReportLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportType, reportStart, reportEnd]);

  const exportReport = async () => {
    const params = { type: selectedReportType };
    if (reportStart) params.startDate = reportStart;
    if (reportEnd)   params.endDate   = reportEnd;
    try {
      const res = await adminExportReports(params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `report_${selectedReportType}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to export report', 'error');
    }
  };

  // logs
  const applyLogFilters = useCallback(async () => {
    setFilterLoading(true);
    try {
      const params = {};
      if (logFilterRole)      params.role            = logFilterRole;
      if (logFilterCategory)  params.activityCategory = logFilterCategory;
      if (logFilterStart)     params.startDate        = logFilterStart;
      if (logFilterEnd)       params.endDate          = logFilterEnd;
      const res = await adminGetLogs(params);
      setLogs(res.data?.data ?? res.data ?? []);
      setLogViewMode('logs');
    } catch { showAlert('Failed to load logs', 'error'); }
    finally { setFilterLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logFilterRole, logFilterCategory, logFilterStart, logFilterEnd]);

  const exportLogs = async () => {
    const params = {};
    if (logFilterRole)      params.role            = logFilterRole;
    if (logFilterCategory)  params.activityCategory = logFilterCategory;
    if (logFilterStart)     params.startDate        = logFilterStart;
    if (logFilterEnd)       params.endDate          = logFilterEnd;
    try {
      const res = await adminExportLogs(params);
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to export logs', 'error');
    }
  };

  const resetLogFilters = () => {
    setLogFilterRole('');
    setLogFilterCategory('');
    setLogFilterStart('');
    setLogFilterEnd('');
    setLogViewMode('user-list');
    setLogs([]);
    adminGetLogUsers().then(r => setLogUsers(r.data?.data ?? []));
  };

  const openLogDetail = async (userId) => {
    setShowLogDetailModal(true);
    try {
      const res = await adminGetLogs({ userId });
      setDetailLogs(res.data?.data ?? res.data ?? []);
      setDetailLogUsername(res.data?.data?.[0]?.username || '');
    } catch { setDetailLogs([]); }
  };

  const instructors = users.filter(u => u.role === 'instructor' && u.status === 'active');
  const students     = users.filter(u => u.role === 'student');

  const meta = TAB_META[tab] || TAB_META.dashboard;

  const navGroups = [
    {
      label: 'Operate',
      items: [
        { key: 'dashboard', label: 'Dashboard',        icon: 'home' },
        { key: 'users',     label: 'Users',            icon: 'users' },
        { key: 'courses',   label: 'Courses',          icon: 'book' },
        { key: 'enrollments', label: 'Enrollments',   icon: 'users' },
        { key: 'advisorAssign', label: 'Advisor Assignment', icon: 'users' },
      ],
    },
    {
      label: 'Engage',
      items: [
        { key: 'notifications', label: 'Notifications', icon: 'notifications' },
        { key: 'reports',       label: 'Reports',       icon: 'progress' },
        { key: 'logs',          label: 'Activity Logs', icon: 'file' },
      ],
    },
  ];

  return (
    <DashboardShell
      sidebar={
        <Sidebar
          user={user}
          portalName="Admin console"
          navGroups={navGroups}
          activeKey={tab}
          onNavigate={setTab}
          onLogout={logout}
          onProfile={() => {}}
        />
      }
      header={
        <Header
          eyebrow={meta.eyebrow}
          title={meta.title}
          onNotifications={() => setTab('notifications')}
          onProfile={() => {}}
          user={user}
        />
      }
    >
      <Alert msg={alert.msg} type={alert.type} />

      {tab === 'dashboard'     && <AdminDashboardSection     dashboard={dashboard} loading={loading.dashboard} />}
      {tab === 'users'         && <AdminUsersSection         users={users} loading={loading.users} onAdd={openAddUser} onEdit={openEditUser} onDeactivate={deactivateUser} />}
      {tab === 'courses'       && <AdminCoursesSection       courses={courses} loading={loading.courses} onAdd={openAddCourse} onEdit={openEditCourse} onArchive={archiveCourse} />}
      {tab === 'enrollments'   && <AdminEnrollmentsSection   enrollments={enrollments} loading={loading.enrollments} onAdd={openAddEnroll} onEdit={openEditEnrollment} onDrop={dropEnrollment} />}
      {tab === 'advisorAssign' && <AdminAdvisorAssignmentSection students={advisorStudents} loading={loading.advisorAssign} onAssign={openAssignAdvisor} />}
      {tab === 'notifications' && <AdminNotificationsSection notifications={notifications} loading={loading.notifications} onAdd={openAddNotif} onEdit={openEditNotif} onDelete={deleteNotif} />}
      {tab === 'reports'       && <AdminReportsSection
          reportTypes={reportTypes}
          selectedReportType={selectedReportType}
          reportStart={reportStart}
          reportEnd={reportEnd}
          reports={reports}
          reportLoading={reportLoading}
          onChangeType={changeReportType}
          onChangeStart={setReportStart}
          onChangeEnd={setReportEnd}
          onRun={runReport}
          onExport={exportReport}
        />}
      {tab === 'logs' && <AdminLogsSection
          filterRoles={logFilterRoles}
          activityCategories={logActivityCategories}
          filterRole={logFilterRole}
          filterCategory={logFilterCategory}
          filterStart={logFilterStart}
          filterEnd={logFilterEnd}
          logViewMode={logViewMode}
          logs={logs}
          logUsers={logUsers}
          filterLoading={filterLoading}
          onChangeRole={setLogFilterRole}
          onChangeCategory={setLogFilterCategory}
          onChangeStart={setLogFilterStart}
          onChangeEnd={setLogFilterEnd}
          onApply={applyLogFilters}
          onReset={resetLogFilters}
          onExport={exportLogs}
          onOpenUserDetail={openLogDetail}
        />}

      {showUserModal && (
        <AdminUserModal
          editingUser={editingUser}
          userForm={userForm}
          instructors={instructors}
          departments={departments}
          onChange={setUserForm}
          onClose={() => setShowUserModal(false)}
          onSubmit={saveUser}
        />
      )}

      {showCourseModal && (
        <AdminCourseModal
          editingCourse={editingCourse}
          courseForm={courseForm}
          instructors={instructors}
          onChange={setCourseForm}
          onClose={() => setShowCourseModal(false)}
          onSubmit={saveCourse}
        />
      )}

      {showEnrollModal && (
        <AdminEnrollmentModal
          editingEnrollment={editingEnrollment}
          enrollForm={enrollForm}
          enrollEditForm={enrollEditForm}
          students={students}
          courses={courses}
          onChangeAdd={setEnrollForm}
          onChangeEdit={setEnrollEditForm}
          onClose={closeEnrollModal}
          onSubmitAdd={saveEnrollment}
          onSubmitEdit={saveEnrollmentEdit}
        />
      )}

      {showNotifModal && (
        <AdminNotificationModal
          editingNotif={editingNotif}
          notifForm={notifForm}
          users={users}
          courses={courses}
          onChange={setNotifForm}
          onClose={() => setShowNotifModal(false)}
          onSubmit={saveNotif}
        />
      )}

      {showAdvisorModal && (
        <AdminAdvisorAssignmentModal
          student={assigningStudent}
          advisors={advisors}
          assignForm={assignForm}
          onChange={setAssignForm}
          onClose={() => setShowAdvisorModal(false)}
          onSubmit={saveAdvisorAssignment}
        />
      )}

      {showLogDetailModal && (
        <AdminLogDetailModal
          username={detailLogUsername}
          detailLogs={detailLogs}
          onClose={() => setShowLogDetailModal(false)}
        />
      )}
    </DashboardShell>
  );
}