import { token, fontMono } from '../../../theme';
import { cardBase, hSub, btnRow, btnIcon, inputDate, StatusBadge } from '../components/styles';

export function BuilderModulesPanel({ modules, onAddModule, onEditModule, onAddLesson, onEditLesson, onDeleteModule, onDeleteLesson }) {
  return (
    <div className="ins-card" style={cardBase}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ ...hSub, margin: 0 }}>Modules & Lessons</h4>
        <button className="ins-btn" onClick={onAddModule} style={{ ...btnRow, padding: '6px 14px', fontSize: 12 }}>
          + Module
        </button>
      </div>
      {modules.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No modules yet.</p>
        : modules.map(mod => (
          <div key={mod.module_id} style={{ marginBottom: 14, border: `1px solid ${token.line}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ background: token.surface2, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: token.ink }}>{mod.title}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ins-btn" onClick={() => onEditModule(mod)}
                  style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  Edit
                </button>
                <button className="ins-btn" onClick={() => onAddLesson(mod)}
                  style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                  + Lesson
                </button>
                <button className="ins-btn" onClick={() => onDeleteModule(mod.module_id)}
                  style={{ background: token.dangerSoft, color: token.danger, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>
                  Del
                </button>
              </div>
            </div>
            {(mod.lessons || []).map(l => (
              <div key={l.lesson_id} style={{ padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${token.line}`, color: token.ink, fontSize: 13 }}>
                <div>
                  <span style={{ marginRight: 6, opacity: 0.5 }}>◆</span>
                  {l.title}
                  {l.duration_minutes && <span style={{ fontSize: 11, color: token.inkFaint, marginLeft: 6, fontFamily: fontMono }}>{l.duration_minutes}min</span>}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="ins-btn" onClick={() => onEditLesson(l)}
                    style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 4, padding: '2px 7px', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                    Edit
                  </button>
                  <button className="ins-btn" onClick={() => onDeleteLesson(l.lesson_id)} style={btnIcon}>✕</button>
                </div>
              </div>
            ))}
          </div>
        ))
      }
    </div>
  );
}

export function BuilderQuizQuestionsPanel({
  questions, feedbackBands, feedbackWarning,
  submissionType, acceptedFileTypes,
  onAddQuestion, onEditQuestion, onDeleteQuestion,
  onAddBand, onEditBand, onDeleteBand,
}) {
  const isFileUpload = submissionType === 'file_upload';
  return (
    <div style={{ marginTop: 10, padding: 12, background: token.paper, borderRadius: 8, border: `1px solid ${token.line}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: token.ink }}>
          {isFileUpload ? 'Assignment Instructions' : `Questions (${questions.length})`}
        </span>
        {!isFileUpload && (
          <button className="ins-btn" onClick={onAddQuestion}
            style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 5, padding: '3px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            + Add
          </button>
        )}
      </div>

      {isFileUpload ? (
        <div style={{ fontSize: 13, color: token.inkSoft, lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 8px' }}>Students will submit a file for this assignment.</p>
          {acceptedFileTypes && (
            <p style={{ margin: 0, color: token.inkFaint, fontSize: 12 }}>
              Accepted file types: <strong>{acceptedFileTypes}</strong>
            </p>
          )}
        </div>
      ) : questions.length === 0 ? (
        <p style={{ fontSize: 12, color: token.inkFaint, margin: 0 }}>No questions yet.</p>
      ) : (
        questions.map((qs, i) => (
        <div key={qs.question_id} style={{ fontSize: 12, padding: '8px 0', borderBottom: `1px solid ${token.line}`, color: token.inkSoft }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <span style={{ color: token.inkFaint }}>Q{i + 1}.</span> {qs.question_text}
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className="ins-btn" onClick={() => onEditQuestion(qs)}
                style={{ background: 'none', border: `1px solid ${token.line}`, borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontSize: 11, color: token.inkSoft }}>
                Edit
              </button>
              <button className="ins-btn" onClick={() => onDeleteQuestion(qs.question_id)} style={btnIcon}>✕</button>
            </div>
          </div>
          {qs.improvement_tip && (
            <div style={{ marginTop: 3, fontSize: 11, color: token.brass, paddingLeft: 18 }}>
              💡 {qs.improvement_tip}
            </div>
          )}
        </div>
      )))}

      {!isFileUpload && (
      <div style={{ marginTop: 14, borderTop: `1px solid ${token.line}`, paddingTop: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: token.ink }}>Score-Band Feedback ({feedbackBands.length})</span>
          <button className="ins-btn" onClick={onAddBand}
            style={{ background: token.infoSoft, color: token.info, border: 'none', borderRadius: 5, padding: '3px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
            + Band
          </button>
        </div>
        {feedbackWarning && (
          <div style={{ fontSize: 11, color: token.warn, background: token.warnSoft, border: `1px solid ${token.warn}30`, borderRadius: 5, padding: '6px 10px', marginBottom: 8 }}>
            ⚠ Quiz already attempted — changes apply to future attempts only.
          </div>
        )}
        {feedbackBands.length === 0
          ? <p style={{ fontSize: 11, color: token.inkFaint, margin: 0 }}>No bands yet.</p>
          : feedbackBands.map(band => (
            <div key={band.quiz_feedback_id} style={{ fontSize: 11, padding: '4px 0', borderBottom: `1px solid ${token.line}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: token.brass, fontWeight: 600, fontFamily: fontMono }}>{band.min_score}% – {band.max_score}%</span>
                <span style={{ color: token.inkSoft, marginLeft: 8 }}>{band.feedback_message}</span>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button className="ins-btn" onClick={() => onEditBand(band)}
                  style={{ background: 'none', border: `1px solid ${token.line}`, borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontSize: 11, color: token.inkSoft }}>Edit</button>
                <button className="ins-btn" onClick={() => onDeleteBand(band.quiz_feedback_id)} style={btnIcon}>✕</button>
              </div>
            </div>
          ))
        }
      </div>
      )}
    </div>
  );
}

