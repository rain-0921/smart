import { token, fontMono } from '../../../theme';
import { Avatar, Card, Empty, Icon, Spinner } from '../../../components/shared';
import RiskPill from '../components/RiskPill';
import { avgColor, avgText, StatusBadge } from '../components/formatters';

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
                {['Student', 'Email', 'Programme', 'Level', 'Avg Score', 'Courses', 'Status', ''].map(h => (
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
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, fontFamily: fontMono, fontWeight: 700, color: avgColor(s.average_score) }}>{avgText(s.average_score)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.enrolled_courses}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}><StatusBadge status={s.status} /></td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <button onClick={() => onOpenStudent(s)} style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 }}>
                      Profile
                    </button>
                    <button onClick={() => onOpenGrades(s)} style={{ background: token.brass, color: '#1C2541', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 }}>
                      Records
                    </button>
                    {s.average_score < 50 && s.phone_number && (
                      <a
                        href={`https://wa.me/${s.phone_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#25D366', color: '#fff', textDecoration: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Contact
                      </a>
                    )}
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