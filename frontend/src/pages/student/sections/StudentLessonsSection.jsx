import { token, theme, fontDisplay } from '../../../theme';
import {
  card, cardHeader, cardTitle, emptyState, btnPrimary, btnGhost,
  quizItem, quizIcon, quizInfo, quizName, quizMeta, statusPill,
  lessonRow, quizQuestion, radioLabel, gradeRow, gradeTitle, formInput, statusBadge, lessonsGrid,
} from '../components/styles';

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
              {(mod.progress_status || 'not_started') === 'not_started' ? 'Start Module' : 'Mark Module Complete'}
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

  const videoContent = (() => {
    if (selectedLesson.content_type !== 'video' || !selectedLesson.content_url) return null;
    const url = selectedLesson.content_url;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    const ytEmbed = ytMatch ? `https://www.youtube.com/embed/${ytMatch[1]}` : null;
    if (ytEmbed) {
      return (
        <div style={{ borderRadius: token.radiusSm, overflow: 'hidden', marginBottom: 16, aspectRatio: '16/9', background: '#000' }}>
          <iframe src={ytEmbed} title={selectedLesson.title} style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen />
        </div>
      );
    }
    return (
      <div style={{ borderRadius: token.radiusSm, marginBottom: 16, background: `linear-gradient(135deg, ${token.ink}, #2454A6)`, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontSize: 48, opacity: 0.9 }}>▶</div>
        <div style={{ fontFamily: fontDisplay, fontSize: 15, opacity: 0.85, textAlign: 'center', padding: '0 24px' }}>{selectedLesson.title}</div>
        <a href={url} target="_blank" rel="noreferrer" style={{ background: token.brass, color: '#fff', textDecoration: 'none', padding: '9px 20px', borderRadius: token.radiusSm, fontSize: 13, fontWeight: 600 }}>Open Video ↗</a>
      </div>
    );
  })();

  const videoNote = selectedLesson.content_type === 'video' ? (
    <div style={{ fontSize: 13, color: theme.textMuted, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 16 }}>ℹ️</span>Video content for this lesson. Watch the full video to complete this lesson.
    </div>
  ) : null;

  const pdfContent = selectedLesson.content_type === 'pdf' && selectedLesson.content_url ? (
    <div>
      <div style={{ borderRadius: token.radiusSm, overflow: 'hidden', border: `1px solid ${token.line}`, marginBottom: 14, height: 420, background: token.surface2 }}>
        <iframe src={selectedLesson.content_url} title={selectedLesson.title} style={{ width: '100%', height: '100%', border: 'none' }} />
      </div>
      <a href={selectedLesson.content_url} target="_blank" rel="noreferrer" style={{ ...btnPrimary, display: 'inline-block', textDecoration: 'none', marginBottom: 0 }}>📄 Open PDF in new tab ↗</a>
    </div>
  ) : null;

  const textContent = selectedLesson.content_type === 'text' && selectedLesson.content_text ? (
    <div style={{ background: token.surface2, border: `1px solid ${token.line}`, borderRadius: token.radiusSm, padding: '20px 22px', fontSize: 14, lineHeight: 1.75, color: token.ink, whiteSpace: 'pre-wrap', fontFamily: '"DM Sans", sans-serif', marginBottom: 16 }}>
      {selectedLesson.content_text}
    </div>
  ) : null;

  const otherContent = selectedLesson.content_type === 'other' && selectedLesson.content_url ? (
    <div style={{ padding: 24, borderRadius: theme.radiusSm, textAlign: 'center', background: theme.surface2, border: `1px solid ${theme.border}`, marginBottom: 16 }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>{selectedLesson.content_url.match(/\.(jpe?g|png|gif)$/i) ? '🖼️' : '📎'}</div>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Attached material</div>
      <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 14 }}>Click below to open or download the file.</div>
      <a href={selectedLesson.content_url} target="_blank" rel="noreferrer" style={{ ...btnPrimary, display: 'inline-block', textDecoration: 'none' }}>Open material ↗</a>
    </div>
  ) : null;

  const emptyContent = !selectedLesson.content_url && !selectedLesson.content_text ? (
    <div style={{ ...emptyState, paddingTop: 24 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
      <div>Content for this lesson hasn't been uploaded yet.</div>
    </div>
  ) : null;

  const isNotCompleted = parentMod && parentMod.progress_status !== 'completed';
  const buttonLabel = isNotCompleted
    ? ((parentMod.progress_status || 'not_started') === 'not_started' ? '▶ Start Module' : '✓ Mark Module Complete')
    : null;

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
              <span style={{ fontSize: 11, color: theme.textDim }}>⏱ {selectedLesson.duration_minutes} min</span>
            )}
          </div>
          <h3 style={{ margin: 0, fontFamily: fontDisplay, fontSize: 17, color: token.ink, lineHeight: 1.3 }}>
            {selectedLesson.title}
          </h3>
        </div>
        <button style={{ ...btnGhost, padding: '6px 12px', fontSize: 12, marginLeft: 12, flexShrink: 0 }} onClick={onClose}>← Back</button>
      </div>

      <div style={{ height: 1, background: token.line, marginBottom: 16 }} />

      {videoContent}
      {videoNote}
      {pdfContent}
      {textContent}
      {otherContent}
      {emptyContent}

      {buttonLabel && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${token.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: theme.textMuted }}>Finished this lesson?</span>
          <button style={btnPrimary} onClick={() => { onCompleteModule(parentMod.module_id); onClose(); }}>
            {buttonLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export function QuizListPanel({ quizzes, onStartQuiz, onOpenAssignment, onViewGrade }) {
  const getAction = (q) => {
    if (q.status === 'available' || q.status === 'due') {
      return q.type === 'assignment' ? 'Attempt' : 'Start';
    }
    if (q.status === 'submitted' || q.status === 'completed' || q.status === 'graded') {
      if (q.type === 'assignment' && !q.deadline_passed) return 'Resubmit';
      return q.latest_attempt_id ? 'View Result' : null;
    }
    return null;
  };

  const handleClick = (q) => {
    const action = getAction(q);
    if (!action) return;
    if (action === 'View Result') {
      onViewGrade(q.latest_attempt_id);
    } else if (q.type === 'assignment') {
      onOpenAssignment(q.quiz_id);
    } else {
      onStartQuiz(q.quiz_id);
    }
  };

  return (
    <div style={card}>
      <div style={cardHeader}>
        <div style={cardTitle}>Quizzes & Assignments</div>
      </div>
      {quizzes && quizzes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: theme.textMuted, fontSize: 13 }}>
          No quizzes or assignments available yet.
        </div>
      )}
      {quizzes && quizzes.map((q) => {
        const action = getAction(q);
        const isClosed = q.status === 'closed';
        return (
          <div
            key={q.quiz_id}
            style={{
              ...quizItem,
              opacity: isClosed ? 0.5 : 1,
              cursor: action ? 'pointer' : 'default',
            }}
            onClick={() => handleClick(q)}
          >
            <div style={{ ...quizIcon, background: q.type === 'assignment' ? 'rgba(251,176,64,0.12)' : 'rgba(52,211,153,0.12)' }}>
              {q.type === 'assignment' ? '✎' : '📋'}
            </div>
            <div style={quizInfo}>
              <div style={quizName}>{q.title}</div>
              <div style={quizMeta}>
                {q.type === 'assignment'
                  ? `Due: ${q.due_date ? new Date(q.due_date).toLocaleDateString() : 'No deadline'}`
                  : `${q.max_attempts} attempt${q.max_attempts !== 1 ? 's' : ''} · ${q.time_limit_minutes || '?'} min`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={statusPill(q.status)}>
                {q.status === 'available' ? 'Available'
                  : q.status === 'due' ? 'Due Soon'
                  : q.status === 'submitted' ? 'Submitted'
                  : q.status === 'completed' ? 'Completed'
                  : q.status === 'graded' ? 'Graded'
                  : q.status === 'closed' ? 'Closed'
                  : q.status || '—'}
              </span>
              {action && (
                <button
                  style={{
                    background: token.brass,
                    color: '#fff',
                    border: 'none',
                    borderRadius: theme.radiusSm,
                    padding: '5px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={e => { e.stopPropagation(); handleClick(q); }}
                >
                  {action}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function GradeDetailModal({ grade, onClose }) {
  if (!grade) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: 'white', borderRadius: 12, padding: '28px 28px 24px', maxWidth: 520, width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: fontDisplay }}>{grade.quiz_title}</h3>
            <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
              Submitted {grade.submitted_at ? new Date(grade.submitted_at).toLocaleDateString() : '—'}
            </div>
          </div>
          <button style={{ ...btnGhost, padding: '6px 12px' }} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Score', value: `${grade.score}%`, color: grade.score >= 70 ? theme.accent3 : grade.score >= 50 ? theme.accent4 : theme.accent5 },
            { label: 'Points', value: `${grade.points_earned}/${grade.points_total}`, color: theme.text },
            { label: 'Status', value: grade.status, color: grade.status === 'graded' ? theme.accent3 : theme.accent4 },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: token.surface2, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {grade.feedback && (
          <div style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 13 }}>
            💡 {grade.feedback}
          </div>
        )}

        {grade.answers && grade.answers.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Answer Breakdown</div>
            {grade.answers.map((a, i) => (
              <div key={i} style={{ ...gradeRow, borderBottom: i < grade.answers.length - 1 ? `1px solid ${theme.border}` : 'none' }}>
                <div style={gradeTitle}>Q{i + 1}. {a.question_text}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>Your answer: <strong>{a.user_answer || '(no answer)'}</strong></div>
                {a.is_correct === false && a.correct_answer && (
                  <div style={{ fontSize: 12, color: theme.accent3, marginBottom: 4 }}>Correct: <strong>{a.correct_answer}</strong></div>
                )}
                <div style={{ fontSize: 12, color: a.is_correct ? theme.accent3 : theme.accent5 }}>
                  {a.is_correct ? '✅ Correct' : '❌ Incorrect'}{a.feedback ? ` — ${a.feedback}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
          <button style={btnGhost} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const StudentLessonsSection = function StudentLessonsSection({
  selectedCourse, modules, quizzes, grades, search,
  activeQuiz, quizResult, quizAnswers, timeLeft, formatTime,
  selectedLesson, assignmentData, assignmentFile, assignmentNote, assignmentUploading,
  onSelectLesson, onCompleteModule,
  onChangeAnswer, onSubmitQuiz, onCloseQuizResult,
  onStartQuiz, onOpenAssignment, onOpenGradeDetail,
  onChangeAssignmentFile, onChangeAssignmentNote, onSubmitAssignment,
  onCloseAssignment, onCloseLesson,
}) {
  if (!selectedCourse) return <ModulesPanel selectedCourse={null} modules={[]} search={search} selectedLesson={null} activeQuiz={null} quizResult={null} onSelectLesson={() => {}} onCompleteModule={() => {}} />;
  if (selectedLesson) {
    return (
      <LessonContentPanel
        selectedLesson={selectedLesson}
        modules={modules}
        onClose={onCloseLesson}
        onCompleteModule={onCompleteModule}
      />
    );
  }
  if (activeQuiz) {
    return (
      <QuizPlayerPanel
        activeQuiz={activeQuiz}
        timeLeft={timeLeft}
        formatTime={formatTime}
        quizAnswers={quizAnswers}
        onChangeAnswer={onChangeAnswer}
        onSubmit={() => onSubmitQuiz()}
      />
    );
  }
  if (quizResult) {
    return (
      <QuizResultPanel
        quizResult={quizResult}
        onClose={onCloseQuizResult}
      />
    );
  }
  if (assignmentData) {
    const submitted = !!assignmentData.submission;
    return (
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontFamily: fontDisplay }}>{assignmentData.quiz.title || 'Assignment'}</h3>
          <button style={btnGhost} onClick={onCloseAssignment}>✕</button>
        </div>
        <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 16 }}>
          {assignmentData.quiz.description || 'Complete this assignment and submit.'}
        </p>
        {assignmentData.quiz.due_date && (
          <p style={{ fontSize: 12, color: theme.accent4, marginBottom: 12 }}>
            Due: {new Date(assignmentData.quiz.due_date).toLocaleDateString()}
          </p>
        )}

        {submitted ? (
          <div style={{ background: '#eaf7ee', border: '1px solid #b6e2c2', borderRadius: 8, padding: 14, marginBottom: 14 }}>
            <p style={{ margin: 0, fontWeight: 600, color: '#1f7a3a' }}>
              ✓ Submission received ({assignmentData.submission.status})
            </p>
            {assignmentData.submission.file_url && (
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                File: <a href={assignmentData.submission.file_url} target="_blank" rel="noopener noreferrer">
                  {assignmentData.submission.file_url.split('/').pop()}
                </a>
              </p>
            )}
            {assignmentData.submission.feedback && (
              <p style={{ margin: '6px 0 0', fontSize: 13, color: theme.textMuted }}>
                Feedback: {assignmentData.submission.feedback}
              </p>
            )}
            {assignmentData.submission.score != null && (
              <p style={{ margin: '6px 0 0', fontSize: 13 }}>
                Score: <b>{assignmentData.submission.score}</b>
              </p>
            )}
          </div>
        ) : null}

        {(!submitted || !assignmentData.deadline_passed) && (
          <>
            <input
              type="file"
              onChange={e => onChangeAssignmentFile(e.target.files[0])}
              style={{ marginBottom: 12 }}
            />
            {assignmentFile && <p style={{ fontSize: 12, color: theme.textMuted, marginBottom: 12 }}>Selected: {assignmentFile.name}</p>}
            <textarea
              style={{ ...formInput, width: '100%', minHeight: 100, marginBottom: 12 }}
              placeholder="Add a note..."
              value={assignmentNote}
              onChange={e => onChangeAssignmentNote(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={btnPrimary} onClick={onSubmitAssignment} disabled={assignmentUploading}>
                {assignmentUploading ? 'Submitting...' : (submitted ? 'Resubmit' : 'Submit Assignment')}
              </button>
              <button style={btnGhost} onClick={onCloseAssignment}>Close</button>
            </div>
          </>
        )}
        {submitted && assignmentData.deadline_passed && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={btnGhost} onClick={onCloseAssignment}>Close</button>
          </div>
        )}
      </div>
    );
  }
  return (
    <div style={lessonsGrid}>
      <ModulesPanel
        selectedCourse={selectedCourse}
        modules={modules}
        search={search}
        selectedLesson={selectedLesson}
        activeQuiz={activeQuiz}
        quizResult={quizResult}
        onSelectLesson={onSelectLesson}
        onCompleteModule={onCompleteModule}
      />
      <QuizListPanel
        quizzes={quizzes}
        onStartQuiz={onStartQuiz}
        onOpenAssignment={onOpenAssignment}
        onViewGrade={onOpenGradeDetail}
      />
    </div>
  );
};

export default StudentLessonsSection;
