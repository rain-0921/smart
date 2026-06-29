import { theme } from '../../../theme';
import { card, sectionTitle, emptyState, btnSmall, notifItem, notifItemUnread, notifDotSm, notifTitle, notifMsg, notifTime, notifBadge } from '../components/styles';

export default function StudentNotificationsSection({ notifications, unreadCount, onMarkRead, onMarkAllRead }) {
  return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div style={sectionTitle}>Notifications</div>
        {unreadCount > 0 && <span style={notifBadge}>{unreadCount} unread</span>}
        {unreadCount > 0 && (
          <button style={{ ...btnSmall, marginLeft: 'auto' }} onClick={onMarkAllRead}>
            Mark All as Read
          </button>
        )}
      </div>
      {notifications.length === 0
        ? <div style={emptyState}>No notifications yet.</div>
        : notifications.map(n => (
          <div key={n.notification_id} style={{ ...notifItem, ...(n.is_read ? {} : notifItemUnread) }}>
            <div style={{ ...notifDotSm, background: n.is_read ? theme.textDim : theme.accent5 }} />
            <div style={{ flex: 1 }}>
              <div style={notifTitle}>{n.title}</div>
              <div style={notifMsg}>{n.message}</div>
              <div style={notifTime}>{new Date(n.created_at).toLocaleDateString()}</div>
            </div>
            {!n.is_read &&
              <button style={btnSmall} onClick={() => onMarkRead(n.notification_id)}>
                Mark as Read
              </button>
            }
          </div>
        ))
      }
    </div>
  );
}
