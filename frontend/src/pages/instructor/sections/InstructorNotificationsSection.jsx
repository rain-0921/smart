import { token } from '../../../theme';
import { cardBase, hSection } from '../components/styles';

export default function InstructorNotificationsSection({ notifications, onMarkRead }) {
  return (
    <div className="ins-card" style={cardBase}>
      <h3 style={{ ...hSection, margin: '0 0 20px 0' }}>Notifications</h3>
      {notifications.length === 0
        ? <p style={{ color: token.inkFaint, fontSize: 13 }}>No notifications.</p>
        : notifications.map(n => (
          <div key={n.notification_id} style={{
            padding: '14px 16px', borderRadius: 8, marginBottom: 8,
            background: n.is_read ? token.surface2 : token.brassSoft,
            border: `1px solid ${n.is_read ? token.line : token.brass}30`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontWeight: n.is_read ? 400 : 700, fontSize: 14, color: token.ink }}>{n.title}</div>
              <div style={{ fontSize: 11, color: token.inkFaint, fontFamily: '"IBM Plex Mono", monospace', flexShrink: 0, marginLeft: 12 }}>
                {new Date(n.created_at).toLocaleDateString()}
              </div>
            </div>
            <div style={{ fontSize: 13, color: token.inkSoft, marginBottom: 8 }}>{n.message}</div>
            {!n.is_read && (
              <button className="ins-btn" onClick={() => onMarkRead(n.notification_id)}
                style={{ background: 'none', border: `1px solid ${token.line}`, borderRadius: 5, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: token.inkSoft }}>
                Mark Read
              </button>
            )}
          </div>
        ))
      }
    </div>
  );
}