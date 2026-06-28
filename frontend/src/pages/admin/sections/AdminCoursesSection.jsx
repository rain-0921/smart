import { token, fontMono } from '../../../theme';
import { Empty } from '../../../components/shared';
import { card, cardTitle, table, th, td, btnPrimary, btnSmall, statusBadge } from '../components/styles';

export default function AdminCoursesSection({ courses, loading, onAdd, onEdit, onArchive }) {
  return (
    <div style={card} className="adm-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ ...cardTitle, margin: 0 }}>All Courses</h3>
        <button className="adm-btn" style={btnPrimary} onClick={onAdd}>+ Add Course</button>
      </div>
      {loading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
        : courses.length === 0
          ? <Empty>No courses created yet.</Empty>
          : <div className="adm-table-wrap"><table style={table}>
              <thead><tr>{['Title', 'Instructor', 'Status', 'Created', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{courses.map(c => (
                <tr key={c.course_id} className="adm-table-row">
                  <td style={{ ...td, fontWeight: 600, color: token.ink }}>{c.title}</td>
                  <td style={td}>{c.instructor_name}</td>
                  <td style={td}><span style={statusBadge(c.status)}>{c.status}</span></td>
                  <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td style={td}>
                    <button className="adm-row-btn" style={btnSmall} onClick={() => onEdit(c)}>Edit</button>
                    {c.status !== 'archived' &&
                      <button className="adm-row-btn" style={{ ...btnSmall, background: token.warn, color: '#fff' }} onClick={() => onArchive(c.course_id)}>Archive</button>
                    }
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
      }
    </div>
  );
}