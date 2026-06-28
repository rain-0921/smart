import { token } from '../../../theme';
import { Icon } from '../../../components/shared';

export default function RiskPill({ atRisk }) {
  return atRisk ? (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: token.danger, fontWeight: 700, fontSize: 12.5 }}>
      <Icon name="warn" size={13} /> At risk
    </span>
  ) : (
    <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center', color: token.good, fontSize: 12.5 }}>
      <Icon name="check" size={13} /> On track
    </span>
  );
}