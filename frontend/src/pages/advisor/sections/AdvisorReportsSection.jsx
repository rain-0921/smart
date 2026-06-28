import { token, fontDisplay, fontMono } from '../../../theme';
import { Card, Empty, Icon, Spinner } from '../../../components/shared';
import { gpaColor, gpaText, pctText } from '../components/formatters';

export default function AdvisorReportsSection({
  reportType,
  report,
  loading,
  onChangeType,
  onExport,
}) {
  if (loading) return <Card><Spinner label="Generating report…" /></Card>;
  const disabled = !report || (report.data || []).length === 0;

  return (
    <div className="sils-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'inline-flex', background: token.surface, border: `1px solid ${token.line}`, borderRadius: 8, padding: 3 }}>
          {[['progress', 'Progress report'], ['academic', 'Academic summary']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => onChangeType(key)}
              style={{
                border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: reportType === key ? token.ink : 'transparent',
                color: reportType === key ? '#fff' : token.inkSoft,
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={onExport}
          disabled={disabled}
          style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
            border: `1px solid ${token.line}`, borderRadius: 6,
            background: disabled ? token.surface : token.ink,
            color: disabled ? token.inkFaint : '#fff',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          <Icon name="download" size={13} /> Export CSV
        </button>
      </div>

      {report && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ margin: 0, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 17 }}>{report.type}</h3>
            <span style={{ fontSize: 12, color: token.inkFaint, fontFamily: fontMono }}>
              Generated {new Date().toLocaleDateString()}
            </span>
          </div>

          {(report.data || []).length === 0 ? (
            <Empty>No student data available to build this report yet.</Empty>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              {reportType === 'progress' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 }}>
                  <thead>
                    <tr>
                      {['Student', 'Programme', 'GPA', 'Courses', 'Avg. completion', 'Avg. score', 'At risk'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((s, i) => (
                      <tr key={i} className="sils-table-row">
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.username}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.programme || '—'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: gpaColor(s.gpa), fontFamily: fontMono, fontWeight: 700 }}>{gpaText(s.gpa)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.total_courses}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{pctText(s.avg_completion, 1)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{pctText(s.avg_quiz_score, 1)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.is_at_risk ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 }}>
                  <thead>
                    <tr>
                      {['Student', 'Email', 'Programme', 'Level', 'GPA', 'Enrolled', 'Completed', 'At risk'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((s, i) => (
                      <tr key={i} className="sils-table-row">
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.username}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.email}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.programme || '—'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.academic_level || '—'}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: gpaColor(s.gpa), fontFamily: fontMono, fontWeight: 700 }}>{gpaText(s.gpa)}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.enrolled_courses}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.completed_courses}</td>
                        <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.is_at_risk ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
