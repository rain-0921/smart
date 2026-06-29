import { token, fontDisplay } from '../../../theme';
import { Modal } from '../../../components/shared';
import { label, inputStyle, inputNum, btnPrimary } from '../components/styles';
import { BASE_URL } from '../../../services/api';

export function CourseModal({ editingCourse, courseForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingCourse ? 'Edit Course' : 'New Course'} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Title</label>
        <input className="ins-input" style={inputStyle}
          value={courseForm.title} onChange={e => onChange({ ...courseForm, title: e.target.value })} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Description</label>
        <textarea className="ins-input" style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={courseForm.description} onChange={e => onChange({ ...courseForm, description: e.target.value })} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={label}>Status</label>
        <select className="ins-select" style={inputStyle}
          value={courseForm.status} onChange={e => onChange({ ...courseForm, status: e.target.value })}>
          {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingCourse ? 'Update' : 'Create'} Course
      </button>
    </Modal>
  );
}

export function ModuleModal({ editingModule, moduleForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingModule ? 'Edit Module' : 'Add Module'} onClose={onClose}>
      {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={label}>{f.label}</label>
          <input className="ins-input" style={inputStyle}
            value={moduleForm[f.key]} onChange={e => onChange({ ...moduleForm, [f.key]: e.target.value })} />
        </div>
      ))}
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingModule ? 'Update' : 'Add'} Module
      </button>
    </Modal>
  );
}

export function LessonModal({ editingLesson, lessonForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Title</label>
        <input className="ins-input" style={inputStyle}
          value={lessonForm.title} onChange={e => onChange({ ...lessonForm, title: e.target.value })} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Content Type</label>
        <select className="ins-select" style={inputStyle}
          value={lessonForm.content_type} onChange={e => onChange({ ...lessonForm, content_type: e.target.value, file: null })}>
          <option value="text">Text content (lesson body)</option>
          <option value="video">Video URL (YouTube, Vimeo, etc.)</option>
          <option value="pdf">PDF URL (link to hosted PDF)</option>
          <option value="other">Upload material file (DOC, PPT, image, video)</option>
        </select>
      </div>

      {(lessonForm.content_type === 'video' || lessonForm.content_type === 'pdf') && (
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Content URL</label>
          <input className="ins-input" style={inputStyle}
            value={lessonForm.content_url} placeholder="https://..." onChange={e => onChange({ ...lessonForm, content_url: e.target.value })} />
        </div>
      )}

      {lessonForm.content_type === 'other' && (
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Upload Material File</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.mov,.jpg,.jpeg,.png,.gif"
            onChange={e => onChange({ ...lessonForm, file: e.target.files?.[0] || null })}
            style={inputStyle}
          />
          {lessonForm.file && (
            <div style={{ fontSize: 11, color: token.inkSoft, marginTop: 6 }}>
              Selected: <strong>{lessonForm.file.name}</strong> ({Math.round(lessonForm.file.size / 1024)} KB)
            </div>
          )}
          <div style={{ fontSize: 11, color: token.inkFaint, marginTop: 6 }}>
            Accepted: PDF, DOC/DOCX, PPT/PPTX, MP4/WEBM/MOV, JPG/PNG/GIF · Max 50MB
          </div>
        </div>
      )}

      {lessonForm.content_type === 'text' && (
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Content Text</label>
          <textarea className="ins-input" style={{ ...inputStyle, height: 100, resize: 'vertical' }}
            value={lessonForm.content_text} onChange={e => onChange({ ...lessonForm, content_text: e.target.value })} />
        </div>
      )}
      <div style={{ marginBottom: 18 }}>
        <label style={label}>Duration (minutes)</label>
        <input className="ins-input" type="number" style={inputStyle}
          value={lessonForm.duration_minutes} onChange={e => onChange({ ...lessonForm, duration_minutes: e.target.value })} />
      </div>
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingLesson ? 'Update' : 'Add'} Lesson
      </button>
    </Modal>
  );
}

