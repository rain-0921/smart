import { token, fontDisplay, fontMono } from '../../../theme';
import { Avatar, Card, Empty, Icon, Spinner } from '../../../components/shared';
import StatCard from '../components/StatCard';

export default function AdvisorHomeSection({ dashboard, loading, unreadCount, onOpenStudent }) {
  if (loading) return <Spinner label="Loading dashboard…" />;
  if (!dashboard) return null;

  return (
    <div className="sils-card">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard label="My students"    value={dashboard.totalStudents} accent={token.ink}    icon="people" />
        <StatCard label="At risk"        value={dashboard.atRiskCount}   accent={token.danger} icon="warn" />
        <StatCard label="Average GPA"    value={parseFloat(dashboard.avgGpa).toFixed(2)} accent={token.brass} icon="spark" />
        <StatCard label="Unread alerts"  value={unreadCount}             accent={token.info}   icon="bell" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <Card>
          <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="warn" size={15} color={token.danger} /> Students at risk
          </h3>
          {(dashboard.atRiskStudents || []).length === 0 ? (
            <Empty>No students are flagged as at risk right now.</Empty>
          ) : (
            dashboard.atRiskStudents.map(s => (
              <div key={s.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${token.line}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={s.username} size={32} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: token.ink }}>{s.username}</div>
                    <div style={{ fontSize: 12, color: token.inkFaint }}>{s.programme || 'No programme on file'}</div>
                  </div>
                </div>
                <button
                  onClick={() => onOpenStudent(s)}
                  style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                >
                  View
                </button>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="trend" size={15} color={token.ink} /> Recent student activity
          </h3>
          {(dashboard.recentActivity || []).length === 0 ? (
            <Empty>Nothing logged yet — activity will appear here as students engage with their courses.</Empty>
          ) : (
            dashboard.recentActivity.map((a, i) => (
              <div key={i} style={{ padding: '9px 0', borderBottom: `1px solid ${token.line}`, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: token.ink }}>{a.username}</span>
                  <span style={{ color: token.inkFaint, fontSize: 11.5, fontFamily: fontMono }}>
                    {new Date(a.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ color: token.inkSoft, marginTop: 1 }}>{a.description}</div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}