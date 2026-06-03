import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  advisorGetDashboard, advisorGetProfile, advisorUpdateProfile,
  advisorGetStudents, advisorGetStudent, advisorGetGrades,
  advisorGetProgress, advisorGetReport,
  advisorGetNotifications, advisorMarkRead
} from '../services/api';

// ─── Reusable UI ─────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:14,
      background: type==='error'?'#fee2e2':'#dcfce7',
      color: type==='error'?'#dc2626':'#16a34a'
    }}>{msg}</div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: wide ? 800 : 500 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h3 style={{ margin:0 }}>{title}</h3>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background:color, borderRadius:10, padding:'20px 28px', color:'#fff', minWidth:130 }}>
      <div style={{ fontSize:30, fontWeight:'bold' }}>{value}</div>
      <div style={{ fontSize:13, marginTop:4 }}>{label}</div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function AdvisorDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab]     = useState('dashboard');
  const [alert, setAlert] = useState({ msg:'', type:'' });

  // data
  const [dashboard, setDashboard]         = useState(null);
  const [students, setStudents]           = useState([]);
  const [progress, setProgress]           = useState([]);
  const [report, setReport]               = useState(null);
  const [reportType, setReportType]       = useState('progress');
  const [notifications, setNotifications] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail]     = useState(null);
  const [studentGrades, setStudentGrades]     = useState(null);

  // modals
  const [showStudentModal,  setShowStudentModal]  = useState(false);
  const [showGradesModal,   setShowGradesModal]   = useState(false);
  const [showProfileModal,  setShowProfileModal]  = useState(false);
  const [profileForm, setProfileForm] = useState({ username:'', phone_number:'', department:'' });

  const showAlert = (msg, type='success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg:'', type:'' }), 3000);
  };

  // ── Fetch on tab change ──
  useEffect(() => {
    if (tab==='dashboard')
      advisorGetDashboard().then(r=>setDashboard(r.data)).catch(()=>{});
    if (tab==='students')
      advisorGetStudents().then(r=>setStudents(r.data)).catch(()=>{});
    if (tab==='progress')
      advisorGetProgress().then(r=>setProgress(r.data)).catch(()=>{});
    if (tab==='reports')
      advisorGetReport(reportType).then(r=>setReport(r.data)).catch(()=>{});
    if (tab==='notifications')
      advisorGetNotifications().then(r=>setNotifications(r.data)).catch(()=>{});
  }, [tab]);

  // ── Open student detail ──
  const openStudent = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await advisorGetStudent(student.user_id);
      setStudentDetail(res.data);
      setShowStudentModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to load student', 'error');
    }
  };

  // ── Open student grades ──
  const openGrades = async (student) => {
    setSelectedStudent(student);
    try {
      const res = await advisorGetGrades(student.user_id);
      setStudentGrades(res.data);
      setShowGradesModal(true);
    } catch (e) {
      showAlert(e.response?.data?.message || 'Failed to load grades', 'error');
    }
  };

  // ── Profile ──
  const openProfile = async () => {
    const res = await advisorGetProfile();
    setProfileForm({
      username:     res.data.username||'',
      phone_number: res.data.phone_number||'',
      department:   res.data.department||''
    });
    setShowProfileModal(true);
  };
  const saveProfile = async () => {
    try {
      await advisorUpdateProfile(profileForm);
      showAlert('Profile updated!');
      setShowProfileModal(false);
    } catch (e) {
      showAlert(e.response?.data?.message||'Failed','error');
    }
  };

  // ── Generate report ──
  const generateReport = async (type) => {
    setReportType(type);
    try {
      const res = await advisorGetReport(type);
      setReport(res.data);
    } catch { showAlert('Failed to generate report','error'); }
  };

  // ── Notifications ──
  const markRead = async (id) => {
    await advisorMarkRead(id);
    advisorGetNotifications().then(r=>setNotifications(r.data));
  };
  const unreadCount = notifications.filter(n=>!n.is_read).length;

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Arial, sans-serif' }}>

      {/* Sidebar */}
      <div style={sidebar}>
        <div style={{ fontSize:16, fontWeight:'bold', color:'#fff', marginBottom:32 }}>
          🎓 SILS Advisor
        </div>
        {[
          { key:'dashboard',     label:'🏠 Dashboard'       },
          { key:'students',      label:'👥 My Students'      },
          { key:'progress',      label:'📈 Monitor Progress' },
          { key:'reports',       label:'📄 Reports'          },
          { key:'notifications', label:`🔔 Alerts ${unreadCount>0?`(${unreadCount})`:''}`},
        ].map(item=>(
          <div key={item.key} onClick={()=>setTab(item.key)}
            style={{ ...navItem, background: tab===item.key?'#2563eb':'transparent' }}>
            {item.label}
          </div>
        ))}
        <div onClick={openProfile} style={{ ...navItem, marginTop:8 }}>👤 My Profile</div>
        <div onClick={logout} style={{ ...navItem, marginTop:'auto', color:'#fca5a5' }}>🚪 Logout</div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:32, background:'#f8fafc', overflowY:'auto' }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ margin:0 }}>{tabTitle(tab)}</h2>
          <p style={{ color:'#64748b', margin:'4px 0 0' }}>Welcome, {user.username}!</p>
        </div>

        <Alert msg={alert.msg} type={alert.type} />

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && dashboard && (
          <div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
              <StatCard label="My Students"    value={dashboard.totalStudents} color="#2563eb" />
              <StatCard label="At-Risk"        value={dashboard.atRiskCount}   color="#dc2626" />
              <StatCard label="Average GPA"    value={parseFloat(dashboard.avgGpa).toFixed(2)} color="#7c3aed" />
              <StatCard label="Notifications"  value={unreadCount}             color="#d97706" />
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
              {/* At-risk students */}
              <div style={card}>
                <h3 style={{ marginTop:0, color:'#dc2626' }}>⚠️ At-Risk Students</h3>
                {dashboard.atRiskStudents.length===0
                  ? <p style={{ color:'#94a3b8', fontSize:14 }}>No at-risk students. 🎉</p>
                  : dashboard.atRiskStudents.map(s=>(
                    <div key={s.user_id} style={{ padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14 }}>{s.username}</div>
                          <div style={{ fontSize:12, color:'#64748b' }}>{s.programme||'—'}</div>
                          <div style={{ fontSize:13, color:'#dc2626', fontWeight:600 }}>
                            GPA: {parseFloat(s.gpa||0).toFixed(2)}
                          </div>
                        </div>
                        <button style={btnSmall} onClick={()=>openStudent(s)}>View</button>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Recent activity */}
              <div style={card}>
                <h3 style={{ marginTop:0 }}>📋 Recent Student Activity</h3>
                {dashboard.recentActivity.length===0
                  ? <p style={{ color:'#94a3b8', fontSize:14 }}>No recent activity.</p>
                  : dashboard.recentActivity.map((a,i)=>(
                    <div key={i} style={{ padding:'8px 0', borderBottom:'1px solid #f1f5f9', fontSize:13 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:600 }}>{a.username}</span>
                        <span style={{ color:'#94a3b8', fontSize:12 }}>
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ color:'#475569' }}>{a.description}</div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENTS ── */}
        {tab==='students' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>My Assigned Students</h3>
            {students.length===0
              ? <p style={{ color:'#94a3b8' }}>No students assigned to you yet. Ask admin to assign students.</p>
              : <table style={table}>
                <thead>
                  <tr>{['Student','Email','Programme','Level','GPA','Courses','Status','Actions']
                    .map(h=><th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {students.map(s=>(
                    <tr key={s.user_id} style={{ background: s.is_at_risk?'#fff7f7':'' }}>
                      <td style={td}>
                        <div style={{ fontWeight:600 }}>{s.username}</div>
                        {s.is_at_risk && <span style={{ fontSize:11, color:'#dc2626' }}>⚠️ At Risk</span>}
                      </td>
                      <td style={td}>{s.email}</td>
                      <td style={td}>{s.programme||'—'}</td>
                      <td style={td}>{s.academic_level||'—'}</td>
                      <td style={td}>
                        <span style={{ fontWeight:700,
                          color: s.gpa>=3?'#16a34a':s.gpa>=2?'#d97706':'#dc2626' }}>
                          {parseFloat(s.gpa||0).toFixed(2)}
                        </span>
                      </td>
                      <td style={td}>{s.enrolled_courses}</td>
                      <td style={td}>
                        <span style={statusBadge(s.status)}>{s.status}</span>
                      </td>
                      <td style={td}>
                        <button style={btnSmall} onClick={()=>openStudent(s)}>Profile</button>
                        <button style={{ ...btnSmall, background:'#7c3aed' }}
                          onClick={()=>openGrades(s)}>Grades</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        )}

        {/* ── PROGRESS MONITORING ── */}
        {tab==='progress' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>📈 Student Progress Overview</h3>
            {progress.length===0
              ? <p style={{ color:'#94a3b8' }}>No student data available.</p>
              : <table style={table}>
                <thead>
                  <tr>{['Student','Programme','GPA','Avg Completion','Avg Quiz Score','Quizzes Taken','Risk']
                    .map(h=><th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {progress.map(s=>(
                    <tr key={s.user_id} style={{ background: s.is_at_risk?'#fff7f7':'' }}>
                      <td style={td}><div style={{ fontWeight:600 }}>{s.username}</div></td>
                      <td style={td}>{s.programme||'—'}</td>
                      <td style={td}>
                        <span style={{ fontWeight:700,
                          color: s.gpa>=3?'#16a34a':s.gpa>=2?'#d97706':'#dc2626' }}>
                          {parseFloat(s.gpa||0).toFixed(2)}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ background:'#e2e8f0', borderRadius:99, height:6, width:80 }}>
                            <div style={{ background:'#2563eb', height:6, borderRadius:99,
                              width:`${s.avg_completion}%` }} />
                          </div>
                          <span style={{ fontSize:12 }}>{parseFloat(s.avg_completion).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td style={td}>
                        <span style={{ fontWeight:700,
                          color: s.avg_quiz_score>=70?'#16a34a':s.avg_quiz_score>=50?'#d97706':'#dc2626' }}>
                          {parseFloat(s.avg_quiz_score).toFixed(1)}%
                        </span>
                      </td>
                      <td style={td}>{s.total_quizzes}</td>
                      <td style={td}>
                        {s.is_at_risk
                          ? <span style={{ color:'#dc2626', fontWeight:700 }}>⚠️ At Risk</span>
                          : <span style={{ color:'#16a34a' }}>✅ OK</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        )}

        {/* ── REPORTS ── */}
        {tab==='reports' && (
          <div>
            <div style={{ display:'flex', gap:12, marginBottom:20 }}>
              <button style={{ ...btnPrimary, background: reportType==='progress'?'#2563eb':'#64748b' }}
                onClick={()=>generateReport('progress')}>
                📊 Progress Report
              </button>
              <button style={{ ...btnPrimary, background: reportType==='academic'?'#2563eb':'#64748b' }}
                onClick={()=>generateReport('academic')}>
                🎓 Academic Summary
              </button>
            </div>

            {report && (
              <div style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h3 style={{ margin:0 }}>{report.type}</h3>
                  <span style={{ fontSize:13, color:'#64748b' }}>
                    Generated: {new Date().toLocaleDateString()}
                  </span>
                </div>

                {reportType==='progress' && (
                  <table style={table}>
                    <thead>
                      <tr>{['Student','Programme','GPA','Courses','Avg Completion','Avg Score','At Risk']
                        .map(h=><th key={h} style={th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((s,i)=>(
                        <tr key={i}>
                          <td style={td}>{s.username}</td>
                          <td style={td}>{s.programme||'—'}</td>
                          <td style={td}>{parseFloat(s.gpa||0).toFixed(2)}</td>
                          <td style={td}>{s.total_courses}</td>
                          <td style={td}>{parseFloat(s.avg_completion).toFixed(1)}%</td>
                          <td style={td}>{parseFloat(s.avg_quiz_score).toFixed(1)}%</td>
                          <td style={td}>{s.is_at_risk?'⚠️ Yes':'✅ No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {reportType==='academic' && (
                  <table style={table}>
                    <thead>
                      <tr>{['Student','Email','Programme','Level','GPA','Enrolled','Completed','At Risk']
                        .map(h=><th key={h} style={th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((s,i)=>(
                        <tr key={i}>
                          <td style={td}>{s.username}</td>
                          <td style={td}>{s.email}</td>
                          <td style={td}>{s.programme||'—'}</td>
                          <td style={td}>{s.academic_level||'—'}</td>
                          <td style={td}>
                            <span style={{ fontWeight:700,
                              color: s.gpa>=3?'#16a34a':s.gpa>=2?'#d97706':'#dc2626' }}>
                              {parseFloat(s.gpa||0).toFixed(2)}
                            </span>
                          </td>
                          <td style={td}>{s.enrolled_courses}</td>
                          <td style={td}>{s.completed_courses}</td>
                          <td style={td}>{s.is_at_risk?'⚠️ Yes':'✅ No'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab==='notifications' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>🔔 Notifications</h3>
            {notifications.length===0
              ? <p style={{ color:'#94a3b8' }}>No notifications yet.</p>
              : notifications.map(n=>(
                <div key={n.notification_id} style={{
                  padding:'12px 16px', borderRadius:8, marginBottom:8,
                  background: n.is_read?'#f8fafc':'#eff6ff',
                  border:`1px solid ${n.is_read?'#e2e8f0':'#bfdbfe'}`
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div style={{ fontWeight:n.is_read?400:700, fontSize:14 }}>{n.title}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>
                      {new Date(n.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize:13, color:'#475569', marginTop:4 }}>{n.message}</div>
                  {!n.is_read &&
                    <button style={{ ...btnSmall, marginTop:8 }} onClick={()=>markRead(n.notification_id)}>
                      Mark Read
                    </button>
                  }
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* ── STUDENT DETAIL MODAL ── */}
      {showStudentModal && studentDetail && (
        <Modal title={`👤 ${studentDetail.profile?.username}'s Profile`}
          onClose={()=>setShowStudentModal(false)} wide>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

            {/* Profile info */}
            <div>
              <h4 style={{ marginTop:0, color:'#475569' }}>Personal Info</h4>
              {[
                ['Email',          studentDetail.profile?.email],
                ['Department',     studentDetail.profile?.department||'—'],
                ['Programme',      studentDetail.profile?.programme||'—'],
                ['Academic Level', studentDetail.profile?.academic_level||'—'],
                ['GPA',            parseFloat(studentDetail.profile?.gpa||0).toFixed(2)],
                ['At Risk',        studentDetail.profile?.is_at_risk?'⚠️ Yes':'✅ No'],
              ].map(([label, value])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  padding:'7px 0', borderBottom:'1px solid #f1f5f9', fontSize:14 }}>
                  <span style={{ color:'#64748b' }}>{label}</span>
                  <span style={{ fontWeight:600 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Enrolled courses */}
            <div>
              <h4 style={{ marginTop:0, color:'#475569' }}>Enrolled Courses</h4>
              {studentDetail.courses?.length===0
                ? <p style={{ color:'#94a3b8', fontSize:13 }}>No enrollments.</p>
                : studentDetail.courses?.map((c,i)=>(
                  <div key={i} style={{ padding:'7px 0', borderBottom:'1px solid #f1f5f9', fontSize:13 }}>
                    <div style={{ fontWeight:600 }}>{c.title}</div>
                    <div style={{ color:'#64748b' }}>by {c.instructor_name}</div>
                    <div style={{ background:'#e2e8f0', borderRadius:99, height:4, margin:'4px 0' }}>
                      <div style={{ background:'#2563eb', height:4, borderRadius:99,
                        width:`${c.completion_percent}%` }} />
                    </div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{c.completion_percent}% complete</div>
                  </div>
                ))
              }
            </div>

            {/* Quiz history */}
            <div style={{ gridColumn:'1/-1' }}>
              <h4 style={{ marginTop:0, color:'#475569' }}>Recent Quiz History</h4>
              {studentDetail.quizHistory?.length===0
                ? <p style={{ color:'#94a3b8', fontSize:13 }}>No quiz attempts yet.</p>
                : <table style={table}>
                  <thead>
                    <tr>{['Quiz','Course','Score','Date'].map(h=><th key={h} style={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {studentDetail.quizHistory?.map((q,i)=>(
                      <tr key={i}>
                        <td style={td}>{q.quiz_title}</td>
                        <td style={td}>{q.course_title}</td>
                        <td style={td}>
                          {q.status==='graded'
                            ? <span style={{ fontWeight:700,
                                color: q.score>=70?'#16a34a':q.score>=50?'#d97706':'#dc2626' }}>
                                {parseFloat(q.score).toFixed(1)}%
                              </span>
                            : <span style={{ color:'#d97706' }}>Pending</span>
                          }
                        </td>
                        <td style={td}>{new Date(q.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          </div>
        </Modal>
      )}

      {/* ── GRADES MODAL ── */}
      {showGradesModal && studentGrades && (
        <Modal title={`📊 ${studentGrades.profile?.username}'s Academic Records`}
          onClose={()=>setShowGradesModal(false)} wide>

          {/* GPA Summary */}
          <div style={{ display:'flex', gap:16, marginBottom:20 }}>
            <StatCard label="GPA" value={parseFloat(studentGrades.profile?.gpa||0).toFixed(2)} color="#7c3aed" />
            <StatCard label="Programme" value={studentGrades.profile?.programme||'—'} color="#2563eb" />
            <StatCard label="Level" value={studentGrades.profile?.academic_level||'—'} color="#059669" />
          </div>

          <h4 style={{ marginTop:0 }}>Grade History</h4>
          {studentGrades.grades?.length===0
            ? <p style={{ color:'#94a3b8' }}>No grades recorded yet.</p>
            : <table style={table}>
              <thead>
                <tr>{['Quiz','Course','Score','Type','Status','Date']
                  .map(h=><th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {studentGrades.grades?.map((g,i)=>(
                  <tr key={i}>
                    <td style={td}>{g.quiz_title}</td>
                    <td style={td}>{g.course_title}</td>
                    <td style={td}>
                      {g.status==='graded'
                        ? <span style={{ fontWeight:700,
                            color: g.score>=70?'#16a34a':g.score>=50?'#d97706':'#dc2626' }}>
                            {parseFloat(g.score).toFixed(1)}%
                          </span>
                        : <span style={{ color:'#d97706' }}>Pending</span>
                      }
                    </td>
                    <td style={td}>{g.submission_type}</td>
                    <td style={td}><span style={statusBadge(g.status)}>{g.status}</span></td>
                    <td style={td}>{new Date(g.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </Modal>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={()=>setShowProfileModal(false)}>
          {[
            {label:'Username',    key:'username'},
            {label:'Phone',       key:'phone_number'},
            {label:'Department',  key:'department'},
          ].map(f=>(
            <div key={f.key} style={{ marginBottom:12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={profileForm[f.key]||''}
                onChange={e=>setProfileForm({...profileForm,[f.key]:e.target.value})} />
            </div>
          ))}
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveProfile}>
            Save Profile
          </button>
        </Modal>
      )}
    </div>
  );
}

// ─── Helpers & Styles ─────────────────────────────────────
const tabTitle = (t) => ({
  dashboard:     '🏠 Dashboard Overview',
  students:      '👥 My Students',
  progress:      '📈 Monitor Progress',
  reports:       '📄 Generate Reports',
  notifications: '🔔 Notifications',
}[t]||'');

const sidebar    = { width:220, background:'#1e293b', padding:'28px 16px', display:'flex', flexDirection:'column', gap:4 };
const navItem    = { padding:'10px 14px', borderRadius:8, color:'#cbd5e1', cursor:'pointer', fontSize:14 };
const card       = { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' };
const table      = { width:'100%', borderCollapse:'collapse', fontSize:14 };
const th         = { textAlign:'left', padding:'10px 12px', background:'#f1f5f9', color:'#475569', fontWeight:600 };
const td         = { padding:'10px 12px', borderBottom:'1px solid #f1f5f9', color:'#334155' };
const btnPrimary = { background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'10px 18px', cursor:'pointer', fontSize:14, fontWeight:600 };
const btnSmall   = { background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12, marginRight:4 };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modalBox   = { background:'#fff', borderRadius:12, padding:28, width:'100%', maxHeight:'90vh', overflowY:'auto' };
const closeBtn   = { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#64748b' };
const formLabel  = { display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:4 };
const formInput  = { width:'100%', padding:'9px 11px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, boxSizing:'border-box' };
const statusBadge = (s) => ({ display:'inline-block', padding:'2px 10px', borderRadius:99, fontSize:12, fontWeight:600,
  background:{active:'#dcfce7',inactive:'#f1f5f9',suspended:'#fee2e2',graded:'#dcfce7',submitted:'#fef9c3',in_progress:'#eff6ff',pending:'#fef9c3'}[s]||'#f1f5f9',
  color:{active:'#15803d',inactive:'#64748b',suspended:'#dc2626',graded:'#15803d',submitted:'#854d0e',in_progress:'#1d4ed8',pending:'#854d0e'}[s]||'#334155' });