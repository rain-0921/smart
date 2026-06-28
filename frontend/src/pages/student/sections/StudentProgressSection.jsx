import { theme, courseTones, fontDisplay } from '../../../theme';
import { Spinner } from '../../../components/shared';
import {
  sectionTitle, card, emptyState, quizItem, quizIcon, quizInfo, quizName, quizMeta, quizStatus, statusPill,
  progressBar, progressFill, statCard, statusBadge,
} from '../components/styles';

export default function StudentProgressSection({ progressData, onGotoLessons }) {
  if (!progressData) return <Spinner label="Loading your progress…" />;

  return (
    <div>
      {/* GPA & at-risk banner */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ ...statCard, flex: '1 1 180px', borderTop: `2px solid ${progressData.is_at_risk ? theme.accent5 : theme.accent3}` }}>
          <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Current GPA</div>
          <div style={{ fontFamily: fontDisplay, fontSize: 36, color: progressData.gpa != null ? theme.text : theme.textDim, lineHeight: 1 }}>
            {progressData.gpa != null ? Number(progressData.gpa).toFixed(2) : '—'}
          </div>
      {progressData.is_at_risk && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.3)', fontSize: 13, color: theme.accent5, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <span><strong>At-Risk Alert:</strong> Your academic advisor has been notified of your GPA (below 2.0). Please reach out for support.</span>
        </div>
      )}
        </div>
        <div style={{ ...statCard, flex: '1 1 180px', borderTop: `2px solid ${theme.accent}` }}>
          <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Active Courses</div>
          <div style={{ fontFamily: fontDisplay, fontSize: 36, color: theme.text, lineHeight: 1 }}>
            {progressData.courses.filter(c => c.enrollment_status === 'active').length}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {progressData.recommendations?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sectionTitle}>Recommended Next Steps</div>
          <div style={card}>
            {progressData.recommendations.map((r, i) => (
              <div key={i} style={{ ...quizItem, cursor: r.type === 'module' ? 'pointer' : 'default' }}
                onClick={() => r.type === 'module' && onGotoLessons()}>
                <div style={{ ...quizIcon, background: r.type === 'quiz' ? 'rgba(167,139,250,0.12)' : 'rgba(52,211,153,0.12)' }}>
                  {r.type === 'quiz' ? '✎' : '▶'}
                </div>
                <div style={quizInfo}>
                  <div style={quizName}>{r.message}</div>
                  {r.due_date && (
                    <div style={{ ...quizMeta, color: theme.accent4 }}>
                      Due {new Date(r.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <span style={{ ...quizStatus, ...statusPill(r.type === 'quiz' ? 'due' : 'open') }}>
                  {r.type === 'quiz' ? 'Quiz' : 'Continue'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-course breakdown */}
      <div style={sectionTitle}>Course Breakdown</div>
      {progressData.courses.length === 0 ? (
        <div style={emptyState}>No enrolled courses yet.</div>
      ) : progressData.courses.map((c, ci) => {
        const tone = courseTones[ci % courseTones.length];
        const completion = Math.min(100, Math.max(0, Number(c.module_completion_percent) || 0));
        const avgScore = c.quiz_stats?.avg_score != null ? parseFloat(c.quiz_stats.avg_score).toFixed(1) : null;
        const bestScore = c.quiz_stats?.best_score != null ? parseFloat(c.quiz_stats.best_score).toFixed(1) : null;
        return (
          <div key={c.enrollment_id} style={{ ...card, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontFamily: fontDisplay, fontSize: 16, color: theme.text, marginBottom: 2 }}>{c.course_title}</div>
                <div style={{ fontSize: 12, color: theme.textMuted }}>by {c.instructor_name}</div>
              </div>
              <span style={statusBadge(c.enrollment_status === 'active' ? 'in_progress' : 'completed')}>
                {c.enrollment_status}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: theme.textMuted, marginBottom: 6 }}>
                <span>Module Completion</span>
                <span style={{ fontWeight: 600, color: theme.text }}>{completion}%</span>
              </div>
              <div style={progressBar}>
                <div style={{ ...progressFill, width: `${completion}%`, background: tone.progress }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              {[
                { label: 'Attempts',  value: c.quiz_stats?.attempts_count ?? 0 },
                { label: 'Avg Score', value: avgScore != null ? `${avgScore}%` : '—' },
                { label: 'Best Score',value: bestScore != null ? `${bestScore}%` : '—' },
              ].map(stat => (
                <div key={stat.label} style={{ flex: 1, background: theme.surface2, borderRadius: 6, padding: '8px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{stat.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: theme.text }}>{stat.value}</div>
                </div>
              ))}
            </div>

            {c.modules?.length > 0 && (
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: 10 }}>
                <div style={{ fontSize: 11, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Modules</div>
                {c.modules.map(m => (
                  <div key={m.module_id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderBottom: `1px solid ${theme.border}` }}>
                    <span style={{ fontSize: 14 }}>
                      {m.status === 'completed' ? '✅' : m.status === 'in_progress' ? '🔄' : '○'}
                    </span>
                    <div style={{ flex: 1, fontSize: 13, color: theme.text }}>{m.title}</div>
                    <span style={statusBadge(m.status || 'not_started')} />
                    {m.completed_at && (
                      <div style={{ fontSize: 11, color: theme.textDim }}>{new Date(m.completed_at).toLocaleDateString()}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}