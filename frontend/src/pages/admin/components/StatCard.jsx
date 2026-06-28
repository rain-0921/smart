import { token, fontMono } from '../../../theme';
import Icon from '../../../components/shared/Icon';

export default function StatCard({ label, value, accent = token.ink, icon }) {
  return (
    <div style={{
      background: token.surface, borderRadius: 10, padding: '16px 20px', minWidth: 150,
      borderTop: `1px solid ${token.line}`, borderRight: `1px solid ${token.line}`,
      borderBottom: `1px solid ${token.line}`, borderLeft: `4px solid ${accent}`, flex: '1 1 150px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: token.inkSoft }}>{label}</span>
        {icon && <Icon name={icon} size={15} color={accent} />}
      </div>
      <div style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 600, color: token.ink, marginTop: 6 }}>{value}</div>
    </div>
  );
}