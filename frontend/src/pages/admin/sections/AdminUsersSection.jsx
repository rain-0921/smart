import { token } from '../../../theme';
import { Empty } from '../../../components/shared';
import { card, cardTitle, table, th, td, btnPrimary, btnSmall, roleBadge, statusBadge } from '../components/styles';

export default function AdminUsersSection({ users, loading, onAdd, onEdit, onDeactivate }) {
  return (
    <div style={card} className="adm-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
        <h3 style={{ ...cardTitle, margin: 0 }}>All Users</h3>
        <button className="adm-btn" style={btnPrimary} onClick={onAdd}>+ Add User</button>
      </div>
      {loading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
        : users.length === 0
          ? <Empty>No users registered yet.</Empty>
          : <div className="adm-table-wrap"><table style={table}>
              <thead><tr>{['Username', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
              <tbody>{users.map(u => (
                <tr key={u.user_id} className="adm-table-row">
                  <td style={{ ...td, fontWeight: 600, color: token.ink }}>{u.username}</td>
                  <td style={td}>{u.email}</td>
                  <td style={td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                  <td style={td}>{u.department || '—'}</td>
                  <td style={td}><span style={statusBadge(u.status)}>{u.status}</span></td>
                  <td style={td}>
                    <button className="adm-row-btn" style={btnSmall} onClick={() => onEdit(u)}>Edit</button>
                    {u.status === 'active' &&
                      <button className="adm-row-btn" style={{ ...btnSmall, background: token.danger, color: '#fff' }} onClick={() => onDeactivate(u.user_id)}>Deactivate</button>
                    }
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
      }
    </div>
  );
}