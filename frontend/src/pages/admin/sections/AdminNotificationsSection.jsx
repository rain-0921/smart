import { token, fontMono } from '../../../theme';
import { Empty } from '../../../components/shared';
import { card, cardTitle, table, th, td, btnPrimary, btnSmall, typeBadge, roleBadge, statusBadge } from '../components/styles';

export default function AdminNotificationsSection({ notifications, loading, onAdd, onEdit, onDelete }) {
  return (
    <div style={card} className="adm-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ ...cardTitle, margin: 0 }}>System Notifications</h3>
        <button className="adm-btn" style={btnPrimary} onClick={onAdd}>+ Create Notification</button>
      </div>
      {loading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
        : notifications.length === 0
          ? <Empty>No notifications found.</Empty>
          : <div className="adm-table-wrap"><table style={table}>
              <thead><tr>{['Title', 'Type', 'Message', 'Target', 'Delivery', 'Created', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{notifications.map(n => (
                <tr key={n.notification_id} className="adm-table-row">
                  <td style={{ ...td, fontWeight: 600, color: token.ink }}>{n.title}</td>
                  <td style={td}><span style={typeBadge(n.type)}>{n.type}</span></td>
                  <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                  <td style={td}>
                    {n.recipient_name
                      ? <span style={roleBadge('student')}>{n.recipient_name}</span>
                      : n.target_role
                        ? <span style={roleBadge(n.target_role)}>{n.target_role}</span>
                        : <span style={{ color: token.inkFaint, fontSize: 12 }}>All users</span>
                    }
                  </td>
                  <td style={td}>
                    <span style={statusBadge(n.delivery_status === 'sent' ? 'active' : n.delivery_status === 'scheduled' ? 'draft' : 'inactive')}>
                      {n.delivery_status}
                    </span>
                    {n.scheduled_at && <span style={{ display:'block', fontSize:11, color: token.inkFaint, marginTop:2 }}>
                      {new Date(n.scheduled_at).toLocaleString()}
                    </span>}
                  </td>
                  <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(n.created_at).toLocaleDateString()}</td>
                  <td style={td}>
                    {(n.delivery_status === 'draft') && !n.recipient_name && (
                      <button className="adm-row-btn" style={btnSmall} onClick={() => onEdit(n)}>Edit</button>
                    )}
                    <button className="adm-row-btn" style={{ ...btnSmall, background: token.danger, color: '#fff' }} onClick={() => onDelete(n.notification_id)}>Delete</button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
      }
    </div>
  );
}