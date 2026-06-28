import { token } from '../../../theme';
import { cardBase, hSection, btnRow, table, th, td, tdMuted } from '../components/styles';

export default function InstructorGradingSection({ pending, onOpenGrade }) {
  return (
    <div className="ins-card" style={cardBase}>
      <h3 style={{ ...hSection, margin: '0 0 20px 0' }}>Pending Submissions</h3>
      {pending.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13, margin: 0 }}>No pending submissions.</p>
        : (
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  {['Student', 'Quiz', 'Course', 'Submitted', 'Action'].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map(p => (
                  <tr key={p.quiz_attempt_id} className="ins-table-row" style={{ borderTop: `1px solid ${token.line}` }}>
                    <td style={{ ...td, fontWeight: 500 }}>{p.student_name}</td>
                    <td style={tdMuted}>{p.quiz_title}</td>
                    <td style={tdMuted}>{p.course_title}</td>
                    <td style={{ ...tdMuted, fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td style={td}>
                      <button className="ins-btn" onClick={() => onOpenGrade(p)} style={{ ...btnRow, padding: '6px 14px' }}>
                        Grade
                      </button>
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