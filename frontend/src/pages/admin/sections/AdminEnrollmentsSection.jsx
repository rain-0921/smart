import { token, fontMono } from '../../../theme';
import { Empty } from '../../../components/shared';
import { card, cardTitle, table, th, td, btnPrimary, btnSmall, statusBadge } from '../components/styles';

export default function AdminEnrollmentsSection({ enrollments, loading, onAdd, onEdit, onDrop }) {
  return (
    <div style={card} className="adm-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ ...cardTitle, margin: 0 }}>Student Enrollments</h3>
        <button className="adm-btn" style={btnPrimary} onClick={onAdd}>+ Add Enrollment</button>
      </div>
      {loading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
        : enrollments.length === 0
          ? <Empty>No enrollment records yet.</Empty>
          : <div className="adm-table-wrap"><table style={table}>
              <thead><tr>{['Student', 'Email', 'Course', 'Status', 'Enrolled At', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{enrollments.map(e => (
                <tr key={e.enrollment_id} className="adm-table-row">
                  <td style={{ ...td, fontWeight: 600, color: token.ink }}>{e.student_name}</td>
                  <td style={td}>{e.student_email}</td>
                  <td style={td}>{e.course_title}</td>
                  <td style={td}><span style={statusBadge(e.status)}>{e.status}</span></td>
                  <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td style={td}>
                    <button className="adm-row-btn" style={btnSmall} onClick={() => onEdit(e)}>Edit</button>
                    {e.status === 'active' &&
                      <button className="adm-row-btn" style={{ ...btnSmall, background: token.danger, color: '#fff' }} onClick={() => onDrop(e.enrollment_id)}>Drop</button>
                    }
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
      }
    </div>
  );
}