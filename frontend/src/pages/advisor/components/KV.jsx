import { token } from '../../../theme';

export default function KV({ label, value, last = false }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: last ? 'none' : `1px solid ${token.line}`,
        fontSize: 13.5,
      }}
    >
      <span style={{ color: token.inkSoft }}>{label}</span>
      <span style={{ fontWeight: 600, color: token.ink }}>{value}</span>
    </div>
  );
}
