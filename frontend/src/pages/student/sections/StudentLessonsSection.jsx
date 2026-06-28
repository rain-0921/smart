import { token, theme, fontDisplay } from '../../../theme';
import {
  card, cardHeader, cardTitle, emptyState, emptyStateSmall, btnPrimary, btnGhost, btnSmall,
  quizItem, quizIcon, quizInfo, quizName, quizMeta, quizStatus, statusPill,
  lessonRow, quizQuestion, radioLabel, gradeRow, gradeTitle, formInput, statusBadge,
} from '../components/styles';
import { BASE_URL } from '../../../services/api';

export function ModulesPanel({ selectedCourse, modules, search, selectedLesson, activeQuiz, quizResult, onSelectLesson, onCompleteModule }) {
  const filteredModules = modules.filter(m =>
    !search || m.title?.toLowerCase().includes(search.toLowerCase()) ||
    m.lessons?.some(l => l.title?.toLowerCase().includes(search.toLowerCase()))
  );

  if (!selectedCourse) {
    return (
      <div style={{ ...emptyState, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>📚</div>
        <div style={{ fontSize: 15, color: theme.textMuted }}>You haven't selected a course yet.</div>
        <button style={btnPrimary} onClick={() => document.dispatchEvent(new CustomEvent('std-goto-courses'))}>Browse Courses</button>
      </div>
    );
  }

  if (filteredModules.length === 0 && !activeQuiz && !quizResult) {
    return <div style={emptyState}>{search ? 'No modules match your search.' : 'No modules yet.'}</div>;
  }

  return (
    <>
      {!activeQuiz && !quizResult && filteredModules.map(mod => (
        <div key={mod.module_id} style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>{mod.title}</h4>
            <span style={statusBadge(mod.progress_status || 'not_started')}>
              {mod.progress_status || 'not started'}
            </span>
          </div>
          {mod.description && <p style={{ color: theme.textMuted, fontSize: 13 }}>{mod.description}</p>}
          <div style={{ marginTop: 12 }}>
            {mod.lessons?.map(l => (
              <div key={l.lesson_id} style={{
                ...lessonRow,
                background: selectedLesson?.lesson_id === l.lesson_id
                  ? 'rgba(36,84,166,0.06)' : 'transparent',
                borderRadius: selectedLesson?.lesson_id === l.lesson_id ? 8 : 0,
                padding: selectedLesson?.lesson_id === l.lesson_id ? '10px 8px' : '10px 0',
                margin: selectedLesson?.lesson_id === l.lesson_id ? '0 -8px' : 0,
              }}>
                <span style={{ fontSize: 16 }}>
                  {l.content_type === 'video' ? '🎬' : l.content_type === 'pdf' ? '📄' : l.content_type === 'text' ? '📝' : '📎'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                  {l.duration_minutes && <div style={{ fontSize: 12, color: theme.textDim }}>{l.duration_minutes} min</div>}
                  {(l.content_url || l.content_text) &&
                    <button
                      style={{ fontSize: 13, color: theme.accent, display: 'inline-block', marginTop: 4, textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                      onClick={() => onSelectLesson(l)}
                    >Open Content ↗</button>
                  }
                </div>
              </div>
            ))}
          </div>
          {mod.progress_status !== 'completed' &&
            <button style={{ ...btnPrimary, marginTop: 12 }} onClick={() => onCompleteModule(mod.module_id)}>
              Mark Module Complete
            </button>
          }
        </div>
      ))}
    </>
  );
}

export function QuizPlayerPanel({ activeQuiz, timeLeft, formatTime, quizAnswers, onChangeAnswer, onSubmit }) {
  if (!activeQuiz) return null;
  return (
    <div style={card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: fontDisplay }}>
          {activeQuiz.quiz.title}
        </h3>
        {timeLeft !== null &&
          <span style={{ fontWeight: 700, color: timeLeft < 300 ? theme.accent5 : theme.accent, fontSize: 18 }}>
            ⏱ {formatTime(timeLeft)}
            {timeLeft < 300 && <span style={{ fontSize: 12, marginLeft: 6 }}>⚠ Time running out!</span>}
          </span>
        }
      </div>
      {activeQuiz.questions.map((q, i) => (
        <div key={q.question_id} style={quizQuestion}>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>
            Q{i + 1}. {q.question_text}
            <span style={{ color: theme.textMuted, fontWeight: 400, fontSize: 12 }}> ({q.points} pts)</span>
          </div>
          {q.question_type === 'mcq' && q.options
            ? (() => {
                try { return JSON.parse(q.options).map((opt, oi) => (
                  <label key={oi} style={radioLabel}>
                    <input
                      type="radio"
                      name={`q_${q.question_id}`}
                      value={opt}
                      checked={quizAnswers[q.question_id] === opt}
                      onChange={() => onChangeAnswer(q.question_id, opt)}
                    />
                    {' '}{opt}
                  </label>
                )); } catch { return null; }
              })()
            : <input
                style={{ ...formInput, marginTop: 6 }}
                placeholder={q.question_type === 'fill_blank' ? 'Fill in the blank...' : 'Your answer...'}
                value={quizAnswers[q.question_id] || ''}
                onChange={e => onChangeAnswer(q.question_id, e.target.value)}
              />
          }
        </div>
      ))}
      <button style={{ ...btnPrimary, width: '100%', marginTop: 8 }} onClick={onSubmit}>
        Submit Quiz
      </button>
    </div>
  );
}

export function QuizResultPanel({ quizResult, onClose }) {
  if (!quizResult) return null;
  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <h3 style={{ marginTop: 0, fontFamily: fontDisplay }}>Quiz Results</h3>
      <div style={{
        fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8,
        color: quizResult.score >= 70 ? theme.accent3 : quizResult.score >= 50 ? theme.accent4 : theme.accent5
      }}>
        {quizResult.score}%
      </div>
      <div style={{ textAlign: 'center', color: theme.textMuted, marginBottom: 20 }}>
        {quizResult.totalScore} / {quizResult.totalPoints} points
        {quizResult.pendingReview > 0 && (
          <span style={{ marginLeft: 12, color: theme.accent4 }}>
            · {quizResult.pendingReview} question{quizResult.pendingReview > 1 ? 's' : ''} awaiting review
          </span>
        )}
      </div>
      {quizResult.overallFeedback && (
        <div style={{
          padding: '12px 16px', marginBottom: 16, borderRadius: theme.radiusSm,
          background: 'rgba(108,143,255,0.1)', border: '1px solid rgba(108,143,255,0.3)',
          fontSize: 14, color: theme.text, textAlign: 'center'
        }}>
          📝 {quizResult.overallFeedback}
        </div>
      )}
      {quizResult.results.map((r, i) => {
        const isPending = r.is_correct === null || r.is_correct === undefined;
        const isCorrect = r.is_correct === true;
        const bg = isPending
          ? 'rgba(251,176,64,0.10)'
          : (isCorrect ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)');
        const border = isPending
          ? 'rgba(251,176,64,0.35)'
          : (isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(251,113,133,0.3)');
        return (
          <div key={i} style={{
            padding: 12, marginBottom: 8, borderRadius: theme.radiusSm,
            background: bg, border: `1px solid ${border}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
              <span>Q{i + 1}. {r.question_text}</span>
              {isPending && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(251,176,64,0.20)', color: '#a06400'
                }}>
                  ⏳ PENDING REVIEW
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Your answer: <strong>{r.user_answer || '(no answer)'}</strong>
            </div>
            {!isPending && !isCorrect && r.correct_answer &&
              <div style={{ fontSize: 12, color: theme.accent3 }}>
                Correct: <strong>{r.correct_answer}</strong>
              </div>
            }
            <div style={{
              fontSize: 12,
              color: isPending ? '#a06400' : (isCorrect ? theme.accent3 : theme.accent5),
              marginTop: 4
            }}>
              {isPending ? '⏳' : '💡'} {r.feedback}
            </div>
          </div>
        );
      })}
      <button style={{ ...btnGhost, marginTop: 12 }} onClick={onClose}>
        Close Results
      </button>
    </div>
  );
}

export function LessonContentPanel({ selectedLesson, modules, onClose, onCompleteModule }) {
  if (!selectedLesson) return null;
  const parentMod = modules.find(m => m.lessons?.some(l => l.lesson_id === selectedLesson.lesson_id));

  return (
    <div style={{ ...card, marginBottom: 16 }} className="std-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 4,
              background: selectedLesson.content_type === 'video'
                ? 'rgba(36,84,166,0.12)' : selectedLesson.content_type === 'pdf'
                ? 'rgba(179,38,30,0.10)' : 'rgba(31,122,77,0.10)',
              color: selectedLesson.content_type === 'video'
                ? token.accent : selectedLesson.content_type === 'pdf'
                ? token.accent5 : token.accent3
            }}>
              {selectedLesson.content_type === 'video' ? '🎬 Video'
                : selectedLesson.content_type === 'pdf' ? '📄 PDF'
                : selectedLesson.content_type === 'text' ? '📝 Reading'
                : '📎 Material'}
            </span>
            {selectedLesson.duration_minutes && (
              <span style={{ fontSize: 11, color: theme.textDim }}>
                ⏱ {selectedLesson.duration_minutes} min
              </span>
            )}
          </div>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 17, color: token.ink, lineHeight: 1.3 }}>
            {selectedLesson.title}
          </h3>
        </div>
        <button
          style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, marginLeft: 12, flexShrink: 0 }}
          onClick={onClose}
        >← Back</button>
      </div>

      <div style={{ height: 1, background: token.line, marginBottom: 16 }} />

      {selectedLesson.content_type === 'video' && selectedLesson.content_url && (() => {
        const url = selectedLesson.content_url;
        const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
        const ytEmbed = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
        return ytEmbed ? (
          <div style={{ borderRadius: token.radiusSm, overflow: 'hidden', marginBottom: 16, aspectRatio: '16/9', background: '#000' }}>
            <iframe
              src={ytEmbed}
              title={selectedLesson.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
            />
          </div>
        ) : (
          <div style={{
            borderRadius: token.radiusSm, marginBottom: 16,
            background: `linear-gradient(135deg, ${token.ink}, #2454A6)`,
            aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
            color: '#fff', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ fontSize: 48, opacity: 0.9 }}>▶</div>
            <div style={{ fontFamily: fontDisplay, fontSize: 15, opacity: 0.85, textAlign: 'center', padding: '0 24px' }}>
              {selectedLesson.title}
            </div>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              style={{
                background: token.brass, color: '#fff', textDecoration: 'none',
                padding: '9px 20px', borderRadius: token.radiusSm,
                fontSize: 13, fontWeight: 600
              }}
            >
              Open Video ↗
            </a>
          </div>
        );
      })()}

      {selectedLesson.content_type === 'video' && (
        <div style={{ fontSize: 13, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>ℹ️</span>
          Video content for this lesson. Watch the full video to complete this lesson.
        </div>
      )}

      {selectedLesson.content_type === 'pdf' && selectedLesson.content_url && (
        <div>
          <div style={{
            borderRadius: token.radiusSm, overflow: 'hidden',
            border: `1px solid ${token.line}`, marginBottom: 14,
            height: 420, background: token.surface2
          }}>
            <iframe
              src={selectedLesson.content_url}
              title={selectedLesson.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
          <a
            href={selectedLesson.content_url}
            target="_blank"
            rel="noreferrer"
            style={{ ...btnPrimary, display: 'inline-block', textDecoration: 'none', marginBottom: 0 }}
          >
            📄 Open PDF in new tab ↗
          </a>
        </div>
      )}

      {selectedLesson.content_type === 'text' && selectedLesson.content_text && (
        <div style={{
          background: token.surface2,
          border: `1px solid ${token.line}`,
          borderRadius: token.radiusSm,
          padding: '20px 22px',
          fontSize: 14, lineHeight: 1.75,
          color: token.ink,
          whiteSpace: 'pre-wrap',
          fontFamily: '"DM Sans", sans-serif',
        }}>
          {selectedLesson.content_text}
        </div>
      )}

      {selectedLesson.content_type === 'other' && selectedLesson.content_url && (
        <div style={{
          padding: 24, borderRadius: theme.radiusSm, textAlign: 'center',
          background: theme.surface2, border: `1px solid ${theme.border}`
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {selectedLesson.content_url.match(/\.(jpe?g|png|gif)$/i) ? '🖼️' : '📎'}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Attached material</div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 14 }}>
            Click below to open or download the file.
          </div>
          <a
            href={selectedLesson.content_url}
            target="_blank"
            rel="noreferrer"
            style={{ ...btnPrimary, display: 'inline-block', textDecoration: 'none' }}
          >
            Open material ↗
          </a>
        </div>
      )}

      {!selectedLesson.content_url && !selectedLesson.content_text && (
        <div style={{ ...emptyState, paddingTop: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
          <div>Content for this lesson hasn't been uploaded yet.</div>
        </div>
      )}

      <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${token.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: theme.textMuted }}>Finished this lesson?</span>
        <button
          style={btnPrimary}
          onClick={() => {
            if (parentMod && parentMod.progress_status !== 'completed') onCompleteModule(parentMod.module_id);
            onClose();
          }}
        >
          ✓ Mark Module Complete
        </button>
      </div>
    </div>
  );
}

export function QuizListPanel({ quizzes, onStartQuiz, onOpenAssignment }) {
  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardTitle}>Quizzes & Assignments</div>
      </div>
      {quizzes.length === 0
        ? <div style={emptyStateSmall}>No quizzes yet.</div>
        : quizzes.map(q => (
          <div key={q.quiz_id} style={quizItem}>
            <div style={{ ...quizIcon, background: q.submission_type !== 'online_quiz' ? 'rgba(167,139,250,0.12)' : 'rgba(108,143,255,0.12)' }}>
              {q.submission_type !== 'online_quiz' ? '📎' : '✎'}
            </div>
            <div style={quizInfo}>
              <div style={quizName}>{q.title}</div>
              <div style={quizMeta}>
                {q.submission_type !== 'online_quiz' ? 'File Upload' : `Attempts: ${q.attempts_taken}/${q.max_attempts}`}
              </div>
              {q.due_date &&
                <div style={{
                  ...quizMeta,
                  color: new Date(q.due_date) < new Date() ? theme.accent5 : theme.accent4
                }}>
                  {new Date(q.due_date) < new Date() ? 'Closed ' : 'Due '}{new Date(q.due_date).toLocaleDateString()}
                </div>
              }
            </div>
            {q.submission_type !== 'online_quiz'
              ? (() => {
                  const closed = q.due_date && new Date(q.due_date) < new Date();
                  return (
                    <button
                      style={{ ...btnSmall, background: theme.accent2 }}
                      disabled={closed}
                      title={closed ? 'The deadline for this assignment has passed' : undefined}
                      onClick={() => onOpenAssignment(q.quiz_id)}
                    >
                      {closed ? 'Closed' : (q.attempts_taken > 0 ? 'View / Resubmit' : 'Submit')}
                    </button>
                  );
                })()
              : (() => {
                  const closed = q.due_date && new Date(q.due_date) < new Date();
                  if (closed) return <span style={{ ...quizStatus, ...statusPill('done') }}>Closed</span>;
                  return q.attempts_taken < q.max_attempts
                    ? <button style={btnSmall} onClick={() => onStartQuiz(q.quiz_id)}>Start</button>
                    : <span style={{ ...quizStatus, ...statusPill('done') }}>Completed</span>;
                })()
            }
          </div>
        ))
      }
    </div>
  );
}

export function GradesPanel({ grades, onOpenGradeDetail }) {
  return (
    <div style={{ ...card, marginTop: 16 }}>
      <div style={cardHeader}>
        <div style={cardTitle}>My Grades</div>
      </div>
      {grades.length === 0
        ? <div style={emptyStateSmall}>No grades yet.</div>
        : grades.map(g => (
          <div key={g.quiz_attempt_id} style={gradeRow}>
            <div>
              <div style={gradeTitle}>{g.quiz_title}</div>
              <div style={{ color: theme.textMuted, fontSize: 11 }}>
                {g.status === 'graded' ? 'Graded' : 'Pending'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 48, height: 26, borderRadius: 6, fontSize: 11, fontWeight: 700,
                fontFamily: fontDisplay,
                background: g.status === 'graded'
                  ? (g.score >= 70 ? 'rgba(52,211,153,0.12)' : g.score >= 50 ? 'rgba(249,115,22,0.12)' : 'rgba(251,113,133,0.12)')
                  : theme.surface2,
                color: g.status === 'graded'
                  ? (g.score >= 70 ? theme.accent3 : g.score >= 50 ? theme.accent4 : theme.accent5)
                  : theme.textMuted,
              }}>
                {g.status === 'graded' ? `${parseFloat(g.score).toFixed(0)}%` : '—'}
              </div>
              {g.quiz_attempt_id && (
                <button style={btnSmall} onClick={() => onOpenGradeDetail(g.quiz_attempt_id)}>
                  Detail
                </button>
              )}
            </div>
          </div>
        ))
      }
    </div>
  );
}

export function AssignmentPanel({
  assignmentData, assignmentFile, assignmentNote, assignmentUploading,
  onChangeFile, onChangeNote, onSubmit, onClose,
}) {
  if (!assignmentData) return null;
  const { quiz, submission, deadline_passed } = assignmentData;
  const isClosed = deadline_passed;
  const isGraded = submission?.status === 'graded';

  return (
    <div style={{ ...card, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontFamily: fontDisplay, color: theme.text }}>
          📎 {quiz.title}
        </h3>
        <button style={btnGhost} onClick={onClose}>← Back</button>
      </div>

      {quiz.description && (
        <p style={{ fontSize: 13, color: theme.textMuted, marginTop: 0, marginBottom: 14 }}>
          {quiz.description}
        </p>
      )}

      {quiz.due_date && (
        <div style={{ fontSize: 13, color: isClosed ? theme.accent5 : theme.accent4, marginBottom: 14 }}>
          {isClosed ? '⛔ Deadline has passed' : `⏱ Due: ${new Date(quiz.due_date).toLocaleString()}`}
        </div>
      )}

      {submission && (
        <div style={{ padding: 12, background: theme.surface2, borderRadius: theme.radiusSm, marginBottom: 16, fontSize: 13 }}>
          <div style={{ fontWeight: 600, color: theme.text, marginBottom: 6 }}>Current Submission</div>
          <div style={{ color: theme.textMuted }}>
            Status: <span style={{ color: submission.status === 'graded' ? theme.accent3 : theme.accent4, fontWeight: 600 }}>
              {submission.status}
            </span>
          </div>
          {submission.score != null && (
            <div style={{ color: theme.textMuted }}>
              Score: <span style={{ color: theme.accent3, fontWeight: 700 }}>{parseFloat(submission.score).toFixed(1)}%</span>
            </div>
          )}
          {submission.file_url && (
            <div style={{ marginTop: 6 }}>
              <a href={`${BASE_URL}${submission.file_url}`} target="_blank" rel="noreferrer"
                style={{ color: theme.accent, fontSize: 13 }}>
                📄 View submitted file
              </a>
            </div>
          )}
          {submission.feedback && (
            <div style={{ marginTop: 6, color: theme.textMuted }}>
              Feedback: {submission.feedback}
            </div>
          )}
        </div>
      )}

      {!isClosed && !isGraded && (
        <div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
              {submission ? 'Replace Submission (resubmit)' : 'Upload File'}
              <span style={{ color: theme.textMuted, fontWeight: 400, marginLeft: 6 }}>
                PDF, DOCX, PPTX, ZIP, JPG, PNG · max 50 MB
              </span>
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.pptx,.zip,.jpg,.jpeg,.png"
              onChange={e => onChangeFile(e.target.files[0] || null)}
              style={{ display: 'block', fontSize: 13, color: theme.text, width: '100%' }}
            />
            {assignmentFile && (
              <div style={{ fontSize: 12, color: theme.accent3, marginTop: 4 }}>
                Selected: {assignmentFile.name} ({(assignmentFile.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>
              Note (optional)
            </label>
            <textarea
              style={{ width: '100%', background: theme.surface2, border: `1px solid ${theme.border2}`, borderRadius: theme.radiusSm, padding: '8px 12px', color: theme.text, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', minHeight: 60, boxSizing: 'border-box' }}
              placeholder="Add a note to your instructor…"
              value={assignmentNote}
              onChange={e => onChangeNote(e.target.value)}
            />
          </div>
          <button
            style={{ ...btnSmall, width: '100%', padding: '10px 0', fontSize: 14, opacity: assignmentUploading ? 0.6 : 1 }}
            onClick={onSubmit}
            disabled={assignmentUploading}
          >
            {assignmentUploading ? 'Uploading…' : submission ? '↑ Resubmit' : '↑ Submit Assignment'}
          </button>
        </div>
      )}

      {isClosed && !submission && (
        <div style={{ textAlign: 'center', color: theme.accent5, fontSize: 14, padding: '20px 0' }}>
          The deadline has passed. No submission recorded.
        </div>
      )}
    </div>
  );
}

export default function StudentLessonsSection({
  selectedCourse, modules, quizzes, grades, search,
  activeQuiz, quizResult, quizAnswers, timeLeft, formatTime,
  selectedLesson, assignmentData, assignmentFile, assignmentNote, assignmentUploading,
  onSelectLesson, onCompleteModule,
  onChangeAnswer, onSubmitQuiz, onCloseQuizResult,
  onStartQuiz, onOpenAssignment, onOpenGradeDetail,
  onChangeAssignmentFile, onChangeAssignmentNote, onSubmitAssignment,
  onCloseAssignment, onCloseLesson,
}) {
  if (!selectedCourse) {
    return (
      <ModulesPanel
        selectedCourse={null}
        modules={[]}
        search={search}
        selectedLesson={null}
        activeQuiz={null}
        quizResult={null}
        onSelectLesson={onSelectLesson}
        onCompleteModule={onCompleteModule}
      />
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: 20 }}>
      <div>
        <ModulesPanel
          selectedCourse={selectedCourse}
          modules={modules}
          search={search}
          selectedLesson={selectedLesson}
          activeQuiz={activeQuiz}
          quizResult={null}
          onSelectLesson={onSelectLesson}
          onCompleteModule={onCompleteModule}
        />
      </div>

      <div>
        <QuizPlayerPanel
          activeQuiz={activeQuiz}
          timeLeft={timeLeft}
          formatTime={formatTime}
          quizAnswers={quizAnswers}
          onChangeAnswer={onChangeAnswer}
          onSubmit={onSubmitQuiz}
        />
        <QuizResultPanel quizResult={quizResult} onClose={onCloseQuizResult} />
        <LessonContentPanel
          selectedLesson={selectedLesson}
          modules={modules}
          onClose={onCloseLesson}
          onCompleteModule={onCompleteModule}
        />
        {!activeQuiz && !quizResult && !assignmentData && !selectedLesson && (
          <>
            <QuizListPanel quizzes={quizzes} onStartQuiz={onStartQuiz} onOpenAssignment={onOpenAssignment} />
            <GradesPanel grades={grades} onOpenGradeDetail={onOpenGradeDetail} />
          </>
        )}
        <AssignmentPanel
          assignmentData={assignmentData}
          assignmentFile={assignmentFile}
          assignmentNote={assignmentNote}
          assignmentUploading={assignmentUploading}
          onChangeFile={onChangeAssignmentFile}
          onChangeNote={onChangeAssignmentNote}
          onSubmit={onSubmitAssignment}
          onClose={onCloseAssignment}
        />
      </div>
    </div>
  );
}