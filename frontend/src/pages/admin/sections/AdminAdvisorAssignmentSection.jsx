import { token } from '../../../theme';
import { Empty } from '../../../components/shared';
import { card, cardTitle, table, th, td, btnSmall } from '../components/styles';

export default function AdminAdvisorAssignmentSection({ students, loading, onAssign }) {
  return (
    <div style={card} className="adm-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Advisor Assignment</h3>
        <p style={{ fontSize: 13, color: token.inkFaint, margin: 0 }}>
          Assign or reassign an advisor for each student.
        </p>
      </div>
      {loading
        ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
        : students.length === 0
          ? <Empty>No students found.</Empty>
          : <div className="adm-table-wrap"><table style={table}>
              <thead><tr>
                {['Student', 'Email', 'Department', 'Current Advisor', 'Actions'].map(h =>
                  <th key={h} style={th}>{h}</th>
                )}
              </tr></thead>
              <tbody>{students.map(s => (
                <tr key={s.user_id} className="adm-table-row">
                  <td style={{ ...td, fontWeight: 600, color: token.ink }}>{s.username}</td>
                  <td style={td}>{s.email}</td>
                  <td style={td}>{s.department || '—'}</td>
                  <td style={td}>
                    {s.advisor_name
                      ? <span style={{ color: token.success }}>{s.advisor_name}</span>
                      : <span style={{ color: token.danger, fontStyle: 'italic' }}>Unassigned</span>
                    }
                  </td>
                  <td style={td}>
                    <button
                      className="adm-row-btn" style={btnSmall}
                      onClick={() => onAssign(s)}
                    >
                      Assign / Change
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
      }
    </div>
  );
}
