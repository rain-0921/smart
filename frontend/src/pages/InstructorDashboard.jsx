import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  instrGetDashboard, instrGetProfile, instrUpdateProfile,
  instrGetCourses, instrCreateCourse, instrUpdateCourse, instrDeleteCourse,
  instrGetModules, instrCreateModule, instrDeleteModule,
  instrCreateLesson, instrDeleteLesson,
  instrGetQuizzes, instrCreateQuiz, instrUpdateQuiz, instrDeleteQuiz,
  instrGetQuestions, instrAddQuestion, instrDeleteQuestion,
  instrGetStudents, instrGetPending, instrGradeSubmission,
  instrGetAnalytics, instrGetNotifications, instrMarkRead
} from '../services/api';

// ─── Reusable UI ─────────────────────────────────────────
function Alert({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      padding:'10px 14px', borderRadius:8, marginBottom:14, fontSize:14,
      background: type==='error' ? '#fee2e2' : '#dcfce7',
      color: type==='error' ? '#dc2626' : '#16a34a'
    }}>{msg}</div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: wide ? 700 : 480 }}>
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
export default function InstructorDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [alert, setAlert] = useState({ msg:'', type:'' });

  // data
  const [dashboard, setDashboard]         = useState(null);
  const [courses, setCourses]             = useState([]);
  const [modules, setModules]             = useState([]);
  const [quizzes, setQuizzes]             = useState([]);
  const [questions, setQuestions]         = useState([]);
  const [students, setStudents]           = useState([]);
  const [pending, setPending]             = useState([]);
  const [analytics, setAnalytics]         = useState(null);
  const [notifications, setNotifications] = useState([]);

  // selected context
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedQuiz, setSelectedQuiz]     = useState(null);

  // modals
  const [showCourseModal, setShowCourseModal]   = useState(false);
  const [showModuleModal, setShowModuleModal]   = useState(false);
  const [showLessonModal, setShowLessonModal]   = useState(false);
  const [showQuizModal, setShowQuizModal]       = useState(false);
  const [showQModal, setShowQModal]             = useState(false);
  const [showGradeModal, setShowGradeModal]     = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingCourse, setEditingCourse]       = useState(null);
  const [editingQuiz, setEditingQuiz]           = useState(null);
  const [gradingItem, setGradingItem]           = useState(null);
  const [selectedModule, setSelectedModule]     = useState(null);

  // forms
  const blankCourse  = { title:'', description:'', status:'draft' };
  const blankModule  = { title:'', description:'' };
  const blankLesson  = { title:'', content_type:'text', content_url:'', content_text:'', duration_minutes:'' };
  const blankQuiz    = { title:'', description:'', due_date:'', time_limit_minutes:'', max_attempts:1, randomize_questions:false, submission_type:'online_quiz', status:'draft' };
  const blankQ       = { question_type:'mcq', question_text:'', options:['','','',''], correct_answer:'', points:1, improvement_tip:'' };
  const blankGrade   = { score:'', feedback:'' };
  const blankProfile = { username:'', phone_number:'', department:'', specialization:'', subjects_taught:'', office_hours:'' };

  const [courseForm, setCourseForm]   = useState(blankCourse);
  const [moduleForm, setModuleForm]   = useState(blankModule);
  const [lessonForm, setLessonForm]   = useState(blankLesson);
  const [quizForm, setQuizForm]       = useState(blankQuiz);
  const [qForm, setQForm]             = useState(blankQ);
  const [gradeForm, setGradeForm]     = useState(blankGrade);
  const [profileForm, setProfileForm] = useState(blankProfile);

  const showAlert = (msg, type='success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert({ msg:'', type:'' }), 3000);
  };

  // ── Fetch on tab change ──
  useEffect(() => {
    if (tab==='dashboard')     instrGetDashboard().then(r=>setDashboard(r.data)).catch(()=>{});
    if (tab==='courses')       instrGetCourses().then(r=>setCourses(r.data)).catch(()=>{});
    if (tab==='grading')       instrGetPending().then(r=>setPending(r.data)).catch(()=>{});
    if (tab==='notifications') instrGetNotifications().then(r=>setNotifications(r.data)).catch(()=>{});
  }, [tab]);

  // ── Open course builder ──
  const openCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedQuiz(null);
    setTab('builder');
    const [m, q] = await Promise.all([
      instrGetModules(course.course_id),
      instrGetQuizzes(course.course_id)
    ]);
    setModules(m.data);
    setQuizzes(q.data);
    if (course.course_id) {
      instrGetStudents(course.course_id).then(r=>setStudents(r.data)).catch(()=>{});
      instrGetAnalytics(course.course_id).then(r=>setAnalytics(r.data)).catch(()=>{});
    }
  };

  // ── Open quiz questions ──
  const openQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    const res = await instrGetQuestions(quiz.quiz_id);
    setQuestions(res.data);
  };

  // ── COURSE CRUD ──
  const saveCourse = async () => {
    try {
      if (editingCourse) {
        await instrUpdateCourse(editingCourse.course_id, courseForm);
        showAlert('Course updated!');
      } else {
        await instrCreateCourse(courseForm);
        showAlert('Course created!');
      }
      setShowCourseModal(false);
      instrGetCourses().then(r=>setCourses(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const archiveCourse = async (id) => {
    if (!window.confirm('Archive this course?')) return;
    try {
      await instrDeleteCourse(id);
      showAlert('Course archived');
      instrGetCourses().then(r=>setCourses(r.data));
    } catch { showAlert('Failed','error'); }
  };

  // ── MODULE CRUD ──
  const saveModule = async () => {
    try {
      await instrCreateModule(selectedCourse.course_id, moduleForm);
      showAlert('Module added!');
      setShowModuleModal(false);
      instrGetModules(selectedCourse.course_id).then(r=>setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await instrDeleteModule(moduleId);
      showAlert('Module deleted');
      instrGetModules(selectedCourse.course_id).then(r=>setModules(r.data));
    } catch { showAlert('Failed','error'); }
  };

  // ── LESSON CRUD ──
  const saveLesson = async () => {
    try {
      await instrCreateLesson(selectedModule.module_id, lessonForm);
      showAlert('Lesson added!');
      setShowLessonModal(false);
      instrGetModules(selectedCourse.course_id).then(r=>setModules(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await instrDeleteLesson(lessonId);
      showAlert('Lesson deleted');
      instrGetModules(selectedCourse.course_id).then(r=>setModules(r.data));
    } catch { showAlert('Failed','error'); }
  };

  // ── QUIZ CRUD ──
  const saveQuiz = async () => {
    try {
      if (editingQuiz) {
        await instrUpdateQuiz(editingQuiz.quiz_id, quizForm);
        showAlert('Quiz updated!');
      } else {
        await instrCreateQuiz(selectedCourse.course_id, quizForm);
        showAlert('Quiz created!');
      }
      setShowQuizModal(false);
      instrGetQuizzes(selectedCourse.course_id).then(r=>setQuizzes(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await instrDeleteQuiz(quizId);
      showAlert('Quiz deleted');
      instrGetQuizzes(selectedCourse.course_id).then(r=>setQuizzes(r.data));
      setSelectedQuiz(null);
    } catch { showAlert('Failed','error'); }
  };

  // ── QUESTION CRUD ──
  const saveQuestion = async () => {
    try {
      const payload = { ...qForm };
      if (qForm.question_type === 'mcq') {
        payload.options = qForm.options.filter(o=>o.trim()!=='');
      } else {
        payload.options = null;
      }
      await instrAddQuestion(selectedQuiz.quiz_id, payload);
      showAlert('Question added!');
      setShowQModal(false);
      instrGetQuestions(selectedQuiz.quiz_id).then(r=>setQuestions(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const deleteQuestion = async (questionId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await instrDeleteQuestion(questionId);
      showAlert('Question deleted');
      instrGetQuestions(selectedQuiz.quiz_id).then(r=>setQuestions(r.data));
    } catch { showAlert('Failed','error'); }
  };

  // ── GRADING ──
  const openGrade = (item) => {
    setGradingItem(item);
    setGradeForm({ score:'', feedback:'' });
    setShowGradeModal(true);
  };
  const saveGrade = async () => {
    try {
      await instrGradeSubmission(gradingItem.quiz_attempt_id, gradeForm);
      showAlert('Submission graded!');
      setShowGradeModal(false);
      instrGetPending().then(r=>setPending(r.data));
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  // ── PROFILE ──
  const openProfile = async () => {
    const res = await instrGetProfile();
    setProfileForm({
      username:       res.data.username||'',
      phone_number:   res.data.phone_number||'',
      department:     res.data.department||'',
      specialization: res.data.specialization||'',
      subjects_taught:res.data.subjects_taught||'',
      office_hours:   res.data.office_hours||''
    });
    setShowProfileModal(true);
  };
  const saveProfile = async () => {
    try {
      await instrUpdateProfile(profileForm);
      showAlert('Profile updated!');
      setShowProfileModal(false);
    } catch (e) { showAlert(e.response?.data?.message||'Failed','error'); }
  };

  const unreadCount = notifications.filter(n=>!n.is_read).length;
  const markRead = async (id) => {
    await instrMarkRead(id);
    instrGetNotifications().then(r=>setNotifications(r.data));
  };

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Arial, sans-serif' }}>

      {/* Sidebar */}
      <div style={sidebar}>
        <div style={{ fontSize:16, fontWeight:'bold', color:'#fff', marginBottom:32 }}>
          🎓 SILS Instructor
        </div>
        {[
          { key:'dashboard',     label:'🏠 Dashboard'       },
          { key:'courses',       label:'📚 My Courses'       },
          { key:'builder',       label:'🔧 Course Builder'   },
          { key:'grading',       label:`✏️ Grading ${pending.length>0?`(${pending.length})`:''}` },
          { key:'notifications', label:`🔔 Alerts ${unreadCount>0?`(${unreadCount})`:''}`       },
        ].map(item => (
          <div key={item.key} onClick={()=>setTab(item.key)}
            style={{ ...navItem, background: tab===item.key ? '#2563eb' : 'transparent' }}>
            {item.label}
          </div>
        ))}
        <div onClick={openProfile} style={{ ...navItem, marginTop:8 }}>👤 My Profile</div>
        <div onClick={logout} style={{ ...navItem, marginTop:'auto', color:'#fca5a5' }}>🚪 Logout</div>
      </div>

      {/* Main */}
      <div style={{ flex:1, padding:32, background:'#f8fafc', overflowY:'auto' }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ margin:0 }}>{tabTitle(tab, selectedCourse)}</h2>
          <p style={{ color:'#64748b', margin:'4px 0 0' }}>Welcome, {user.username}!</p>
        </div>

        <Alert msg={alert.msg} type={alert.type} />

        {/* ── DASHBOARD ── */}
        {tab==='dashboard' && dashboard && (
          <div>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:28 }}>
              <StatCard label="My Courses"      value={dashboard.totalCourses}   color="#2563eb" />
              <StatCard label="Total Students"  value={dashboard.totalStudents}  color="#7c3aed" />
              <StatCard label="Total Quizzes"   value={dashboard.totalQuizzes}   color="#059669" />
              <StatCard label="Pending Grading" value={dashboard.pendingGrading} color="#d97706" />
            </div>
            <div style={card}>
              <h3 style={{ marginTop:0 }}>📋 Recent Submissions</h3>
              {dashboard.recentSubmissions.length===0
                ? <p style={{ color:'#94a3b8' }}>No submissions yet.</p>
                : <table style={table}>
                  <thead><tr>{['Student','Quiz','Score','Status','Date'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>
                    {dashboard.recentSubmissions.map(s=>(
                      <tr key={s.quiz_attempt_id}>
                        <td style={td}>{s.student_name}</td>
                        <td style={td}>{s.quiz_title}</td>
                        <td style={td}>{s.score!=null ? `${parseFloat(s.score).toFixed(1)}%` : '—'}</td>
                        <td style={td}><span style={statusBadge(s.status)}>{s.status}</span></td>
                        <td style={td}>{new Date(s.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              }
            </div>
          </div>
        )}

        {/* ── COURSES ── */}
        {tab==='courses' && (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ margin:0 }}>My Courses</h3>
              <button style={btnPrimary} onClick={()=>{ setEditingCourse(null); setCourseForm(blankCourse); setShowCourseModal(true); }}>
                + New Course
              </button>
            </div>
            {courses.length===0
              ? <p style={{ color:'#94a3b8' }}>No courses yet. Create your first course!</p>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
                {courses.map(c=>(
                  <div key={c.course_id} style={courseCard}>
                    <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{c.title}</div>
                    <div style={{ fontSize:13, color:'#64748b', marginBottom:8 }}>
                      👥 {c.enrolled_count} students
                    </div>
                    <span style={statusBadge(c.status)}>{c.status}</span>
                    <div style={{ display:'flex', gap:8, marginTop:12 }}>
                      <button style={btnPrimary} onClick={()=>openCourse(c)}>Open</button>
                      <button style={btnSmall} onClick={()=>{ setEditingCourse(c); setCourseForm({ title:c.title, description:c.description||'', status:c.status }); setShowCourseModal(true); }}>Edit</button>
                      {c.status!=='archived' &&
                        <button style={{ ...btnSmall, background:'#f59e0b' }} onClick={()=>archiveCourse(c.course_id)}>Archive</button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            }
          </div>
        )}

        {/* ── COURSE BUILDER ── */}
        {tab==='builder' && (
          !selectedCourse
          ? <div style={card}><p style={{ color:'#94a3b8' }}>Select a course from My Courses to open the builder.</p></div>
          : <div>
              {/* Top tabs inside builder */}
              <div style={{ display:'flex', gap:8, marginBottom:20 }}>
                {['modules','quizzes','students','analytics'].map(t=>(
                  <button key={t} onClick={()=>setSelectedQuiz(t==='quizzes'?selectedQuiz:null)}
                    style={{ ...tabBtn, background: '#2563eb', color:'#fff', textTransform:'capitalize' }}>
                    {t==='modules'?'📖 Modules':t==='quizzes'?'📝 Quizzes':t==='students'?'👥 Students':'📊 Analytics'}
                  </button>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>

                {/* Modules panel */}
                <div style={card}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <h4 style={{ margin:0 }}>📖 Modules & Lessons</h4>
                    <button style={btnPrimary} onClick={()=>{ setModuleForm(blankModule); setShowModuleModal(true); }}>
                      + Module
                    </button>
                  </div>
                  {modules.length===0
                    ? <p style={{ color:'#94a3b8', fontSize:13 }}>No modules yet.</p>
                    : modules.map(mod=>(
                      <div key={mod.module_id} style={{ marginBottom:16, border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' }}>
                        <div style={{ background:'#f1f5f9', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontWeight:700, fontSize:14 }}>{mod.title}</span>
                          <div style={{ display:'flex', gap:6 }}>
                            <button style={btnSmall} onClick={()=>{ setSelectedModule(mod); setLessonForm(blankLesson); setShowLessonModal(true); }}>
                              + Lesson
                            </button>
                            <button style={{ ...btnSmall, background:'#ef4444' }} onClick={()=>deleteModule(mod.module_id)}>
                              Delete
                            </button>
                          </div>
                        </div>
                        {mod.lessons?.map(l=>(
                          <div key={l.lesson_id} style={{ padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid #f1f5f9' }}>
                            <div>
                              <span style={{ fontSize:14 }}>
                                {l.content_type==='video'?'🎬':l.content_type==='pdf'?'📄':'📝'} {l.title}
                              </span>
                              {l.duration_minutes && <span style={{ fontSize:12, color:'#94a3b8', marginLeft:6 }}>{l.duration_minutes}min</span>}
                            </div>
                            <button style={{ ...btnSmall, background:'#ef4444' }} onClick={()=>deleteLesson(l.lesson_id)}>✕</button>
                          </div>
                        ))}
                      </div>
                    ))
                  }
                </div>

                {/* Quizzes panel */}
                <div style={card}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                    <h4 style={{ margin:0 }}>📝 Quizzes</h4>
                    <button style={btnPrimary} onClick={()=>{ setEditingQuiz(null); setQuizForm(blankQuiz); setShowQuizModal(true); }}>
                      + Quiz
                    </button>
                  </div>
                  {quizzes.length===0
                    ? <p style={{ color:'#94a3b8', fontSize:13 }}>No quizzes yet.</p>
                    : quizzes.map(q=>(
                      <div key={q.quiz_id} style={{ padding:'10px 0', borderBottom:'1px solid #f1f5f9' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:14 }}>{q.title}</div>
                            <div style={{ fontSize:12, color:'#64748b' }}>
                              {q.question_count} questions · {q.attempt_count} attempts
                            </div>
                            <span style={statusBadge(q.status)}>{q.status}</span>
                          </div>
                          <div style={{ display:'flex', gap:4, flexDirection:'column', alignItems:'flex-end' }}>
                            <button style={btnSmall} onClick={()=>openQuiz(q)}>Questions</button>
                            <button style={btnSmall} onClick={()=>{ setEditingQuiz(q); setQuizForm({ title:q.title, description:q.description||'', due_date:q.due_date?q.due_date.slice(0,16):'', time_limit_minutes:q.time_limit_minutes||'', max_attempts:q.max_attempts, randomize_questions:q.randomize_questions, submission_type:q.submission_type, status:q.status }); setShowQuizModal(true); }}>Edit</button>
                            <button style={{ ...btnSmall, background:'#ef4444' }} onClick={()=>deleteQuiz(q.quiz_id)}>Delete</button>
                          </div>
                        </div>

                        {/* Questions panel inline */}
                        {selectedQuiz?.quiz_id===q.quiz_id && (
                          <div style={{ marginTop:10, padding:10, background:'#f8fafc', borderRadius:8 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                              <span style={{ fontSize:13, fontWeight:600 }}>Questions ({questions.length})</span>
                              <button style={{ ...btnSmall, fontSize:11 }} onClick={()=>{ setQForm(blankQ); setShowQModal(true); }}>+ Add</button>
                            </div>
                            {questions.map((qs,i)=>(
                              <div key={qs.question_id} style={{ fontSize:13, padding:'6px 0', borderBottom:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between' }}>
                                <div>
                                  <span style={{ color:'#64748b' }}>Q{i+1}.</span> {qs.question_text}
                                  <span style={{ fontSize:11, color:'#2563eb', marginLeft:6 }}>[{qs.question_type}]</span>
                                </div>
                                <button style={{ ...btnSmall, background:'#ef4444', padding:'2px 6px' }} onClick={()=>deleteQuestion(qs.question_id)}>✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  }
                </div>

                {/* Students panel */}
                <div style={{ ...card, gridColumn:'1/-1' }}>
                  <h4 style={{ marginTop:0 }}>👥 Enrolled Students</h4>
                  {students.length===0
                    ? <p style={{ color:'#94a3b8', fontSize:13 }}>No enrolled students yet.</p>
                    : <table style={table}>
                      <thead><tr>{['Student','Email','Progress','Avg Score','Quizzes','Risk'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {students.map(s=>(
                          <tr key={s.user_id} style={{ background: s.is_at_risk ? '#fff7f7':'' }}>
                            <td style={td}>{s.username}</td>
                            <td style={td}>{s.email}</td>
                            <td style={td}>
                              <div style={{ background:'#e2e8f0', borderRadius:99, height:6, width:100 }}>
                                <div style={{ background:'#2563eb', height:6, borderRadius:99, width:`${s.completion_percent}%` }} />
                              </div>
                              <span style={{ fontSize:12, color:'#64748b' }}>{s.completion_percent}%</span>
                            </td>
                            <td style={td}>
                              <span style={{ fontWeight:700, color: s.avg_score>=70?'#16a34a':s.avg_score>=50?'#d97706':'#dc2626' }}>
                                {parseFloat(s.avg_score).toFixed(1)}%
                              </span>
                            </td>
                            <td style={td}>{s.quizzes_taken}</td>
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

                {/* Analytics panel */}
                {analytics && (
                  <div style={{ ...card, gridColumn:'1/-1' }}>
                    <h4 style={{ marginTop:0 }}>📊 Course Analytics</h4>
                    <div style={{ display:'flex', gap:16, marginBottom:20 }}>
                      <StatCard label="Completed" value={analytics.completed} color="#059669" />
                      <StatCard label="Total Enrolled" value={analytics.total} color="#2563eb" />
                      <StatCard label="Completion Rate"
                        value={analytics.total>0?`${Math.round(analytics.completed/analytics.total*100)}%`:'0%'}
                        color="#7c3aed" />
                    </div>
                    <table style={table}>
                      <thead><tr>{['Quiz','Avg Score','Attempts'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                      <tbody>
                        {analytics.quizStats.map((q,i)=>(
                          <tr key={i}>
                            <td style={td}>{q.title}</td>
                            <td style={td}>
                              <span style={{ fontWeight:700, color: q.avg_score>=70?'#16a34a':q.avg_score>=50?'#d97706':'#dc2626' }}>
                                {parseFloat(q.avg_score).toFixed(1)}%
                              </span>
                            </td>
                            <td style={td}>{q.attempts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
        )}

        {/* ── GRADING ── */}
        {tab==='grading' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>✏️ Pending Submissions</h3>
            {pending.length===0
              ? <p style={{ color:'#94a3b8' }}>No pending submissions.</p>
              : <table style={table}>
                <thead><tr>{['Student','Quiz','Course','Submitted','Action'].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>
                  {pending.map(p=>(
                    <tr key={p.quiz_attempt_id}>
                      <td style={td}>{p.student_name}</td>
                      <td style={td}>{p.quiz_title}</td>
                      <td style={td}>{p.course_title}</td>
                      <td style={td}>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td style={td}>
                        <button style={btnPrimary} onClick={()=>openGrade(p)}>Grade</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab==='notifications' && (
          <div style={card}>
            <h3 style={{ marginTop:0 }}>🔔 Notifications</h3>
            {notifications.length===0
              ? <p style={{ color:'#94a3b8' }}>No notifications.</p>
              : notifications.map(n=>(
                <div key={n.notification_id} style={{
                  padding:'12px 16px', borderRadius:8, marginBottom:8,
                  background: n.is_read?'#f8fafc':'#eff6ff',
                  border:`1px solid ${n.is_read?'#e2e8f0':'#bfdbfe'}`
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <div style={{ fontWeight: n.is_read?400:700, fontSize:14 }}>{n.title}</div>
                    <div style={{ fontSize:12, color:'#94a3b8' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ fontSize:13, color:'#475569', marginTop:4 }}>{n.message}</div>
                  {!n.is_read && <button style={{ ...btnSmall, marginTop:8 }} onClick={()=>markRead(n.notification_id)}>Mark Read</button>}
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* ── COURSE MODAL ── */}
      {showCourseModal && (
        <Modal title={editingCourse?'Edit Course':'New Course'} onClose={()=>setShowCourseModal(false)}>
          {[{label:'Title',key:'title'},{label:'Description',key:'description'}].map(f=>(
            <div key={f.key} style={{ marginBottom:12 }}>
              <label style={formLabel}>{f.label}</label>
              {f.key==='description'
                ? <textarea style={{ ...formInput, height:80 }} value={courseForm[f.key]} onChange={e=>setCourseForm({...courseForm,[f.key]:e.target.value})} />
                : <input style={formInput} value={courseForm[f.key]} onChange={e=>setCourseForm({...courseForm,[f.key]:e.target.value})} />
              }
            </div>
          ))}
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Status</label>
            <select style={formInput} value={courseForm.status} onChange={e=>setCourseForm({...courseForm,status:e.target.value})}>
              {['draft','published','archived'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveCourse}>
            {editingCourse?'Update':'Create'} Course
          </button>
        </Modal>
      )}

      {/* ── MODULE MODAL ── */}
      {showModuleModal && (
        <Modal title="Add Module" onClose={()=>setShowModuleModal(false)}>
          {[{label:'Title',key:'title'},{label:'Description',key:'description'}].map(f=>(
            <div key={f.key} style={{ marginBottom:12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={moduleForm[f.key]} onChange={e=>setModuleForm({...moduleForm,[f.key]:e.target.value})} />
            </div>
          ))}
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveModule}>Add Module</button>
        </Modal>
      )}

      {/* ── LESSON MODAL ── */}
      {showLessonModal && (
        <Modal title="Add Lesson" onClose={()=>setShowLessonModal(false)}>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Title</label>
            <input style={formInput} value={lessonForm.title} onChange={e=>setLessonForm({...lessonForm,title:e.target.value})} />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Content Type</label>
            <select style={formInput} value={lessonForm.content_type} onChange={e=>setLessonForm({...lessonForm,content_type:e.target.value})}>
              {['text','video','pdf','other'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {(lessonForm.content_type==='video'||lessonForm.content_type==='pdf') && (
            <div style={{ marginBottom:12 }}>
              <label style={formLabel}>Content URL</label>
              <input style={formInput} value={lessonForm.content_url} onChange={e=>setLessonForm({...lessonForm,content_url:e.target.value})} placeholder="https://..." />
            </div>
          )}
          {lessonForm.content_type==='text' && (
            <div style={{ marginBottom:12 }}>
              <label style={formLabel}>Content Text</label>
              <textarea style={{ ...formInput, height:100 }} value={lessonForm.content_text} onChange={e=>setLessonForm({...lessonForm,content_text:e.target.value})} />
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Duration (minutes)</label>
            <input style={formInput} type="number" value={lessonForm.duration_minutes} onChange={e=>setLessonForm({...lessonForm,duration_minutes:e.target.value})} />
          </div>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveLesson}>Add Lesson</button>
        </Modal>
      )}

      {/* ── QUIZ MODAL ── */}
      {showQuizModal && (
        <Modal title={editingQuiz?'Edit Quiz':'New Quiz'} onClose={()=>setShowQuizModal(false)}>
          {[{label:'Title',key:'title'},{label:'Description',key:'description'}].map(f=>(
            <div key={f.key} style={{ marginBottom:12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={quizForm[f.key]} onChange={e=>setQuizForm({...quizForm,[f.key]:e.target.value})} />
            </div>
          ))}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={formLabel}>Due Date</label>
              <input style={formInput} type="datetime-local" value={quizForm.due_date} onChange={e=>setQuizForm({...quizForm,due_date:e.target.value})} />
            </div>
            <div>
              <label style={formLabel}>Time Limit (mins)</label>
              <input style={formInput} type="number" value={quizForm.time_limit_minutes} onChange={e=>setQuizForm({...quizForm,time_limit_minutes:e.target.value})} />
            </div>
            <div>
              <label style={formLabel}>Max Attempts</label>
              <input style={formInput} type="number" min="1" value={quizForm.max_attempts} onChange={e=>setQuizForm({...quizForm,max_attempts:e.target.value})} />
            </div>
            <div>
              <label style={formLabel}>Submission Type</label>
              <select style={formInput} value={quizForm.submission_type} onChange={e=>setQuizForm({...quizForm,submission_type:e.target.value})}>
                {['online_quiz','file_upload','mixed'].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Status</label>
            <select style={formInput} value={quizForm.status} onChange={e=>setQuizForm({...quizForm,status:e.target.value})}>
              {['draft','published','archived'].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:14 }}>
            <input type="checkbox" checked={quizForm.randomize_questions}
              onChange={e=>setQuizForm({...quizForm,randomize_questions:e.target.checked})} />
            Randomize Questions
          </label>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveQuiz}>
            {editingQuiz?'Update':'Create'} Quiz
          </button>
        </Modal>
      )}

      {/* ── QUESTION MODAL ── */}
      {showQModal && (
        <Modal title="Add Question" onClose={()=>setShowQModal(false)} wide>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Question Type</label>
            <select style={formInput} value={qForm.question_type} onChange={e=>setQForm({...qForm,question_type:e.target.value})}>
              {['mcq','fill_blank','short_answer'].map(t=><option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Question Text</label>
            <textarea style={{ ...formInput, height:80 }} value={qForm.question_text} onChange={e=>setQForm({...qForm,question_text:e.target.value})} />
          </div>
          {qForm.question_type==='mcq' && (
            <div style={{ marginBottom:12 }}>
              <label style={formLabel}>Options (one per line)</label>
              {qForm.options.map((opt,i)=>(
                <input key={i} style={{ ...formInput, marginBottom:6 }} value={opt}
                  placeholder={`Option ${i+1}`}
                  onChange={e=>{ const opts=[...qForm.options]; opts[i]=e.target.value; setQForm({...qForm,options:opts}); }} />
              ))}
            </div>
          )}
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Correct Answer</label>
            <input style={formInput} value={qForm.correct_answer} onChange={e=>setQForm({...qForm,correct_answer:e.target.value})} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div>
              <label style={formLabel}>Points</label>
              <input style={formInput} type="number" min="1" value={qForm.points} onChange={e=>setQForm({...qForm,points:e.target.value})} />
            </div>
            <div>
              <label style={formLabel}>Improvement Tip</label>
              <input style={formInput} value={qForm.improvement_tip} onChange={e=>setQForm({...qForm,improvement_tip:e.target.value})} placeholder="Hint for wrong answers" />
            </div>
          </div>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveQuestion}>Add Question</button>
        </Modal>
      )}

      {/* ── GRADE MODAL ── */}
      {showGradeModal && gradingItem && (
        <Modal title="Grade Submission" onClose={()=>setShowGradeModal(false)}>
          <div style={{ background:'#f8fafc', padding:12, borderRadius:8, marginBottom:16, fontSize:14 }}>
            <div><strong>Student:</strong> {gradingItem.student_name}</div>
            <div><strong>Quiz:</strong> {gradingItem.quiz_title}</div>
            <div><strong>Course:</strong> {gradingItem.course_title}</div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={formLabel}>Score (0–100)</label>
            <input style={formInput} type="number" min="0" max="100"
              value={gradeForm.score} onChange={e=>setGradeForm({...gradeForm,score:e.target.value})} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={formLabel}>Feedback / Comments</label>
            <textarea style={{ ...formInput, height:80 }} value={gradeForm.feedback}
              onChange={e=>setGradeForm({...gradeForm,feedback:e.target.value})}
              placeholder="Optional written feedback for the student..." />
          </div>
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveGrade}>Submit Grade</button>
        </Modal>
      )}

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <Modal title="My Profile" onClose={()=>setShowProfileModal(false)}>
          {[
            {label:'Username',        key:'username'},
            {label:'Phone Number',    key:'phone_number'},
            {label:'Department',      key:'department'},
            {label:'Specialization',  key:'specialization'},
            {label:'Subjects Taught', key:'subjects_taught'},
            {label:'Office Hours',    key:'office_hours'},
          ].map(f=>(
            <div key={f.key} style={{ marginBottom:12 }}>
              <label style={formLabel}>{f.label}</label>
              <input style={formInput} value={profileForm[f.key]||''}
                onChange={e=>setProfileForm({...profileForm,[f.key]:e.target.value})} />
            </div>
          ))}
          <button style={{ ...btnPrimary, width:'100%' }} onClick={saveProfile}>Save Profile</button>
        </Modal>
      )}
    </div>
  );
}

// ─── Helpers & Styles ─────────────────────────────────────
const tabTitle = (t, course) => ({
  dashboard:     '🏠 Dashboard Overview',
  courses:       '📚 My Courses',
  builder:       course ? `🔧 ${course.title}` : '🔧 Course Builder',
  grading:       '✏️ Grade Submissions',
  notifications: '🔔 Notifications',
}[t]||'');

const sidebar    = { width:220, background:'#1e293b', padding:'28px 16px', display:'flex', flexDirection:'column', gap:4 };
const navItem    = { padding:'10px 14px', borderRadius:8, color:'#cbd5e1', cursor:'pointer', fontSize:14 };
const card       = { background:'#fff', borderRadius:12, padding:24, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' };
const courseCard = { background:'#fff', borderRadius:12, padding:20, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' };
const table      = { width:'100%', borderCollapse:'collapse', fontSize:14 };
const th         = { textAlign:'left', padding:'10px 12px', background:'#f1f5f9', color:'#475569', fontWeight:600 };
const td         = { padding:'10px 12px', borderBottom:'1px solid #f1f5f9', color:'#334155' };
const btnPrimary = { background:'#2563eb', color:'#fff', border:'none', borderRadius:8, padding:'10px 18px', cursor:'pointer', fontSize:14, fontWeight:600 };
const btnSmall   = { background:'#2563eb', color:'#fff', border:'none', borderRadius:6, padding:'5px 10px', cursor:'pointer', fontSize:12, marginRight:4 };
const tabBtn     = { border:'none', borderRadius:8, padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:600 };
const overlay    = { position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const modalBox   = { background:'#fff', borderRadius:12, padding:28, width:'100%', maxHeight:'90vh', overflowY:'auto' };
const closeBtn   = { background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#64748b' };
const formLabel  = { display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:4 };
const formInput  = { width:'100%', padding:'9px 11px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:14, boxSizing:'border-box' };
const statusBadge = (s) => ({ display:'inline-block', padding:'2px 10px', borderRadius:99, fontSize:12, fontWeight:600,
  background:{draft:'#fef9c3',published:'#dcfce7',archived:'#f1f5f9',graded:'#dcfce7',submitted:'#fef9c3',in_progress:'#eff6ff'}[s]||'#f1f5f9',
  color:{draft:'#854d0e',published:'#15803d',archived:'#64748b',graded:'#15803d',submitted:'#854d0e',in_progress:'#1d4ed8'}[s]||'#334155' });