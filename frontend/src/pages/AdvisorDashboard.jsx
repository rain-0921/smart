import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  advisorGetDashboard, advisorGetProfile, advisorUpdateProfile,
  advisorGetStudents, advisorGetStudent, advisorGetGrades,
  advisorGetProgress, advisorGetReport, advisorExportReport,
  advisorGetNotifications, advisorMarkRead,
} from '../services/api';
import { Alert, Modal } from '../components/shared';
import { DashboardShell, Sidebar, Header } from '../components/layout';
import { useDashboardAlerts } from '../hooks';

import AdvisorHomeSection from './advisor/sections/AdvisorHomeSection';
import AdvisorStudentsSection from './advisor/sections/AdvisorStudentsSection';
import AdvisorProgressSection from './advisor/sections/AdvisorProgressSection';
import AdvisorReportsSection from './advisor/sections/AdvisorReportsSection';
import AdvisorNotificationsSection from './advisor/sections/AdvisorNotificationsSection';
import { StudentDetailModal, StudentGradesModal, ProfileForm } from './advisor/modals/AdvisorModals';

const TAB_META = {
  dashboard:     { eyebrow: 'Overview',      title: 'Dashboard',       icon: 'home' },
  students:      { eyebrow: 'Cohort',         title: 'My students',     icon: 'users' },
  progress:      { eyebrow: 'Performance',    title: 'Monitor progress', icon: 'progress' },
  reports:       { eyebrow: 'Export',         title: 'Generate reports', icon: 'file' },
  notifications: { eyebrow: 'Inbox',          title: 'Notifications',   icon: 'notifications' },
};

