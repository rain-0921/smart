import { token, fontMono } from '../../../theme';
import { Empty, Icon } from '../../../components/shared';
import { card, cardTitle, formLabel, formInput, table, th, td, roleBadge } from '../components/styles';

export default function AdminLogsSection({
  filterRoles, activityCategories,
  filterRole, filterCategory, filterStart, filterEnd,
  logViewMode, logs, logUsers,
  filterLoading,
  onChangeRole, onChangeCategory, onChangeStart, onChangeEnd,
  onApply, onReset, onExport, onOpenUserDetail,
}) {
  return (
    <div style={card} className="adm-card">
      <h3 style={cardTitle}><Icon name="clipboard" size={15} /> User Activity Logs</h3>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>Role</label>
          <select className="adm-input" style={{ ...formInput, width: 130 }} value={filterRole}
            onChange={e => onChangeRole(e.target.value)}>
            <option value="">All roles</option>
            {filterRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>Activity Type</label>
          <select className="adm-input" style={{ ...formInput, width: 160 }} value={filterCategory}
            onChange={e => onChangeCategory(e.target.value)}>
            <option value="">All types</option>
            {activityCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>From</label>
          <input className="adm-input" style={{ ...formInput, width: 145 }} type="date" value={filterStart}
            onChange={e => onChangeStart(e.target.value)} />
        </div>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>To</label>
          <input className="adm-input" style={{ ...formInput, width: 145 }} type="date" value={filterEnd}
            onChange={e => onChangeEnd(e.target.value)} />
        </div>
        <button className="adm-btn" style={{ background: token.indigo, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, height: 40 }} onClick={onApply}>Filter</button>
        {logViewMode === 'logs' && (
          <button className="adm-btn" style={{ background: token.warn, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, height: 40 }} onClick={onReset}>Reset</button>
        )}
        <button className="adm-btn" style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, height: 40 }} onClick={onExport}>Export CSV</button>
      </div>

      {logViewMode === 'user-list' && (
        filterLoading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
          : logUsers.length === 0
            ? <Empty>No activity records found.</Empty>
            : <div className="adm-table-wrap"><table style={table}>
                <thead><tr>{['User', 'Role', 'Last Activity', 'Description', 'Last Active'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{logUsers.map(u => (
                  <tr key={u.user_id} className="adm-table-row">
                    <td style={{ ...td, fontWeight: 600, color: token.ink, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => onOpenUserDetail(u.user_id)}>{u.username}</td>
                    <td style={td}><span style={roleBadge(u.role)}>{u.role}</span></td>
                    <td style={td}>{u.last_activity_type || '—'}</td>
                    <td style={td}>{u.last_description || '—'}</td>
                    <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{u.last_activity_at ? new Date(u.last_activity_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}</tbody>
              </table></div>
      )}

      {logViewMode === 'logs' && (
        filterLoading ? <p style={{ color: token.inkFaint, fontSize: 13.5, padding: '6px 0' }}>Loading…</p>
          : logs.length === 0
            ? <Empty>No records found for the selected filters.</Empty>
            : <div className="adm-table-wrap"><table style={table}>
                <thead><tr>{['User', 'Role', 'Activity', 'Description', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                <tbody>{logs.map(l => (
                  <tr key={l.activity_log_id} className="adm-table-row">
                    <td style={{ ...td, fontWeight: 600, color: token.ink, cursor: 'pointer', textDecoration: 'underline' }}
                      onClick={() => onOpenUserDetail(l.user_id)}>{l.username}</td>
                    <td style={td}><span style={roleBadge(l.role)}>{l.role}</span></td>
                    <td style={td}>{l.activity_type}</td>
                    <td style={td}>{l.description}</td>
                    <td style={{ ...td, fontFamily: fontMono, fontSize: 12 }}>{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}</tbody>
              </table></div>
      )}
    </div>
  );
}