export function QuizModal({ editingQuiz, quizForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingQuiz ? 'Edit Quiz' : 'New Quiz'} onClose={onClose}>
      {[{ label: 'Title', key: 'title' }, { label: 'Description', key: 'description' }].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={label}>{f.label}</label>
          <input className="ins-input" style={inputStyle}
            value={quizForm[f.key]} onChange={e => onChange({ ...quizForm, [f.key]: e.target.value })} />
        </div>
      ))}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={label}>Due Date</label>
          <input className="ins-input" type="datetime-local" style={inputStyle}
            value={quizForm.due_date} onChange={e => onChange({ ...quizForm, due_date: e.target.value })} />
        </div>
        <div>
          <label style={label}>Time Limit (mins)</label>
          <input className="ins-input" type="number" min="0" style={inputStyle}
            value={quizForm.time_limit_minutes} onChange={e => onChange({ ...quizForm, time_limit_minutes: e.target.value })} />
        </div>
        <div>
          <label style={label}>Max Attempts</label>
          <input className="ins-input" type="number" min="1" style={inputStyle}
            value={quizForm.max_attempts} onChange={e => onChange({ ...quizForm, max_attempts: e.target.value })} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={label}>Submission Type</label>
          <select className="ins-select" style={inputStyle}
            value={quizForm.submission_type} onChange={e => onChange({ ...quizForm, submission_type: e.target.value })}>
            {['online_quiz', 'file_upload', 'mixed'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {quizForm.submission_type === 'online_quiz' && (
          <div>
            <label style={label}>Questions per Attempt</label>
            <input className="ins-input" type="number" min="1" placeholder="All questions"
              style={inputStyle}
              value={quizForm.num_questions_per_attempt}
              onChange={e => onChange({ ...quizForm, num_questions_per_attempt: e.target.value })} />
          </div>
        )}
        <div>
          <label style={label}>Status</label>
          <select className="ins-select" style={inputStyle}
            value={quizForm.status} onChange={e => onChange({ ...quizForm, status: e.target.value })}>
            {['draft', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      {quizForm.submission_type === 'online_quiz' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, cursor: 'pointer', fontSize: 13, color: token.inkSoft }}>
          <input type="checkbox" checked={quizForm.randomize_questions}
            onChange={e => onChange({ ...quizForm, randomize_questions: e.target.checked })} style={{ accentColor: token.brass }} />
          Randomize Questions
        </label>
      )}
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingQuiz ? 'Update' : 'Create'} Quiz
      </button>
    </Modal>
  );
}

