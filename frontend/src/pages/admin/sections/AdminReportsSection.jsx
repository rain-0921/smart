import { token, fontMono } from '../../../theme';
import { Empty, Icon } from '../../../components/shared';
import { card, cardTitle, table, th, td, formLabel, formInput, roleBadge, statusBadge } from '../components/styles';

export default function AdminReportsSection({
  reportTypes, selectedReportType, reportStart, reportEnd,
  reports, reportLoading,
  onChangeType, onChangeStart, onChangeEnd, onRun, onExport,
}) {
  return (
    <div style={card} className="adm-card">
      <h3 style={cardTitle}><Icon name="doc" size={15} /> Platform Reports</h3>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18, alignItems: 'flex-end' }}>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>Report Type</label>
          <select className="adm-input" style={{ ...formInput, width: 200 }} value={selectedReportType}
            onChange={e => onChangeType(e.target.value)}>
            {reportTypes.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>From</label>
          <input className="adm-input" style={{ ...formInput, width: 145 }} type="date" value={reportStart}
            onChange={e => onChangeStart(e.target.value)} />
        </div>
        <div>
          <label style={{ ...formLabel, marginBottom: 3 }}>To</label>
          <input className="adm-input" style={{ ...formInput, width: 145 }} type="date" value={reportEnd}
            onChange={e => onChangeEnd(e.target.value)} />
        </div>
        <button className="adm-btn" style={{ background: token.indigo, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, height: 40 }} onClick={onRun} disabled={reportLoading}>
          {reportLoading ? 'Loading…' : 'Generate Report'}
        </button>
        {reports && !reports.isEmpty && (
          <button className="adm-btn" style={{ background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, height: 40 }} onClick={onExport}>
            Export CSV
          </button>
        )}
      </div>

      {!reports ? (
        <Empty>Select a report type and click "Generate Report" to view data.</Empty>
      ) : reports.isEmpty ? (
        <Empty>No data available for this report in the selected period.</Empty>
      ) : (
        <div>
          {reports.summary && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
              {Object.entries(reports.summary).map(([k, v]) => {
                if (typeof v === 'object') return null;
                return (
                  <div key={k} style={{ background: token.paper, border: `1px solid ${token.line}`, borderRadius: 8, padding: '12px 16px', minWidth: 110, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: token.inkSoft, marginBottom: 4 }}>{k.replace(/_/g, ' ')}</div>
                    <div style={{ fontFamily: fontMono, fontSize: 22, fontWeight: 600, color: token.ink }}>{String(v)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {reports.summary?.byStatus && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: token.inkSoft, marginBottom: 8 }}>Status Breakdown</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(reports.summary.byStatus).map(([s, cnt]) => (
                  <span key={s} style={{ ...statusBadge(s), padding: '4px 14px', fontSize: 13 }}>{s}: {cnt}</span>
                ))}
              </div>
            </div>
          )}

          {reports.summary?.byRole && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: token.inkSoft, marginBottom: 8 }}>By Role</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(reports.summary.byRole).map(([r, cnt]) => (
                  <span key={r} style={{ ...roleBadge(r), padding: '4px 14px', fontSize: 13 }}>{r}: {cnt}</span>
                ))}
              </div>
            </div>
          )}

          {reports.data && reports.data.length > 0 && (
            <div className="adm-table-wrap">
              <table style={table}>
                <thead>
                  <tr>{Object.keys(reports.data[0]).filter(k => k !== 'course_id').map(h => (
                    <th key={h} style={th}>{h.replace(/_/g, ' ')}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {reports.data.map((row, i) => (
                    <tr key={i} className="adm-table-row">
                      {Object.entries(row).filter(([k]) => k !== 'course_id').map(([k, v]) => (
                        <td key={k} style={{ ...td, fontFamily: k === 'enrolled_at' || k === 'created_at' ? fontMono : undefined, fontSize: k === 'enrolled_at' || k === 'created_at' ? 12 : 13.5 }}>
                          {k === 'enrolled_at' || k === 'created_at'
                            ? (v ? new Date(v).toLocaleDateString() : '—')
                            : (v ?? '—')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}