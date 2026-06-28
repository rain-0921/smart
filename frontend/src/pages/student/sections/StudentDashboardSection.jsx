import { theme } from '../../../theme';
import { Empty } from '../../../components/shared';
import { courseTones, token } from '../../../theme';
import { StudentStatCard, greetingTitle, greetingSub, gridTwoOne, sectionTitle, card, emptyState, quizItem, quizIcon, quizInfo, quizName, quizMeta, quizStatus, statusPill, notifItem, notifItemUnread, notifDotSm, notifTitle, notifMsg, notifTime, courseGrid, courseCard, courseThumb, courseTag, courseTitle, courseMeta, progressBar, progressFill, progressLabel, table, th, td } from '../components/styles';

export default function StudentDashboardSection({ user, dashboard, notifications, search, onOpenCourse, onOpenDeadline, onViewGrade, onMarkRead }) {
  if (!dashboard) return null;

  const enrolledCount = dashboard.enrollments?.length || 0;
  const avgCompletion = dashboard.enrollments?.length
    ? Math.round(dashboard.enrollments.reduce((sum, e) => sum + (Number(e.completion_percent) || 0), 0) / dashboard.enrollments.length)
    : null;
  const gpaValue = dashboard.profile?.gpa;
  const gpa = gpaValue != null && !Number.isNaN(Number(gpaValue)) ? Number(gpaValue).toFixed(2) : '—';
  const atRisk = dashboard.profile?.is_at_risk;
  const deadlinesCount = dashboard.deadlines?.length || 0;

  // Decide what label / click handler to use for each upcoming deadline row.
  const deadlineActionFor = (d) => {
    const isAssignment = d.submission_type && d.submission_type !== 'online_quiz';
    const hasAttempt = !!d.latest_attempt_id;
    if (hasAttempt && (d.latest_attempt_status === 'submitted' || d.latest_attempt_status === 'graded')) {
      return { label: 'View Result', tone: 'good', onClick: () => onViewGrade(d.latest_attempt_id) };
    }
    if (hasAttempt && d.latest_attempt_status === 'in_progress') {
      return { label: isAssignment ? 'Resume' : 'Resume', tone: 'warn',
               onClick: () => onOpenDeadline(d) };
    }
    return { label: isAssignment ? 'Open Assignment' : 'Open Quiz', tone: 'due',
             onClick: () => onOpenDeadline(d) };
  };

  return (
    <div className="std-card">
      <div style={{ marginBottom: 24 }}>
        <h2 style={greetingTitle}>Hello, {user.username} 👋</h2>
        <p style={greetingSub}>
          You have {deadlinesCount} upcoming {deadlinesCount === 1 ? 'deadline' : 'deadlines'}. Keep going!
        </p>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StudentStatCard label="Enrolled Courses" value={enrolledCount}
          icon="📚" tone="blue"
          trend={{ type: 'up', text: enrolledCount ? `${enrolledCount} active` : 'Start learning today' }} />
        <StudentStatCard label="Avg. Completion" value={avgCompletion !== null ? `${avgCompletion}%` : '—'}
          icon="◎" tone="green"
          trend={{ type: 'up', text: avgCompletion !== null ? 'Weekly progress' : 'No data yet' }} />
        <StudentStatCard label="Deadlines" value={deadlinesCount}
          icon="✎" tone="orange"
          trend={{ type: deadlinesCount > 0 ? 'down' : 'up', text: deadlinesCount > 0 ? 'Due soon' : 'All clear' }} />
        <StudentStatCard label="GPA" value={gpa}
          icon="🎓" tone={atRisk ? 'orange' : 'purple'}
          trend={{ type: atRisk ? 'down' : 'up', text: atRisk ? '⚠ At-risk student' : 'Keep it up!' }} />
      </div>

      {atRisk && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: theme.radiusSm, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 13, color: theme.accent5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span><strong>At-Risk Alert:</strong> Your academic advisor has flagged your account. Please review your progress and reach out for support if needed.</span>
        </div>
      )}

      <div style={gridTwoOne}>
        <div>
          <div style={sectionTitle}>Continue Learning</div>
          {dashboard.enrollments.length === 0 ? (
            <Empty>No courses yet. Browse the catalogue!</Empty>
          ) : (
            <div style={courseGrid}>
              {dashboard.enrollments.map((e, i) => {
                const tone = courseTones[i % courseTones.length];
                const progress = Math.min(100, Math.max(0, Number(e.completion_percent) || 0));
                return (
                  <div key={e.course_id} style={courseCard} onClick={() => onOpenCourse(e)}>
                    <div style={{ ...courseThumb, background: tone.thumb }}>{e.title?.[0] || '📘'}</div>
                    <div style={{ ...courseTag, background: tone.tagBg, color: tone.tagColor }}>
                      {e.course_code || `COURSE ${e.course_id}`}
                    </div>
                    <div style={courseTitle}>{e.title}</div>
                    <div style={courseMeta}>by {e.instructor_name}</div>
                    <div style={progressBar}>
                      <div style={{ ...progressFill, width: `${progress}%`, background: tone.progress }} />
                    </div>
                    <div style={progressLabel}>
                      <span>{progress}% complete</span>
                      <span>View lessons</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ ...sectionTitle, marginTop: 28 }}>Upcoming Deadlines</div>
          <div style={card}>
            {dashboard.deadlines.length === 0 ? (
              <div style={emptyState}>No upcoming deadlines.</div>
            ) : (
              dashboard.deadlines.map((d, i) => {
                const isAssignment = d.submission_type && d.submission_type !== 'online_quiz';
                const action = deadlineActionFor(d);
                const dueLabel = d.due_date
                  ? `Due ${new Date(d.due_date).toLocaleDateString()}`
                  : 'No deadline';
                return (
                  <div
                    key={`${d.quiz_id}-${i}`}
                    style={{ ...quizItem, cursor: 'pointer' }}
                    onClick={action.onClick}
                  >
                    <div style={{ ...quizIcon, background: isAssignment ? 'rgba(251,176,64,0.12)' : 'rgba(249,115,22,0.12)' }}>
                      {isAssignment ? '✎' : '⏱'}
                    </div>
                    <div style={quizInfo}>
                      <div style={quizName}>{d.title}</div>
                      <div style={quizMeta}>
                        {d.course_title}
                        {isAssignment ? ' · Assignment' : ' · Quiz'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ ...quizStatus, ...statusPill(action.tone) }}>
                        {dueLabel}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                        style={{
                          background: token.brass,
                          color: '#fff',
                          border: 'none',
                          borderRadius: token.radiusSm,
                          padding: '5px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {action.label}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div style={sectionTitle}>Recent Notifications</div>
          <div style={{ ...card, marginBottom: 20 }}>
            {notifications.length === 0 ? (
              <div style={emptyState}>No notifications yet.</div>
            ) : (
              notifications.slice(0, 4).map(n => (
                <div
                  key={n.notification_id}
                  style={{ ...notifItem, ...(n.is_read ? {} : notifItemUnread) }}
                  onClick={() => onMarkRead(n.notification_id)}
                >
                  <div style={{ ...notifDotSm, background: n.is_read ? theme.textDim : theme.accent5 }} />
                  <div style={{ flex: 1 }}>
                    <div style={notifTitle}>{n.title}</div>
                    <div style={notifMsg}>{n.message}</div>
                    <div style={notifTime}>{new Date(n.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={sectionTitle}>Recent Quiz Scores</div>
          <div style={card}>
            {dashboard.quizScores.length === 0 ? (
              <div style={emptyState}>No quiz scores yet.</div>
            ) : (
              <table style={table}>
                <thead>
                  <tr>
                    {['Quiz', 'Score', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {dashboard.quizScores.map((s, i) => (
                    <tr key={i} className="std-table-row">
                      <td style={td}>{s.quiz_title}</td>
                      <td style={td}>
                        <span style={{
                          fontWeight: 700,
                          color: s.score >= 70 ? theme.accent3 : s.score >= 50 ? theme.accent4 : theme.accent5
                        }}>
                          {parseFloat(s.score).toFixed(1)}%
                        </span>
                      </td>
                      <td style={td}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}