export function QuestionModal({ editingQuestionId, qForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingQuestionId ? 'Edit Question (revise feedback tip)' : 'Add Question'} onClose={onClose} wide>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Question Type</label>
        <select className="ins-select" style={inputStyle}
          value={qForm.question_type} onChange={e => onChange({ ...qForm, question_type: e.target.value })}>
          {['mcq', 'fill_blank', 'short_answer'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Question Text</label>
        <textarea className="ins-input" style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={qForm.question_text} onChange={e => onChange({ ...qForm, question_text: e.target.value })} />
      </div>
      {qForm.question_type === 'mcq' && (
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Options</label>
          {qForm.options.map((opt, i) => (
            <input key={i} className="ins-input" style={{ ...inputStyle, marginBottom: 6, display: 'block' }}
              placeholder={`Option ${String(i + 1)}`}
              value={opt} onChange={e => { const opts = [...qForm.options]; opts[i] = e.target.value; onChange({ ...qForm, options: opts }); }} />
          ))}
        </div>
      )}
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Correct Answer</label>
        <input className="ins-input" style={inputStyle}
          value={qForm.correct_answer} onChange={e => onChange({ ...qForm, correct_answer: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div>
          <label style={label}>Points</label>
          <input className="ins-input" type="number" min="1" style={inputStyle}
            value={qForm.points} onChange={e => onChange({ ...qForm, points: e.target.value })} />
        </div>
        <div>
          <label style={label}>
            Improvement Tip
            <span style={{ marginLeft: 8, fontSize: 10, color: (qForm.improvement_tip || '').length > 500 ? token.danger : token.inkFaint, fontWeight: 400 }}>
              {(qForm.improvement_tip || '').length}/500
            </span>
          </label>
          <textarea className="ins-input" style={{ ...inputStyle, height: 60, resize: 'vertical', borderColor: (qForm.improvement_tip || '').length > 500 ? token.danger : token.line }}
            value={qForm.improvement_tip} placeholder="Shown to students when they answer incorrectly"
            onChange={e => { if (e.target.value.length <= 500) onChange({ ...qForm, improvement_tip: e.target.value }); }} />
        </div>
      </div>
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingQuestionId ? 'Save Changes' : 'Add Question'}
      </button>
    </Modal>
  );
}

export function GradeModal({ gradingItem, gradeForm, onChange, onClose, onSubmit }) {
  if (!gradingItem) return null;
  return (
    <Modal title="Grade Submission" onClose={onClose}>
      <div style={{ background: token.surface2, padding: 14, borderRadius: 8, marginBottom: 18, fontSize: 13, color: token.inkSoft }}>
        <div><strong>Student:</strong> {gradingItem.student_name}</div>
        <div><strong>Quiz:</strong> {gradingItem.quiz_title}</div>
        <div><strong>Course:</strong> {gradingItem.course_title}</div>
        {gradingItem.submission_type !== 'online_quiz' && (
          <div style={{ marginTop: 8 }}>
            <strong>File:</strong>{' '}
            {gradingItem.file_url
              ? <a href={`${BASE_URL}${gradingItem.file_url}`} target="_blank" rel="noreferrer" style={{ color: token.brass }}>Download</a>
              : <span style={{ color: token.inkFaint }}>No file</span>
            }
          </div>
        )}
        {gradingItem.text_note && <div style={{ marginTop: 4 }}><strong>Note:</strong> {gradingItem.text_note}</div>}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={label}>Score (0–100)</label>
        <input className="ins-input" type="number" min="0" max="100" style={{ ...inputStyle, fontFamily: '"IBM Plex Mono", monospace' }}
          value={gradeForm.score} onChange={e => onChange({ ...gradeForm, score: e.target.value })} />
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={label}>Feedback / Comments</label>
        <textarea className="ins-input" style={{ ...inputStyle, height: 80, resize: 'vertical' }}
          value={gradeForm.feedback} placeholder="Optional feedback for the student..." onChange={e => onChange({ ...gradeForm, feedback: e.target.value })} />
      </div>
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        Submit Grade
      </button>
    </Modal>
  );
}

export function FeedbackBandModal({ editingFeedback, feedbackForm, onChange, onClose, onSubmit }) {
  return (
    <Modal title={editingFeedback ? 'Edit Feedback Band' : 'Add Feedback Band'} onClose={onClose}>
      <p style={{ fontSize: 13, color: token.inkSoft, marginTop: 0, marginBottom: 16 }}>
        Define a score range. Students see the matching message after submitting.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={label}>Min Score (%)</label>
          <input className="ins-input" type="number" min="0" max="100" style={inputNum}
            value={feedbackForm.min_score} onChange={e => onChange({ ...feedbackForm, min_score: e.target.value })} />
        </div>
        <div>
          <label style={label}>Max Score (%)</label>
          <input className="ins-input" type="number" min="0" max="100" style={inputNum}
            value={feedbackForm.max_score} onChange={e => onChange({ ...feedbackForm, max_score: e.target.value })} />
        </div>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={label}>Message (max 500 chars)</label>
        <textarea className="ins-input"
          style={{ ...inputStyle, height: 90, resize: 'vertical' }}
          maxLength={500}
          value={feedbackForm.feedback_message}
          placeholder="e.g. Great work! You have a solid grasp of this topic."
          onChange={e => onChange({ ...feedbackForm, feedback_message: e.target.value })} />
        <div style={{ fontSize: 11, color: token.inkFaint, textAlign: 'right', marginTop: 4 }}>{feedbackForm.feedback_message.length}/500</div>
      </div>
      <button className="ins-btn" onClick={onSubmit} style={btnPrimary}>
        {editingFeedback ? 'Update' : 'Add'} Feedback Band
      </button>
    </Modal>
  );
}

export function ProfileModal({ profileForm, photoFile, onChange, onPhotoSelect, onClose, onSubmit }) {
  return (
    <Modal title="My Profile" onClose={onClose}>
      <div style={{ background: token.surface2, padding: '12px 16px', borderRadius: 10, marginBottom: 18, border: `1px solid ${token.line}` }}>
        <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Profile Photo (JPG/PNG, max 5MB)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${token.line}`, background: token.surface3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {profileForm.photo_url
              ? <img src={`${BASE_URL}${profileForm.photo_url}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
              : <span style={{ fontSize: 24 }}>👨‍🏫</span>
            }
          </div>
          <label style={{ cursor: 'pointer', fontSize: 12, color: token.brass, fontWeight: 600, padding: '6px 14px', borderRadius: 8, border: `1px solid ${token.brass}40`, background: token.brassSoft }}>
            Choose Photo
            <input type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={e => onPhotoSelect(e.target.files[0] || null)} />
          </label>
          {photoFile && <span style={{ fontSize: 11, color: token.inkSoft }}>{photoFile.name}</span>}
        </div>
      </div>
      {[
        { label: 'Username', key: 'username' },
        { label: 'Phone Number', key: 'phone_number' },
        { label: 'Department', key: 'department' },
        { label: 'Specialization', key: 'specialization' },
        { label: 'Subjects Taught', key: 'subjects_taught' },
        { label: 'Office Hours', key: 'office_hours' },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 12 }}>
          <label style={label}>{f.label}</label>
          <input className="ins-input" style={inputStyle}
            value={profileForm[f.key] || ''} onChange={e => onChange({ ...profileForm, [f.key]: e.target.value })} />
        </div>
      ))}
      <button className="ins-btn" onClick={onSubmit} style={{ ...btnPrimary, marginTop: 6 }}>
        Save Profile
      </button>
    </Modal>
  );
}