export default function AdvisorDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const { alert, showAlert } = useDashboardAlerts(3500);
  const [loading, setLoading] = useState({});

  const [dashboard, setDashboard]       = useState(null);
  const [students, setStudents]         = useState([]);
  const [progress, setProgress]          = useState([]);
  const [report, setReport]             = useState(null);
  const [reportType, setReportType]     = useState('progress');
  const [notifications, setNotifications] = useState([]);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [profile, setProfile]           = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showGradesModal,  setShowGradesModal]  = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', phone_number: '', department: '' });

  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const withLoading = useCallback(async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); }
    catch (e) {
      showAlert(e.response?.data?.message || 'Could not load this section. Try again.', 'error');
    }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  }, [showAlert]);

  useEffect(() => {
    advisorGetProfile().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'dashboard')     withLoading('dashboard',     async () => setDashboard((await advisorGetDashboard()).data));
    if (tab === 'students')      withLoading('students',       async () => setStudents((await advisorGetStudents()).data));
    if (tab === 'progress')      withLoading('progress',       async () => setProgress((await advisorGetProgress()).data));
    if (tab === 'reports')       withLoading('reports',        async () => setReport((await advisorGetReport(reportType)).data));
    if (tab === 'notifications')  withLoading('notifications',  async () => setNotifications((await advisorGetNotifications()).data));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const openStudent = async (student) => {
    try {
      const res = await advisorGetStudent(student.user_id);
      setStudentDetail(res.data);
      setShowStudentModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't load this student's profile.", 'error');
    }
  };

  const openGrades = async (student) => {
    try {
      const res = await advisorGetGrades(student.user_id);
      setStudentGrades(res.data);
      setShowGradesModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't load this student's academic record.", 'error');
    }
  };

  const openProfile = async () => {
    try {
      const res = await advisorGetProfile();
      setProfile(res.data);
      setProfileForm({
        username:     res.data.username     || '',
        phone_number: res.data.phone_number || '',
        department:   res.data.department   || '',
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setShowProfileModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't load your profile.", 'error');
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

  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);

  const saveProfile = async () => {
    if (!profileForm.username.trim()) {
      showAlert('Username is required.', 'error');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('username', profileForm.username);
      fd.append('phone_number', profileForm.phone_number || '');
      fd.append('department', profileForm.department || '');
      if (photoFile) fd.append('photo', photoFile);

      const res = await advisorUpdateProfile(fd);
      setProfile(p => ({
        ...p,
        username:     profileForm.username,
        phone_number: profileForm.phone_number,
        department:   profileForm.department,
        photo_url:    res?.data?.photo_url || p?.photo_url,
      }));
      showAlert('Profile updated successfully.');
      setShowProfileModal(false);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Could not save profile changes.', 'error');
    }
  };

  const generateReport = async (type) => {
    setReportType(type);
    await withLoading('reports', async () => setReport((await advisorGetReport(type)).data));
  };

  const exportReportCsv = async () => {
    try {
      const res = await advisorExportReport(reportType);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `advisor_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report: ' + (err.response?.data?.message || err.message));
    }
  };

  const markRead = async (id) => {
    try {
      await advisorMarkRead(id);
      setNotifications(ns => ns.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't mark that notification as read.", 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const meta = TAB_META[tab] || TAB_META.dashboard;

  const navGroups = [
    {
      label: 'Main',
      items: [
        { key: 'dashboard',     label: 'Dashboard',        icon: 'home' },
        { key: 'students',      label: 'My students',      icon: 'users' },
        { key: 'progress',      label: 'Monitor progress', icon: 'progress' },
        { key: 'reports',       label: 'Reports',          icon: 'file' },
      ],
    },
    {
      label: 'Inbox',
      items: [
        { key: 'notifications', label: 'Notifications', icon: 'notifications', badge: unreadCount },
      ],
    },
  ];

  return (
    <>
      <DashboardShell
        sidebar={
          <Sidebar
            user={user}
            portalName="Advisor console"
            navGroups={navGroups}
            activeKey={tab}
            onNavigate={setTab}
            onLogout={logout}
            onProfile={openProfile}
            profilePhoto={profile?.photo_url}
          />
        }
        header={
          <Header
            eyebrow={meta.eyebrow}
            title={meta.title}
            onNotifications={() => setTab('notifications')}
            notificationsBadge={unreadCount > 0}
            onProfile={openProfile}
            user={user}
            userPhoto={profile?.photo_url}
          />
        }
      >
        <Alert msg={alert.msg} type={alert.type} />

        {tab === 'dashboard' && (
          <AdvisorHomeSection
            dashboard={dashboard}
            loading={loading.dashboard}
            unreadCount={unreadCount}
            onOpenStudent={openStudent}
          />
        )}
        {tab === 'students' && (
          <AdvisorStudentsSection
            students={students}
            loading={loading.students}
            onOpenStudent={openStudent}
            onOpenGrades={openGrades}
          />
        )}
        {tab === 'progress' && (
          <AdvisorProgressSection progress={progress} loading={loading.progress} />
        )}
        {tab === 'reports' && (
          <AdvisorReportsSection
            reportType={reportType}
            report={report}
            loading={loading.reports}
            onChangeType={generateReport}
            onExport={exportReportCsv}
          />
        )}
        {tab === 'notifications' && (
          <AdvisorNotificationsSection
            notifications={notifications}
            loading={loading.notifications}
            onMarkRead={markRead}
          />
        )}
      </DashboardShell>

      {showStudentModal && studentDetail && (
        <StudentDetailModal
          detail={studentDetail}
          onClose={() => setShowStudentModal(false)}
        />
      )}

      {showGradesModal && studentGrades && (
        <StudentGradesModal
          grades={studentGrades}
          onClose={() => setShowGradesModal(false)}
        />
      )}

      {showProfileModal && (
        <Modal title="My profile" onClose={() => setShowProfileModal(false)}>
          <ProfileForm
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            photoPreview={photoPreview}
            profilePhoto={profile?.photo_url}
            fileInputRef={fileInputRef}
            onPhotoChange={onPhotoChange}
            onSubmit={saveProfile}
          />
        </Modal>
      )}
    </>
  );
}
