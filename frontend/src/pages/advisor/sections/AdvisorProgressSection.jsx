import { token, fontMono } from '../../../theme';
import { Avatar, Card, Empty, Icon, Spinner } from '../../../components/shared';
import RiskPill from '../components/RiskPill';
import { gpaColor, gpaText, pctText, scoreColor } from '../components/formatters';

export default function AdvisorProgressSection({ progress, loading }) {
  if (loading) return <Card><Spinner label="Loading progress…" /></Card>;

  return (
    <Card>
      <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: '"Lora", serif', fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="trend" size={15} /> Performance overview
      </h3>
      {progress.length === 0 ? (
        <Empty>No performance data yet — this fills in once students start completing courses and quizzes.</Empty>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 }}>
            <thead>
              <tr>
                {['Student', 'Programme', 'GPA', 'Avg. completion', 'Avg. quiz score', 'Quizzes taken', 'Standing'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {progress.map(s => (
                <tr key={s.user_id} className="sils-table-row">
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={s.username} size={28} />
                      <span style={{ fontWeight: 600, color: token.ink }}>{s.username}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>{s.programme || '—'}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: gpaColor(s.gpa), fontFamily: fontMono, fontWeight: 700 }}>{gpaText(s.gpa)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: token.line, borderRadius: 99, height: 6, width: 80 }}>
                        <div style={{ background: token.ink, height: 6, borderRadius: 99, width: `${s.avg_completion}%` }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: fontMono, color: token.inkSoft }}>{parseFloat(s.avg_completion).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: scoreColor(s.avg_quiz_score), fontFamily: fontMono, fontWeight: 700 }}>{pctText(s.avg_quiz_score, 1)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink, fontFamily: fontMono }}>{s.total_quizzes}</td>
                  <td style={{ padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink }}>
                    <RiskPill atRisk={!!s.is_at_risk} />
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