export function BuilderQuizzesPanel({
  quizzes, selectedQuizId,
  questions, feedbackBands, feedbackWarning,
  onAddQuiz, onEditQuiz, onDeleteQuiz, onToggleQuiz,
  onPublishQuiz,
  onAddQuestion, onEditQuestion, onDeleteQuestion,
  onAddBand, onEditBand, onDeleteBand,
}) {
  return (
    <div className="ins-card" style={cardBase}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ ...hSub, margin: 0 }}>Quizzes & Assignments</h4>
        <button className="ins-btn" onClick={onAddQuiz} style={{ ...btnRow, padding: '6px 14px', fontSize: 12 }}>+ Quiz</button>
      </div>
      {quizzes.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No quizzes yet.</p>
        : quizzes.map(q => (
          <div key={q.quiz_id} style={{ padding: '12px 0', borderBottom: `1px solid ${token.line}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: token.ink }}>{q.title}</div>
                <div style={{ fontSize: 11, color: token.inkSoft, marginTop: 2, fontFamily: fontMono }}>
                  {q.question_count} Q · {q.attempt_count} attempt{q.attempt_count !== 1 ? 's' : ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                <div style={{ display: 'inline-block' }}><StatusBadge status={q.status} /></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="ins-btn" onClick={() => onToggleQuiz(q)}
                    style={{ background: selectedQuizId === q.quiz_id ? token.brass : token.surface2, color: selectedQuizId === q.quiz_id ? '#fff' : token.ink, border: `1px solid ${token.line}`, borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
                    {selectedQuizId === q.quiz_id ? '▲' : '▼'}
                  </button>
                  {q.status === 'draft' && (
                    <button className="ins-btn" onClick={() => onPublishQuiz(q)}
                      style={{ background: token.good, color: '#fff', border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                      Publish
                    </button>
                  )}
                  {q.status === 'published' && (
                    <button className="ins-btn" onClick={() => onEditQuiz(q)}
                      style={{ background: token.warnSoft, color: token.warn, border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
                      Unpublish
                    </button>
                  )}
                  <button className="ins-btn" onClick={() => onEditQuiz(q)}
                    style={{ background: token.surface2, color: token.ink, border: `1px solid ${token.line}`, borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
                    Edit
                  </button>
                  <button className="ins-btn" onClick={() => onDeleteQuiz(q.quiz_id)}
                    style={{ background: token.dangerSoft, color: token.danger, border: 'none', borderRadius: 5, padding: '2px 8px', cursor: 'pointer', fontSize: 11 }}>
                    Del
                  </button>
                </div>
              </div>
            </div>

            {selectedQuizId === q.quiz_id && (
              <BuilderQuizQuestionsPanel
                questions={questions}
                feedbackBands={feedbackBands}
                feedbackWarning={feedbackWarning}
                submissionType={q.submission_type}
                acceptedFileTypes={q.accepted_file_types}
                onAddQuestion={onAddQuestion}
                onEditQuestion={onEditQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onAddBand={onAddBand}
                onEditBand={onEditBand}
                onDeleteBand={onDeleteBand}
              />
            )}
          </div>
        ))
      }
    </div>
  );
}

export function BuilderStudentsPanel({ students, onOpenStudent, onExportCsv, onExportPdf }) {
  return (
    <div className="ins-card" style={{ ...cardBase, gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ ...hSub, margin: 0 }}>Enrolled Students</h4>
        <div style={{ display: 'inline-flex', gap: 8 }}>
          <button onClick={onExportCsv} disabled={students.length === 0}
            style={{
              padding: '7px 12px', fontSize: 12, fontWeight: 600,
              cursor: students.length === 0 ? 'not-allowed' : 'pointer',
              border: `1px solid ${token.line}`, borderRadius: 6,
              background: students.length === 0 ? token.surface2 : token.ink,
              color: students.length === 0 ? token.inkFaint : '#fff',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" />
            </svg>
            Export CSV
          </button>
          <button onClick={onExportPdf} disabled={students.length === 0}
            title="Download a PDF copy of the student progress report"
            style={{
              padding: '7px 12px', fontSize: 12, fontWeight: 600,
              cursor: students.length === 0 ? 'not-allowed' : 'pointer',
              border: `1px solid ${token.line}`, borderRadius: 6,
              background: students.length === 0 ? token.surface2 : token.brass,
              color: students.length === 0 ? token.inkFaint : '#fff',
              display: 'inline-flex', alignItems: 'center', gap: 6
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>
      {students.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No enrolled students yet.</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Student', 'Email', 'Progress', 'Avg Score', 'Quizzes', 'Risk'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}`, fontFamily: '"Inter", sans-serif' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.user_id}
                    onClick={() => onOpenStudent(s.user_id)}
                    title="Click to view full progress"
                    style={{ borderTop: `1px solid ${token.line}`, cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = token.surface2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 12px', color: token.ink, fontWeight: 500 }}>{s.username}</td>
                    <td style={{ padding: '10px 12px', color: token.inkSoft }}>{s.email}</td>
                    <td style={{ padding: '10px 12px', minWidth: 120 }}>
                      <div style={{ background: token.surface3, borderRadius: 99, height: 6, marginBottom: 4 }}>
                        <div style={{ background: token.brass, height: 6, borderRadius: 99, width: `${s.completion_percent}%` }} />
                      </div>
                      <span style={{ fontSize: 11, color: token.inkSoft, fontFamily: fontMono }}>{s.completion_percent}%</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: fontMono, fontWeight: 700, color: s.avg_score >= 70 ? token.good : s.avg_score >= 50 ? token.warn : token.danger }}>
                      {parseFloat(s.avg_score || 0).toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: fontMono, color: token.inkSoft }}>{s.quizzes_taken}</td>
                    <td style={{ padding: '10px 12px' }}>
                      {s.is_at_risk
                        ? <span style={{ color: token.danger, fontWeight: 600, fontSize: 12 }}>⚠ At Risk</span>
                        : <span style={{ color: token.good, fontWeight: 600, fontSize: 12 }}>✓ OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}

export function BuilderAnalyticsShell({ analytics, range, onChangeFrom, onChangeTo, onApply, onReset, children }) {
  if (!analytics) return null;
  return (
    <div className="ins-card" style={{ ...cardBase, gridColumn: '1 / -1' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <h4 style={{ ...hSub, margin: 0 }}>Course Analytics</h4>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 11, color: token.inkSoft, fontWeight: 600 }}>From</label>
          <input type="date" value={range.from} onChange={e => onChangeFrom(e.target.value)}
            style={inputDate} />
          <label style={{ fontSize: 11, color: token.inkSoft, fontWeight: 600 }}>To</label>
          <input type="date" value={range.to} onChange={e => onChangeTo(e.target.value)}
            style={inputDate} />
          <button onClick={onApply}
            style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: token.brass, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Apply
          </button>
          <button onClick={onReset}
            style={{ padding: '6px 10px', fontSize: 12, background: 'none', color: token.inkSoft, border: `1px solid ${token.line}`, borderRadius: 6, cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function InstructorCourseBuilderSection({
  selectedCourse, modules, quizzes, selectedQuizId, questions, feedbackBands, feedbackWarning,
  students,
  onAddModule, onEditModule, onAddLesson, onEditLesson, onDeleteModule, onDeleteLesson,
  onAddQuiz, onEditQuiz, onDeleteQuiz, onToggleQuiz,
  onPublishQuiz,
  onAddQuestion, onEditQuestion, onDeleteQuestion,
  onAddBand, onEditBand, onDeleteBand,
  onOpenStudent, onExportStudentsCsv, onExportStudentsPdf,
  children,
}) {
  if (!selectedCourse) {
    return (
      <div className="ins-card" style={cardBase}>
        <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>Select a course from My Courses to open the builder.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <BuilderModulesPanel
        modules={modules}
        onAddModule={onAddModule}
        onEditModule={onEditModule}
        onAddLesson={onAddLesson}
        onEditLesson={onEditLesson}
        onDeleteModule={onDeleteModule}
        onDeleteLesson={onDeleteLesson}
      />
      <BuilderQuizzesPanel
        quizzes={quizzes}
        selectedQuizId={selectedQuizId}
        questions={questions}
        feedbackBands={feedbackBands}
        feedbackWarning={feedbackWarning}
        onAddQuiz={onAddQuiz}
        onEditQuiz={onEditQuiz}
        onDeleteQuiz={onDeleteQuiz}
        onToggleQuiz={onToggleQuiz}
        onPublishQuiz={onPublishQuiz}
        onAddQuestion={onAddQuestion}
        onEditQuestion={onEditQuestion}
        onDeleteQuestion={onDeleteQuestion}
        onAddBand={onAddBand}
        onEditBand={onEditBand}
        onDeleteBand={onDeleteBand}
      />
      <BuilderStudentsPanel
        students={students}
        onOpenStudent={onOpenStudent}
        onExportCsv={onExportStudentsCsv}
        onExportPdf={onExportStudentsPdf}
      />
      {children /* recharts panels rendered by parent */}
    </div>
  );
}