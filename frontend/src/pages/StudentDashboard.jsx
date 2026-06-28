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
import { Alert, Modal, Spinner } from '../components/shared';
import { DashboardShell, Sidebar, Header } from '../components/layout';
import { useDashboardAlerts } from '../hooks';
import { token } from '../theme';
import { photoUrl as resolvePhoto } from '../utils';

import StudentDashboardSection     from './student/sections/StudentDashboardSection';
import StudentCoursesSection       from './student/sections/StudentCoursesSection';
import StudentLessonsSection       from './student/sections/StudentLessonsSection';
import StudentProgressSection      from './student/sections/StudentProgressSection';
import StudentNotificationsSection from './student/sections/StudentNotificationsSection';
import { GradeDetailModal }        from './student/modals/StudentModals';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const { alert, showAlert } = useDashboardAlerts(3000);
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
  const [assignmentData, setAssignmentData] = useState(null);
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

  // Load DM Sans/Serif fonts
  useEffect(() => {
    const existing = document.getElementById('sils-dashboard-fonts');
    if (existing) return;
    const link = document.createElement('link');
    link.id = 'sils-dashboard-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap';
    document.head.appendChild(link);
  }, []);

  // "Browse Courses" shortcut dispatched from lessons section
  useEffect(() => {
    const handler = () => setTab('courses');
    document.addEventListener('std-goto-courses', handler);
    return () => document.removeEventListener('std-goto-courses', handler);
  }, []);

  // Timer for quiz
  useEffect(() => {
    if (!activeQuiz || timeLeft === null) return;
    if (timeLeft <= 0) {
      const answers = Object.entries(quizAnswers).map(([question_id, user_answer]) => ({
        question_id: parseInt(question_id), user_answer
      }));
      studentSubmitQuiz(activeQuiz.attempt_id, { answers })
        .then(res => {
          setQuizResult(res.data);
          setActiveQuiz(null);
          setTimeLeft(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, activeQuiz, quizAnswers]);

  // Fetch data on tab change
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

  // Load modules when course selected
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

  // Enroll
  const handleEnroll = async (courseId) => {
    try {
      await studentEnroll({ course_id: courseId });
      showAlert('Enrolled successfully!');
      studentGetCourses().then(r => setCatalogue(r.data));
    } catch (e) {
      showAlert(e.response?.data?.message || 'Enrollment failed', 'error');
    }
  };

  // Mark lesson complete
  const handleComplete = async (moduleId) => {
    try {
      await studentCompleteLesson(moduleId);
      showAlert('Lesson marked as complete!');
      studentGetModules(selectedCourse.course_id).then(r => setModules(r.data));
    } catch { showAlert('Failed', 'error'); }
  };

  // Start quiz
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

  // Submit quiz
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

  // Open assignment
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

  // Submit assignment file
  const handleSubmitAssignment = async () => {
    if (!assignmentFile) { showAlert('Please select a file.', 'error'); return; }
    setAssignmentUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', assignmentFile);
      if (assignmentNote) formData.append('text_note', assignmentNote);
      await studentSubmitAssignment(assignmentData.quiz.quiz_id, formData);
      showAlert('Assignment submitted successfully!');
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

  // Open grade detail
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

  // Profile
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const openProfile = async () => {
    setProfileLoading(true);
    setShowProfileModal(true);
    setPhotoFile(null);
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

  // Notifications
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

  const navGroups = [
    {
      label: 'Main',
      items: [
        { key: 'dashboard', label: 'Dashboard', icon: 'home' },
        { key: 'courses', label: 'Browse Courses', icon: 'courses' },
        { key: 'lessons', label: 'My Lessons', icon: 'lessons' },
        { key: 'progress', label: 'My Progress', icon: 'progress' },
      ],
    },
    {
      label: 'Personal',
      items: [
        { key: 'notifications', label: 'Notifications', icon: 'notifications', badge: unreadCount },
      ],
    },
  ];

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

  return (
    <DashboardShell
      sidebar={
        <Sidebar
          user={user}
          portalName="Student Portal"
          navGroups={navGroups}
          activeKey={tab}
          onNavigate={setTab}
          onLogout={logout}
          onProfile={openProfile}
          profilePhoto={dashboard?.profile?.photo_url}
        />
      }
      header={
        <Header
          eyebrow={tabEyebrow(tab)}
          title={tabTitle(tab, selectedCourse)}
          showSearch
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses, lessons…"
          onNotifications={() => setTab('notifications')}
          notificationsBadge={unreadCount > 0}
          onProfile={openProfile}
          user={user}
          userPhoto={dashboard?.profile?.photo_url}
        />
      }
    >
      <Alert msg={alert.msg} type={alert.type} />

      {tab === 'dashboard' && !dashboard && <Spinner label="Loading your dashboard…" />}
      {tab === 'dashboard' && dashboard && (
        <StudentDashboardSection
          user={user}
          dashboard={dashboard}
          notifications={notifications}
          search={search}
          onOpenCourse={openCourse}
          onMarkRead={markRead}
        />
      )}
      {tab === 'courses' && (
        <StudentCoursesSection
          catalogue={catalogue}
          search={search}
          onEnroll={handleEnroll}
          onOpenCourse={openCourse}
        />
      )}
      {tab === 'lessons' && (
        <StudentLessonsSection
          selectedCourse={selectedCourse}
          modules={modules}
          quizzes={quizzes}
          grades={grades}
          search={search}
          activeQuiz={activeQuiz}
          quizResult={quizResult}
          quizAnswers={quizAnswers}
          timeLeft={timeLeft}
          formatTime={formatTime}
          selectedLesson={selectedLesson}
          assignmentData={assignmentData}
          assignmentFile={assignmentFile}
          assignmentNote={assignmentNote}
          assignmentUploading={assignmentUploading}
          onSelectLesson={(l) => {
            if (l.content_type === 'video') {
              studentLogActivity({
                activity_type: 'video_watch',
                description: `Watched video: ${l.title}`,
                related_item_type: 'lesson',
                related_item_id: l.lesson_id,
              }).catch(() => {});
            }
            setSelectedLesson(l);
            setActiveQuiz(null);
            setQuizResult(null);
            setAssignmentData(null);
          }}
          onCompleteModule={handleComplete}
          onChangeAnswer={(qid, val) => setQuizAnswers({ ...quizAnswers, [qid]: val })}
          onSubmitQuiz={handleSubmitQuiz}
          onCloseQuizResult={() => setQuizResult(null)}
          onStartQuiz={handleStartQuiz}
          onOpenAssignment={handleOpenAssignment}
          onOpenGradeDetail={handleOpenGradeDetail}
          onChangeAssignmentFile={setAssignmentFile}
          onChangeAssignmentNote={setAssignmentNote}
          onSubmitAssignment={handleSubmitAssignment}
          onCloseAssignment={() => setAssignmentData(null)}
          onCloseLesson={() => setSelectedLesson(null)}
        />
      )}
      {tab === 'progress' && (
        <StudentProgressSection
          progressData={progressData}
          onGotoLessons={() => setTab('lessons')}
        />
      )}
      {tab === 'notifications' && (
        <StudentNotificationsSection
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
        />
      )}

      {(gradeDetail || gradeDetailLoading) && (
        <GradeDetailModal
          gradeDetail={gradeDetail}
          loading={gradeDetailLoading}
          onClose={() => { setGradeDetail(null); setGradeDetailLoading(false); }}
        />
      )}

      {showProfileModal && (
        <Modal title="My Profile" onClose={() => setShowProfileModal(false)}>
          {profileLoading ? (
            <Spinner label="Loading profile…" />
          ) : (
            <>
              {/* Avatar + photo upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                {photoPreview || profile?.photo_url ? (
                  <img src={photoPreview || resolvePhoto(profile?.photo_url)} alt={profileForm.username}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${token.line}` }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${token.info}, ${token.accent2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 600 }}>
                    {(profileForm.username || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={onPhotoChange} style={{ display: 'none' }} />
                  <button type="button" style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '7px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }} onClick={() => fileInputRef.current?.click()}>
                    Change photo
                  </button>
                  <div style={{ fontSize: 11, color: token.inkFaint, marginTop: 6 }}>JPG or PNG, up to 5MB.</div>
                </div>
              </div>

              {/* Read-only info */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { label: 'Email', value: profileData?.email || '—' },
                  { label: 'GPA', value: profileData?.gpa != null ? Number(profileData.gpa).toFixed(2) : '—' },
                  ...(profileData?.advisor_name ? [{ label: 'Advisor', value: profileData.advisor_name }] : []),
                ].map(f => (
                  <div key={f.label} style={{ flex: 1, minWidth: 120, background: token.surface2, borderRadius: token.radiusSm, padding: '10px 14px', border: `1px solid ${token.line}` }}>
                    <div style={{ fontSize: 10, color: token.inkFaint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: token.ink }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {profileData?.is_at_risk && (
                <div style={{ marginBottom: 16, padding: '8px 12px', borderRadius: token.radiusSm, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 12, color: token.danger }}>
                  ⚠ You have been flagged as an at-risk student. Contact your advisor for support.
                </div>
              )}

              <div style={{ borderTop: `1px solid ${token.line}`, paddingTop: 16, marginBottom: 16 }} />
              {[
                { label: 'Username', key: 'username', type: 'text' },
                { label: 'Phone Number', key: 'phone_number', type: 'text' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>{f.label}</label>
                  <input
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: token.ink }}
                    type={f.type}
                    value={profileForm[f.key] || ''}
                    onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Department</label>
                <input
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: token.ink, opacity: 0.5, cursor: 'not-allowed' }}
                  type="text"
                  value={profileForm.department || ''}
                  readOnly
                />
              </div>
              <div style={{ borderTop: `1px solid ${token.line}`, paddingTop: 16, marginTop: 4, marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Academic Info</div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Academic Level</label>
                  <input
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: token.ink }}
                    type="text"
                    placeholder="e.g. Undergraduate, Postgraduate"
                    value={profileForm.academic_level || ''}
                    onChange={e => setProfileForm({ ...profileForm, academic_level: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Programme</label>
                  <input
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: token.ink }}
                    type="text"
                    placeholder="e.g. Bachelor of Computer Science"
                    value={profileForm.programme || ''}
                    onChange={e => setProfileForm({ ...profileForm, programme: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 }}>Learning Preferences</label>
                  <textarea
                    style={{ width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', color: token.ink, minHeight: 60, resize: 'vertical' }}
                    placeholder="e.g. Visual learner, prefer video content…"
                    value={profileForm.learning_preferences || ''}
                    onChange={e => setProfileForm({ ...profileForm, learning_preferences: e.target.value })}
                  />
                </div>
              </div>
              <button style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600, width: '100%' }} onClick={saveProfile}>
                Save Profile
              </button>
            </>
          )}
        </Modal>
      )}
    </DashboardShell>
  );
}