import { token, fontMono } from '../../../theme';
import { cardBase, hSection, table, th, td, tdMuted, StatusBadge, InsStatCard } from '../components/styles';

export default function InstructorDashboardSection({ dashboard }) {
  if (!dashboard) return null;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <InsStatCard label="My Courses" value={dashboard.totalCourses} />
        <InsStatCard label="Total Students" value={dashboard.totalStudents} />
        <InsStatCard label="Total Quizzes" value={dashboard.totalQuizzes} />
        <InsStatCard label="Pending Grading" value={dashboard.pendingGrading} />
      </div>

      <div className="ins-card" style={cardBase}>
        <h3 style={{ ...hSection, margin: '0 0 20px 0' }}>Recent Submissions</h3>
        {dashboard.recentSubmissions.length === 0
          ? <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>No submissions yet.</p>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={table}>
                <thead>
                  <tr>
                    {['Student', 'Quiz', 'Score', 'Status', 'Date'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recentSubmissions.map(s => (
                    <tr key={s.quiz_attempt_id} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                      <td style={{ ...td, fontWeight: 500 }}>{s.student_name}</td>
                      <td style={tdMuted}>{s.quiz_title}</td>
                      <td style={{ ...td, fontFamily: fontMono, fontWeight: 600, color: s.score != null ? token.brass : token.inkFaint }}>
                        {s.score != null ? `${parseFloat(s.score).toFixed(1)}%` : '—'}
                      </td>
                      <td style={td}><StatusBadge status={s.status} /></td>
                      <td style={{ ...tdMuted, fontFamily: fontMono, fontSize: 12 }}>
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  );
}