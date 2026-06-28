import { token } from '../../../theme';

export default function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13.5,
          minWidth: 560,
        }}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '9px 12px',
                  background: token.paper,
                  color: token.inkSoft,
                  fontWeight: 600,
                  fontSize: 11.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: `1px solid ${token.line}`,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="sils-table-row">
              {r.map((c, ci) => (
                <td
                  key={ci}
                  style={{
                    padding: '10px 12px',
                    borderBottom: `1px solid ${token.line}`,
                    color: token.ink,
                  }}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
