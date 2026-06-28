import { token, fontMono } from '../../../theme';
import { Avatar, Empty, Icon } from '../../../components/shared';
import StatCard from '../components/StatCard';
import { card, cardTitle, table, th, td } from '../components/styles';

export default function AdminDashboardSection({ dashboard, loading }) {
  if (loading) return <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>;
  if (!dashboard) return null;

  return (
    <div className="adm-card">
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        {/* Support both camelCase (frontend convention) and snake_case (backend convention) */}
        <StatCard label="Total Users"       value={dashboard.stats?.totalUsers ?? dashboard.stats?.total_users ?? 0}   accent={token.ink}     icon="people" />
        <StatCard label="Total Courses"     value={dashboard.stats?.totalCourses ?? dashboard.stats?.total_courses ?? 0} accent={token.indigo}  icon="doc" />
        <StatCard label="Total Enrollments" value={dashboard.stats?.totalEnrollments ?? dashboard.stats?.total_enrollments ?? 0} accent={token.good}  icon="clipboard" />
        <StatCard label="Active Students"   value={dashboard.stats?.activeStudents ?? dashboard.stats?.active_students ?? 0} accent={token.brass}   icon="spark" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div style={card}>
          <h3 style={cardTitle}><Icon name="doc" size={15} color={token.indigo} /> Top Courses by Enrollment</h3>
          {(dashboard.topCourses && dashboard.topCourses.length > 0)
            ? <div className="adm-table-wrap"><table style={table}>
                <thead><tr>{['Course Title', 'Enrollments'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{dashboard.topCourses.map((c, i) => (
                  <tr key={i} className="adm-table-row">
                    <td style={{ ...td, fontWeight: 600, color: token.ink }}>{c.title}</td>
                    <td style={{ ...td, fontFamily: fontMono, fontWeight: 600 }}>{c.enrollments}</td>
                  </tr>
                ))}</tbody>
              </table></div>
            : <Empty>No course data yet.</Empty>
          }
        </div>

        <div style={card}>
          <h3 style={cardTitle}><Icon name="bell" size={15} color={token.brass} /> Recent Platform Activity</h3>
          {(dashboard.recentActivity && dashboard.recentActivity.length > 0)
            ? <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dashboard.recentActivity.map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Avatar name={a.username} size={28} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: token.ink }}>
                        {a.username} <span style={{ fontWeight: 400, color: token.inkSoft }}>({a.role})</span>
                      </div>
                      <div style={{ fontSize: 12.5, color: token.inkSoft, marginTop: 1 }}>
                        {a.description || a.activity_type}
                      </div>
                      <div style={{ fontSize: 11, color: token.inkFaint, fontFamily: fontMono, marginTop: 2 }}>
                        {new Date(a.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            : <Empty>No recent activity recorded.</Empty>
          }
        </div>
      </div>
    </div>
  );
}