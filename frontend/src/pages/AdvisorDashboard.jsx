import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  advisorGetDashboard, advisorGetProfile, advisorUpdateProfile,
  advisorGetStudents, advisorGetStudent, advisorGetGrades,
  advisorGetProgress, advisorGetReport, advisorExportReport,
  advisorGetNotifications, advisorMarkRead
} from '../services/api';

/* ════════════════════════════════════════════════════════════
   DESIGN TOKENS
   A registrar's-ledger aesthetic: warm paper background, deep
   ink navy for structure, a brass accent reserved for the one
   signature mark (the seal + active-tab tick), serif headings
   for an academic register feel, monospace for every number
   that represents a measurement (GPA, %, counts) — so figures
   read like printed transcript data.
   ════════════════════════════════════════════════════════════ */
const token = {
  paper:      '#F6F4EE',
  surface:    '#FFFFFF',
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
};

const fontDisplay = "'Lora', Georgia, serif";
const fontBody    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono    = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

/* ── Inject fonts + the bits CSS can do that inline style can't:
     hover states, focus rings, scrollbars, motion, breakpoints ── */
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .adv-root * { box-sizing: border-box; }
      .adv-root { font-family: ${fontBody}; }

      .adv-nav-item { transition: background-color .15s ease, color .15s ease; position: relative; }
      .adv-nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
      .adv-nav-item.active::before {
        content: ''; position: absolute; left: -16px; top: 8px; bottom: 8px; width: 3px;
        background: ${token.brass}; border-radius: 2px;
      }

      .adv-btn { transition: filter .15s ease, transform .1s ease; }
      .adv-btn:hover { filter: brightness(1.08); }
      .adv-btn:active { transform: translateY(1px); }
      .adv-btn:focus-visible, .adv-icon-btn:focus-visible, .adv-row-btn:focus-visible,
      .adv-input:focus-visible, .adv-tab-btn:focus-visible {
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
        .adv-sidebar { width: 100% !important; flex-direction: row !important; overflow-x: auto;
          padding: 12px !important; position: sticky; top: 0; z-index: 50; }
        .adv-sidebar .adv-brand, .adv-sidebar .adv-spacer, .adv-sidebar .adv-foot { display: none !important; }
        .adv-shell { flex-direction: column !important; }
        .adv-nav-item { white-space: nowrap; }
        .adv-nav-item.active::before { left: 0; top: auto; bottom: -10px; left: 8px; right: 8px; width: auto; height: 3px; }
      }
    `}</style>
  );
}

/* ── Small line-icon set (hand-drawn, no external icon dependency) ── */
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'home':     return <svg {...common}><path d="M4 11.5 12 4l8 7.5" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>;
    case 'people':   return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" /><circle cx="17.5" cy="9.5" r="2.2" /><path d="M14.6 14.2c2.4.3 4.4 2.1 4.4 4.8" /></svg>;
    case 'trend':     return <svg {...common}><path d="M4 16l5-5 4 3 7-8" /><path d="M15 6h5v5" /></svg>;
    case 'doc':       return <svg {...common}><path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h6" /></svg>;
    case 'bell':      return <svg {...common}><path d="M7 10a5 5 0 0 1 10 0v4l1.5 2.5h-13L7 14Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>;
    case 'user':      return <svg {...common}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>;
    case 'logout':    return <svg {...common}><path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" /><path d="M14 16l5-4-5-4" /><path d="M19 12H9" /></svg>;
    case 'warn':      return <svg {...common}><path d="M12 4 21 19H3Z" /><path d="M12 10v4" /><circle cx="12" cy="17" r=".4" fill={color} /></svg>;
    case 'check':     return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.3 2.3 5-5.3" /></svg>;
    case 'x':         return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>;
    case 'camera':    return <svg {...common}><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13.5" r="3.3" /></svg>;
    case 'spark':     return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></svg>;
    case 'download':  return <svg {...common}><path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></svg>;
    default: return null;
  }
}

/* ── Avatar: photo if present, otherwise initials on a brass-tinted seal ── */
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

/* ── Modal: closes on Esc or overlay click ── */
function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ ...modalBox, maxWidth: wide ? 860 : 480 }} onClick={(e) => e.stopPropagation()} className="adv-scroll adv-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 20 }}>{title}</h3>
          <button onClick={onClose} className="adv-icon-btn" style={closeBtn} aria-label="Close">
            <Icon name="x" size={16} color={token.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── StatCard: ledger tile — left accent bar, mono figure ── */
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

/* ── Empty state: a direction, not a shrug ── */
function Empty({ children }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{children}</p>;
}
function Loading({ label = 'Loading…' }) {
  return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>{label}</p>;
}

/* ── Risk pill (shared by Students / Progress tables) ── */
function RiskPill({ atRisk }) {
  return atRisk ? (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: token.danger, fontWeight: 700, fontSize: 12.5 }}>
      <Icon name="warn" size={13} /> At risk
    </span>
  ) : (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: token.good, fontSize: 12.5 }}>
      <Icon name="check" size={13} /> On track
    </span>
  );
}

function gpaColor(gpa) {
  const v = parseFloat(gpa || 0);
  return v >= 3 ? token.good : v >= 2 ? token.warn : token.danger;
}
function scoreColor(score) {
  const v = parseFloat(score || 0);
  return v >= 70 ? token.good : v >= 50 ? token.warn : token.danger;
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function AdvisorDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]     = useState('dashboard');
  const [alert, setAlert] = useState({ msg: '', type: '' });
  const [loading, setLoading] = useState({});

  // data
  const [dashboard, setDashboard]         = useState(null);
  const [students, setStudents]           = useState([]);
  const [progress, setProgress]           = useState([]);
  const [report, setReport]               = useState(null);
  const [reportType, setReportType]       = useState('progress');
  const [notifications, setNotifications] = useState([]);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentGrades, setStudentGrades] = useState(null);
  const [profile, setProfile]             = useState(null); // for header avatar / name

  // modals
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showGradesModal,  setShowGradesModal]  = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ username: '', phone_number: '', department: '' });

  // profile photo upload
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg: '', type: '' }), 3500);
  };

  const withLoading = useCallback(async (key, fn) => {
    setLoading(l => ({ ...l, [key]: true }));
    try { await fn(); }
    catch (e) { showAlert(e.response?.data?.message || 'Could not load this section. Try again.', 'error'); }
    finally { setLoading(l => ({ ...l, [key]: false })); }
  }, []);

  // ── load advisor's own profile once, for the header avatar ──
  useEffect(() => {
    advisorGetProfile().then(r => setProfile(r.data)).catch(() => {});
  }, []);

  // ── fetch on tab change ──
  useEffect(() => {
    if (tab === 'dashboard')     withLoading('dashboard', async () => setDashboard((await advisorGetDashboard()).data));
    if (tab === 'students')      withLoading('students',  async () => setStudents((await advisorGetStudents()).data));
    if (tab === 'progress')      withLoading('progress',  async () => setProgress((await advisorGetProgress()).data));
    if (tab === 'reports')       withLoading('reports',   async () => setReport((await advisorGetReport(reportType)).data));
    if (tab === 'notifications') withLoading('notifications', async () => setNotifications((await advisorGetNotifications()).data));
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── student detail ──
  const openStudent = async (student) => {
    try {
      const res = await advisorGetStudent(student.user_id);
      setStudentDetail(res.data);
      setShowStudentModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't load this student's profile.", 'error');
    }
  };

  // ── student grades / academic record ──
  const openGrades = async (student) => {
    try {
      const res = await advisorGetGrades(student.user_id);
      setStudentGrades(res.data);
      setShowGradesModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't load this student's academic record.", 'error');
    }
  };

  // ── profile ──
  const openProfile = async () => {
    try {
      const res = await advisorGetProfile();
      setProfile(res.data);
      setProfileForm({
        username: res.data.username || '',
        phone_number: res.data.phone_number || '',
        department: res.data.department || '',
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
        username: profileForm.username,
        phone_number: profileForm.phone_number,
        department: profileForm.department,
        photo_url: res?.data?.photo_url || p?.photo_url,
      }));
      showAlert('Profile updated successfully.');
      setShowProfileModal(false);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Could not save profile changes.', 'error');
    }
  };

  // ── reports ──
  const generateReport = async (type) => {
    setReportType(type);
    await withLoading('reports', async () => setReport((await advisorGetReport(type)).data));
  };

  // Trigger CSV download of the currently displayed report. Mirrors the
  // admin dashboard's export pattern (AdminDashboard.jsx).
  const exportReportCsv = async () => {
    try {
      const res = await advisorExportReport(reportType);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `advisor_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export report: ' + (err.response?.data?.message || err.message));
    }
  };

  // ── notifications ──
  const markRead = async (id) => {
    try {
      await advisorMarkRead(id);
      setNotifications(ns => ns.map(n => n.notification_id === id ? { ...n, is_read: 1 } : n));
    } catch (e) {
      showAlert(e.response?.data?.message || "Couldn't mark that notification as read.", 'error');
    }
  };
  const unreadCount = notifications.filter(n => !n.is_read).length;

  /* ═══════════════════════════════════════════════════════════ */
  return (
    <div className="adv-root">
      <GlobalStyle />
      <div className="adv-shell" style={{ display: 'flex', minHeight: '100vh', background: token.paper }}>

        {/* ── Sidebar ── */}
        <div className="adv-sidebar" style={sidebar}>
          <div className="adv-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, padding: '0 14px' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', border: `1.5px solid ${token.brass}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 600, color: token.brass, fontSize: 14,
            }}>SA</div>
            <div>
              <div style={{ fontFamily: fontDisplay, fontWeight: 600, color: '#fff', fontSize: 16, lineHeight: 1.1 }}>SILS</div>
              <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.12em', color: '#8893A8', textTransform: 'uppercase' }}>Advisor console</div>
            </div>
          </div>

          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'home' },
            { key: 'students', label: 'My students', icon: 'people' },
            { key: 'progress', label: 'Monitor progress', icon: 'trend' },
            { key: 'reports', label: 'Reports', icon: 'doc' },
            { key: 'notifications', label: 'Notifications', icon: 'bell', badge: unreadCount },
          ].map(item => (
            <div key={item.key} onClick={() => setTab(item.key)}
              className={`adv-nav-item${tab === item.key ? ' active' : ''}`}
              style={{ ...navItem, background: tab === item.key ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === item.key ? '#fff' : '#B7BFCF' }}>
              <Icon name={item.icon} size={16} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {!!item.badge && (
                <span style={{ background: token.brass, color: '#1C2541', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '1px 7px', fontFamily: fontMono }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          <div className="adv-spacer" style={{ flex: 1 }} />

          <div onClick={openProfile} className="adv-nav-item" style={{ ...navItem, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={profile?.username || user?.username} photoUrl={profile?.photo_url} size={28} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.username || user?.username}
              </div>
              <div style={{ fontSize: 11, color: '#8893A8' }}>View profile</div>
            </div>
          </div>
          <div onClick={logout} className="adv-foot adv-nav-item" style={{ ...navItem, color: '#E2A6A1', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Icon name="logout" size={16} /> Log out
          </div>
        </div>

        {/* ── Main ── */}
        <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontFamily: fontMono, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: token.brassDeep, marginBottom: 4 }}>
                {tabEyebrow(tab)}
              </div>
              <h2 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 26 }}>{tabTitle(tab)}</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={profile?.username || user?.username} photoUrl={profile?.photo_url} size={36} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: token.ink }}>{profile?.username || user?.username}</div>
                <div style={{ fontSize: 11.5, color: token.inkFaint }}>Academic Advisor</div>
              </div>
            </div>
          </div>

          <Alert msg={alert.msg} type={alert.type} />

          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            loading.dashboard ? <Loading /> : dashboard && (
              <div className="adv-card">
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
                  <StatCard label="My students" value={dashboard.totalStudents} accent={token.ink} icon="people" />
                  <StatCard label="At risk" value={dashboard.atRiskCount} accent={token.danger} icon="warn" />
                  <StatCard label="Average GPA" value={parseFloat(dashboard.avgGpa).toFixed(2)} accent={token.brass} icon="spark" />
                  <StatCard label="Unread alerts" value={unreadCount} accent={token.info} icon="bell" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div style={card}>
                    <h3 style={cardTitle}><Icon name="warn" size={15} color={token.danger} /> Students at risk</h3>
                    {(dashboard.atRiskStudents || []).length === 0
                      ? <Empty>No students are flagged as at risk right now.</Empty>
                      : dashboard.atRiskStudents.map(s => (
                        <div key={s.user_id} style={listRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Avatar name={s.username} size={32} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13.5, color: token.ink }}>{s.username}</div>
                              <div style={{ fontSize: 12, color: token.inkFaint }}>{s.programme || 'No programme on file'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontFamily: fontMono, fontWeight: 600, color: gpaColor(s.gpa) }}>{parseFloat(s.gpa || 0).toFixed(2)}</span>
                            <button className="adv-row-btn" style={btnSmall} onClick={() => openStudent(s)}>View</button>
                          </div>
                        </div>
                      ))
                    }
                  </div>

                  <div style={card}>
                    <h3 style={cardTitle}><Icon name="trend" size={15} color={token.ink} /> Recent student activity</h3>
                    {(dashboard.recentActivity || []).length === 0
                      ? <Empty>Nothing logged yet — activity will appear here as students engage with their courses.</Empty>
                      : dashboard.recentActivity.map((a, i) => (
                        <div key={i} style={{ padding: '9px 0', borderBottom: `1px solid ${token.line}`, fontSize: 13 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 600, color: token.ink }}>{a.username}</span>
                            <span style={{ color: token.inkFaint, fontSize: 11.5, fontFamily: fontMono }}>
                              {new Date(a.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div style={{ color: token.inkSoft, marginTop: 1 }}>{a.description}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )
          )}

          {/* ── STUDENTS ── */}
          {tab === 'students' && (
            <div style={card} className="adv-card">
              <h3 style={cardTitle}><Icon name="people" size={15} /> Assigned students</h3>
              {loading.students ? <Loading /> : students.length === 0
                ? <Empty>No students are assigned to you yet — once admin assigns a cohort, they'll appear here.</Empty>
                : <div className="adv-table-wrap">
                  <table style={table}>
                    <thead><tr>{['Student', 'Email', 'Programme', 'Level', 'GPA', 'Courses', 'Status', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.user_id} className="adv-table-row">
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar name={s.username} size={30} />
                              <div>
                                <div style={{ fontWeight: 600, color: token.ink }}>{s.username}</div>
                                {!!s.is_at_risk && <RiskPill atRisk />}
                              </div>
                            </div>
                          </td>
                          <td style={td}>{s.email}</td>
                          <td style={td}>{s.programme || '—'}</td>
                          <td style={td}>{s.academic_level || '—'}</td>
                          <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: gpaColor(s.gpa) }}>{parseFloat(s.gpa || 0).toFixed(2)}</td>
                          <td style={{ ...td, fontFamily: fontMono }}>{s.enrolled_courses}</td>
                          <td style={td}><span style={statusBadge(s.status)}>{s.status}</span></td>
                          <td style={td}>
                            <button className="adv-row-btn" style={btnSmall} onClick={() => openStudent(s)}>Profile</button>
                            <button className="adv-row-btn" style={{ ...btnSmall, background: token.brass }} onClick={() => openGrades(s)}>Records</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* ── PROGRESS MONITORING ── */}
          {tab === 'progress' && (
            <div style={card} className="adv-card">
              <h3 style={cardTitle}><Icon name="trend" size={15} /> Performance overview</h3>
              {loading.progress ? <Loading /> : progress.length === 0
                ? <Empty>No performance data yet — this fills in once students start completing courses and quizzes.</Empty>
                : <div className="adv-table-wrap">
                  <table style={table}>
                    <thead><tr>{['Student', 'Programme', 'GPA', 'Avg. completion', 'Avg. quiz score', 'Quizzes taken', 'Standing'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {progress.map(s => (
                        <tr key={s.user_id} className="adv-table-row">
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar name={s.username} size={28} /> <span style={{ fontWeight: 600, color: token.ink }}>{s.username}</span>
                            </div>
                          </td>
                          <td style={td}>{s.programme || '—'}</td>
                          <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: gpaColor(s.gpa) }}>{parseFloat(s.gpa || 0).toFixed(2)}</td>
                          <td style={td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ background: token.line, borderRadius: 99, height: 6, width: 80 }}>
                                <div style={{ background: token.ink, height: 6, borderRadius: 99, width: `${s.avg_completion}%` }} />
                              </div>
                              <span style={{ fontSize: 12, fontFamily: fontMono, color: token.inkSoft }}>{parseFloat(s.avg_completion).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: scoreColor(s.avg_quiz_score) }}>{parseFloat(s.avg_quiz_score).toFixed(1)}%</td>
                          <td style={{ ...td, fontFamily: fontMono }}>{s.total_quizzes}</td>
                          <td style={td}><RiskPill atRisk={!!s.is_at_risk} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          )}

          {/* ── REPORTS ── */}
          {tab === 'reports' && (
            <div className="adv-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'inline-flex', background: token.surface, border: `1px solid ${token.line}`, borderRadius: 8, padding: 3 }}>
                  {[['progress', 'Progress report'], ['academic', 'Academic summary']].map(([key, label]) => (
                    <button key={key} className="adv-tab-btn" onClick={() => generateReport(key)}
                      style={{
                        border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        background: reportType === key ? token.ink : 'transparent',
                        color: reportType === key ? '#fff' : token.inkSoft,
                      }}>{label}</button>
                  ))}
                </div>
                <button
                  onClick={exportReportCsv}
                  disabled={!report || report.data.length === 0}
                  style={{
                    padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: (!report || report.data.length === 0) ? 'not-allowed' : 'pointer',
                    border: `1px solid ${token.line}`, borderRadius: 6,
                    background: (!report || report.data.length === 0) ? token.surface : token.ink,
                    color: (!report || report.data.length === 0) ? token.inkFaint : '#fff',
                    display: 'inline-flex', alignItems: 'center', gap: 6
                  }}>
                  <Icon name="download" size={13} /> Export CSV
                </button>
              </div>

              {loading.reports ? <Loading /> : report && (
                <div style={card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                    <h3 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 17 }}>{report.type}</h3>
                    <span style={{ fontSize: 12, color: token.inkFaint, fontFamily: fontMono }}>
                      Generated {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  {report.data.length === 0 ? <Empty>No student data available to build this report yet.</Empty> : (
                    <div className="adv-table-wrap">
                      {reportType === 'progress' ? (
                        <table style={table}>
                          <thead><tr>{['Student', 'Programme', 'GPA', 'Courses', 'Avg. completion', 'Avg. score', 'At risk'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                          <tbody>
                            {report.data.map((s, i) => (
                              <tr key={i} className="adv-table-row">
                                <td style={td}>{s.username}</td>
                                <td style={td}>{s.programme || '—'}</td>
                                <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: gpaColor(s.gpa) }}>{parseFloat(s.gpa || 0).toFixed(2)}</td>
                                <td style={{ ...td, fontFamily: fontMono }}>{s.total_courses}</td>
                                <td style={{ ...td, fontFamily: fontMono }}>{parseFloat(s.avg_completion).toFixed(1)}%</td>
                                <td style={{ ...td, fontFamily: fontMono }}>{parseFloat(s.avg_quiz_score).toFixed(1)}%</td>
                                <td style={td}><RiskPill atRisk={!!s.is_at_risk} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <table style={table}>
                          <thead><tr>{['Student', 'Email', 'Programme', 'Level', 'GPA', 'Enrolled', 'Completed', 'At risk'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                          <tbody>
                            {report.data.map((s, i) => (
                              <tr key={i} className="adv-table-row">
                                <td style={td}>{s.username}</td>
                                <td style={td}>{s.email}</td>
                                <td style={td}>{s.programme || '—'}</td>
                                <td style={td}>{s.academic_level || '—'}</td>
                                <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: gpaColor(s.gpa) }}>{parseFloat(s.gpa || 0).toFixed(2)}</td>
                                <td style={{ ...td, fontFamily: fontMono }}>{s.enrolled_courses}</td>
                                <td style={{ ...td, fontFamily: fontMono }}>{s.completed_courses}</td>
                                <td style={td}><RiskPill atRisk={!!s.is_at_risk} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === 'notifications' && (
            <div style={card} className="adv-card">
              <h3 style={cardTitle}><Icon name="bell" size={15} /> Notifications</h3>
              {loading.notifications ? <Loading /> : notifications.length === 0
                ? <Empty>You're all caught up — new alerts about your students will show up here.</Empty>
                : notifications.map(n => (
                  <div key={n.notification_id} style={{
                    display: 'flex', gap: 12, padding: '13px 16px', borderRadius: 8, marginBottom: 8,
                    background: n.is_read ? token.surface : token.infoSoft,
                    border: `1px solid ${n.is_read ? token.line : token.info + '33'}`,
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: n.is_read ? 'transparent' : token.info }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 14, color: token.ink }}>{n.title}</div>
                        <div style={{ fontSize: 11.5, color: token.inkFaint, fontFamily: fontMono, whiteSpace: 'nowrap' }}>
                          {new Date(n.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ fontSize: 13, color: token.inkSoft, marginTop: 3 }}>{n.message}</div>
                      {!n.is_read &&
                        <button className="adv-row-btn" style={{ ...btnSmall, marginTop: 9 }} onClick={() => markRead(n.notification_id)}>
                          Mark as read
                        </button>
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* ── STUDENT DETAIL MODAL ── */}
        {showStudentModal && studentDetail && (
          <Modal title={`${studentDetail.profile?.username}'s profile`} onClose={() => setShowStudentModal(false)} wide>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div>
                <h4 style={sectionLabel}>Personal info</h4>
                {[
                  ['Email', studentDetail.profile?.email],
                  ['Department', studentDetail.profile?.department || '—'],
                  ['Programme', studentDetail.profile?.programme || '—'],
                  ['Academic level', studentDetail.profile?.academic_level || '—'],
                ].map(([label, value]) => (
                  <div key={label} style={kvRow}><span style={kvLabel}>{label}</span><span style={kvValue}>{value}</span></div>
                ))}
                <div style={kvRow}><span style={kvLabel}>GPA</span>
                  <span style={{ ...kvValue, fontFamily: fontMono, color: gpaColor(studentDetail.profile?.gpa) }}>
                    {parseFloat(studentDetail.profile?.gpa || 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ ...kvRow, borderBottom: 'none' }}><span style={kvLabel}>Standing</span><RiskPill atRisk={!!studentDetail.profile?.is_at_risk} /></div>
              </div>

              <div>
                <h4 style={sectionLabel}>Enrolled courses</h4>
                {(studentDetail.courses || []).length === 0
                  ? <Empty>Not enrolled in any course yet.</Empty>
                  : studentDetail.courses.map((c, i) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${token.line}`, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, color: token.ink }}>{c.title}</div>
                      <div style={{ color: token.inkFaint, fontSize: 12 }}>Taught by {c.instructor_name}</div>
                      <div style={{ background: token.line, borderRadius: 99, height: 5, margin: '6px 0 3px' }}>
                        <div style={{ background: token.ink, height: 5, borderRadius: 99, width: `${c.completion_percent}%` }} />
                      </div>
                      <div style={{ fontSize: 11.5, color: token.inkSoft, fontFamily: fontMono }}>{c.completion_percent}% complete · {c.enrollment_status}</div>
                    </div>
                  ))
                }
              </div>

              <div style={{ gridColumn: '1/-1' }}>
                <h4 style={sectionLabel}>Recent quiz history</h4>
                {(studentDetail.quizHistory || []).length === 0
                  ? <Empty>No quiz attempts recorded yet.</Empty>
                  : <div className="adv-table-wrap"><table style={table}>
                    <thead><tr>{['Quiz', 'Course', 'Score', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                    <tbody>
                      {studentDetail.quizHistory.map((q, i) => (
                        <tr key={i} className="adv-table-row">
                          <td style={td}>{q.quiz_title}</td>
                          <td style={td}>{q.course_title}</td>
                          <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: q.status === 'graded' ? scoreColor(q.score) : token.warn }}>
                            {q.status === 'graded' ? `${parseFloat(q.score).toFixed(1)}%` : 'Pending'}
                          </td>
                          <td style={td}>{new Date(q.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                }
              </div>
            </div>
          </Modal>
        )}

        {/* ── GRADES / ACADEMIC RECORD MODAL ── */}
        {showGradesModal && studentGrades && (
          <Modal title={`${studentGrades.profile?.username}'s academic record`} onClose={() => setShowGradesModal(false)} wide>
            <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap' }}>
              <StatCard label="GPA" value={parseFloat(studentGrades.profile?.gpa || 0).toFixed(2)} accent={gpaColor(studentGrades.profile?.gpa)} />
              <StatCard label="Programme" value={studentGrades.profile?.programme || '—'} accent={token.brass} />
              <StatCard label="Level" value={studentGrades.profile?.academic_level || '—'} accent={token.info} />
            </div>

            <h4 style={sectionLabel}>Grade history</h4>
            {(studentGrades.grades || []).length === 0
              ? <Empty>No quiz grades recorded yet — they'll appear here once the student completes a graded quiz.</Empty>
              : <div className="adv-table-wrap"><table style={table}>
                <thead><tr>{['Quiz', 'Course', 'Score', 'Type', 'Status', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {studentGrades.grades.map((g, i) => (
                    <tr key={i} className="adv-table-row">
                      <td style={td}>{g.quiz_title}</td>
                      <td style={td}>{g.course_title}</td>
                      <td style={{ ...td, fontFamily: fontMono, fontWeight: 700, color: g.status === 'graded' ? scoreColor(g.score) : token.warn }}>
                        {g.status === 'graded' ? `${parseFloat(g.score).toFixed(1)}%` : 'Pending'}
                      </td>
                      <td style={td}>{g.submission_type}</td>
                      <td style={td}><span style={statusBadge(g.status)}>{g.status}</span></td>
                      <td style={td}>{new Date(g.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            }

            {/* Academic history (enrolment record) — was missing entirely before; backend now returns it */}
            <h4 style={{ ...sectionLabel, marginTop: 24 }}>Academic history</h4>
            {(studentGrades.academicHistory || []).length === 0
              ? <Empty>No enrolment history on file yet.</Empty>
              : <div className="adv-table-wrap"><table style={table}>
                <thead><tr>{['Course', 'Status', 'Completion', 'Enrolled', 'Completed'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {studentGrades.academicHistory.map((h, i) => (
                    <tr key={i} className="adv-table-row">
                      <td style={td}>{h.course_title}</td>
                      <td style={td}><span style={statusBadge(h.enrollment_status)}>{h.enrollment_status}</span></td>
                      <td style={{ ...td, fontFamily: fontMono }}>{parseFloat(h.completion_percent || 0).toFixed(0)}%</td>
                      <td style={td}>{h.enrolled_at ? new Date(h.enrolled_at).toLocaleDateString() : '—'}</td>
                      <td style={td}>{h.completed_at ? new Date(h.completed_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            }
          </Modal>
        )}

        {/* ── PROFILE MODAL ── */}
        {showProfileModal && (
          <Modal title="My profile" onClose={() => setShowProfileModal(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <Avatar name={profileForm.username} photoUrl={photoPreview || profile?.photo_url} size={64} />
              <div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={onPhotoChange} style={{ display: 'none' }} />
                <button type="button" className="adv-row-btn" style={{ ...btnSmall, padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => fileInputRef.current?.click()}>
                  <Icon name="camera" size={13} /> Change photo
                </button>
                <div style={{ fontSize: 11.5, color: token.inkFaint, marginTop: 6 }}>JPG or PNG, up to 5MB.</div>
              </div>
            </div>

            {[
              { label: 'Username', key: 'username' },
              { label: 'Phone', key: 'phone_number' },
              { label: 'Department', key: 'department' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={formLabel}>{f.label}</label>
                <input className="adv-input" style={formInput} value={profileForm[f.key] || ''}
                  onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} />
              </div>
            ))}
            <button className="adv-btn" style={{ ...btnPrimary, width: '100%', marginTop: 6 }} onClick={saveProfile}>
              Save changes
            </button>
          </Modal>
        )}
      </div>
    </div>
  );
}

/* ─── Copy helpers ─── */
const tabEyebrow = (t) => ({
  dashboard: 'Overview', students: 'Cohort', progress: 'Performance',
  reports: 'Export', notifications: 'Inbox',
}[t] || '');
const tabTitle = (t) => ({
  dashboard: 'Dashboard', students: 'My students', progress: 'Monitor progress',
  reports: 'Generate reports', notifications: 'Notifications',
}[t] || '');

/* ─── Styles ─── */
const sidebar    = { width: 232, background: token.ink, padding: '28px 16px', display: 'flex', flexDirection: 'column', gap: 3 };
const navItem    = { padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 };
const card       = { background: token.surface, borderRadius: 12, padding: 22, border: `1px solid ${token.line}` };
const cardTitle  = { marginTop: 0, marginBottom: 14, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 };
const listRow    = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${token.line}` };
const table      = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 };
const th         = { textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` };
const td         = { padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink };
const btnPrimary = { background: token.ink, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
const btnSmall   = { background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 };
const overlay    = { position: 'fixed', inset: 0, background: 'rgba(28,37,65,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modalBox   = { background: token.surface, borderRadius: 14, padding: 30, width: '100%', maxHeight: '88vh', overflowY: 'auto' };
const closeBtn   = { background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, lineHeight: 0 };
const formLabel  = { display: 'block', fontSize: 12.5, fontWeight: 600, color: token.inkSoft, marginBottom: 5 };
const formInput  = { width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: fontBody, color: token.ink };
const sectionLabel = { marginTop: 0, marginBottom: 10, fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: token.inkFaint };
const kvRow      = { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${token.line}`, fontSize: 13.5 };
const kvLabel    = { color: token.inkSoft };
const kvValue    = { fontWeight: 600, color: token.ink };
const statusBadge = (s) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { active: token.goodSoft, inactive: token.line, suspended: token.dangerSoft, dropped: token.dangerSoft, completed: token.infoSoft, graded: token.goodSoft, submitted: token.warnSoft, in_progress: token.infoSoft, pending: token.warnSoft }[s] || token.line,
  color: { active: token.good, inactive: token.inkSoft, suspended: token.danger, dropped: token.danger, completed: token.info, graded: token.good, submitted: token.warn, in_progress: token.info, pending: token.warn }[s] || token.inkSoft,
});