export function StudentDetailModal({ studentDetail, onClose }) {
  if (!studentDetail) return null;
  const { profile, courses, quizAttempts, submissions } = studentDetail;
  return (
    <Modal title={`${profile.username} — Progress`} wide onClose={onClose}>
      <div style={{ background: token.surface2, padding: 16, borderRadius: 10, marginBottom: 18, border: `1px solid ${token.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: token.ink, fontFamily: fontDisplay }}>
              {profile.username}
            </div>
            <div style={{ fontSize: 12, color: token.inkSoft, marginTop: 2 }}>{profile.email}</div>
            <div style={{ fontSize: 12, color: token.inkSoft, marginTop: 6 }}>
              {profile.programme || '—'}
              {profile.academic_level && ` · ${profile.academic_level}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: token.inkFaint, textTransform: 'uppercase' }}>Avg Score</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 22, color: token.ink, fontWeight: 700 }}>
                {profile.average_score != null ? `${Number(profile.average_score).toFixed(2)}%` : '—'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: token.inkFaint, textTransform: 'uppercase' }}>Standing</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: profile.is_at_risk ? token.danger : token.good, marginTop: 6 }}>
                {profile.is_at_risk ? '⚠ At risk' : '✓ On track'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: token.inkFaint, textTransform: 'uppercase' }}>Quizzes</div>
              <div style={{ fontFamily: fontDisplay, fontSize: 22, color: token.ink, fontWeight: 700 }}>{quizAttempts.length}</div>
            </div>
          </div>
        </div>
      </div>

      <h4 style={{ margin: '0 0 8px 0', fontFamily: fontDisplay, fontSize: 14, color: token.ink }}>Courses (your courses)</h4>
      {courses.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 12 }}>Not enrolled in any of your courses.</p>
        : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 18 }}>
            <thead>
              <tr>
                {['Course', 'Status', 'Completion', 'Enrolled'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.6, borderBottom: `1px solid ${token.line}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.course_id} style={{ borderTop: `1px solid ${token.line}` }}>
                  <td style={{ padding: '8px 10px', color: token.ink, fontWeight: 500 }}>{c.title}</td>
                  <td style={{ padding: '8px 10px', color: token.inkSoft, textTransform: 'capitalize' }}>{c.enrollment_status}</td>
                  <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', color: token.ink }}>{parseFloat(c.completion_percent || 0).toFixed(1)}%</td>
                  <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', color: token.inkSoft, fontSize: 11 }}>{new Date(c.enrolled_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      <h4 style={{ margin: '0 0 8px 0', fontFamily: fontDisplay, fontSize: 14, color: token.ink }}>Quiz attempts ({quizAttempts.length})</h4>
      {quizAttempts.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 12, marginBottom: 18 }}>No quiz attempts yet.</p>
        : (
          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 18, border: `1px solid ${token.line}`, borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: token.surface2 }}>
                  {['Quiz', 'Course', 'Type', 'Score', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '6px 10px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 10, letterSpacing: 0.6 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map(qa => (
                  <tr key={qa.quiz_attempt_id} style={{ borderTop: `1px solid ${token.line}` }}>
                    <td style={{ padding: '8px 10px', color: token.ink }}>{qa.quiz_title}</td>
                    <td style={{ padding: '8px 10px', color: token.inkSoft }}>{qa.course_title}</td>
                    <td style={{ padding: '8px 10px', color: token.inkSoft, fontSize: 11 }}>{qa.submission_type.replace('_', ' ')}</td>
                    <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, color: qa.score >= 70 ? token.good : qa.score >= 50 ? token.warn : token.danger }}>
                      {qa.score != null ? `${parseFloat(qa.score).toFixed(1)}%` : '—'}
                    </td>
                    <td style={{ padding: '8px 10px', color: token.inkSoft, textTransform: 'capitalize' }}>{qa.status.replace('_', ' ')}</td>
                    <td style={{ padding: '8px 10px', fontFamily: '"IBM Plex Mono", monospace', color: token.inkFaint, fontSize: 11 }}>{new Date(qa.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      <h4 style={{ margin: '0 0 8px 0', fontFamily: fontDisplay, fontSize: 14, color: token.ink }}>Assignment submissions ({submissions.length})</h4>
      {submissions.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 12 }}>No file submissions.</p>
        : (
          <div style={{ maxHeight: 180, overflowY: 'auto', border: `1px solid ${token.line}`, borderRadius: 8 }}>
            {submissions.map((s, i) => (
              <div key={s.answer_id || i} style={{ padding: '10px 14px', borderTop: i > 0 ? `1px solid ${token.line}` : 'none', fontSize: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: token.ink, fontWeight: 600 }}>{s.quiz_title}</div>
                    <div style={{ color: token.inkFaint, fontSize: 11, marginTop: 2 }}>{s.course_title} · {new Date(s.created_at).toLocaleDateString()}</div>
                  </div>
                  {s.file_url && (
                    <a href={`${BASE_URL}${s.file_url}`} target="_blank" rel="noreferrer"
                      style={{ fontSize: 11, color: token.brass, fontWeight: 600, textDecoration: 'none', padding: '4px 10px', border: `1px solid ${token.brass}40`, borderRadius: 6 }}>
                      Download file
                    </a>
                  )}
                </div>
                {s.feedback && <div style={{ color: token.inkSoft, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>Feedback: {s.feedback}</div>}
              </div>
            ))}
          </div>
        )}
    </Modal>
  );
}