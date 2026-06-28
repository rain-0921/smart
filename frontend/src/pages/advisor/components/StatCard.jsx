import { token, fontMono } from '../../../theme';
import { Card, Icon } from '../../../components/shared';

/** A simple "label on top, big mono number below" stat tile used by Advisor dashboard. */
export default function StatCard({ label, value, accent = token.ink, icon, style }) {
  return (
    <Card padding="16px 20px" style={{ minWidth: 150, flex: '1 1 150px', borderLeft: `4px solid ${accent}`, ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: token.inkSoft }}>
          {label}
        </span>
        {icon && <Icon name={icon} size={15} color={accent} />}
      </div>
      <div style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 600, color: token.ink, marginTop: 6 }}>
        {value}
      </div>
    </Card>
  );
}