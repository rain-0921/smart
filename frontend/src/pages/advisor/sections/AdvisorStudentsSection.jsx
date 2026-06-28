import { token, fontMono } from '../../../theme';
import { Avatar, Card, Empty, Icon, Spinner } from '../../../components/shared';
import RiskPill from '../components/RiskPill';
import { gpaColor, gpaText, StatusBadge } from '../components/formatters';

export default function AdvisorStudentsSection({ students, loading, onOpenStudent, onOpenGrades }) {
  if (loading) return <Card><Spinner label="Loading students…" /></Card>;

  return (
    <Card>
      <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: '"Lora", serif', fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="people" size={15} /> Assigned students
      </h3>
      {students.length === 0 ? (
        <Empty>No students are assigned to you yet — once admin assigns a cohort, they'll appear here.</Empty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 }}>
            <thead>
              <tr>
                {['Student', 'Email', 'Programme', 'Level', 'GPA', 'Courses', 'Status', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.user_id} className="sils-table-row">
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={s.username} size={30} />
                      <div>
                        <div style={{ fontWeight: 600, color: token.ink }}>{s.username}</div>
                        {!!s.is_at_risk && <RiskPill atRisk />}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.email}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.programme || '—'}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.academic_level || '—'}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, fontFamily: fontMono, fontWeight: 700, color: gpaColor(s.gpa) }}>{gpaText(s.gpa)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.enrolled_courses}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <button onClick={() => onOpenStudent(s)} style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 }}>
                      Profile
                    </button>
                    <button onClick={() => onOpenGrades(s)} style={{ background: token.brass, color: '#1C2541', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Records
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}