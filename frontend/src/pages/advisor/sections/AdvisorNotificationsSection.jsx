import { token, fontDisplay } from '../../../theme';
import { Card, Empty, Icon, Spinner } from '../../../components/shared';

export default function AdvisorNotificationsSection({ notifications, loading, onMarkRead }) {
  if (loading) return <Card><Spinner label="Loading notifications…" /></Card>;

  return (
    <Card>
      <h3 style={{ marginTop: 0, marginBottom: 14, fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="bell" size={15} /> Notifications
      </h3>
      {notifications.length === 0 ? (
        <Empty>You're all caught up — new alerts about your students will show up here.</Empty>
      ) : (
        notifications.map(n => (
          <div
            key={n.notification_id}
            style={{
              display: 'flex', gap: 12, padding: '13px 16px', borderRadius: 8, marginBottom: 8,
              background: n.is_read ? token.surface : token.infoSoft,
              border: `1px solid ${n.is_read ? token.line : token.info + '33'}`,
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: n.is_read ? 'transparent' : token.info }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontWeight: n.is_read ? 500 : 700, fontSize: 14, color: token.ink }}>{n.title}</div>
                <div style={{ fontSize: 11.5, color: token.inkFaint, fontFamily: '"IBM Plex Mono", monospace', whiteSpace: 'nowrap' }}>
                  {new Date(n.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ fontSize: 13, color: token.inkSoft, marginTop: 3 }}>{n.message}</div>
              {!n.is_read && (
                <button
                  onClick={() => onMarkRead(n.notification_id)}
                  style={{ background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginTop: 9 }}
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </Card>
  );
}