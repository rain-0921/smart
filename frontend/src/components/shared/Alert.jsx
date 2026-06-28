import { token } from '../../theme';
import Icon from './Icon';

export default function Alert({ msg, type = 'success' }) {
  if (!msg) return null;
  const ok = type !== 'error';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 14px',
        borderRadius: 8,
        marginBottom: 16,
        fontSize: 13.5,
        background: ok ? token.goodSoft : token.dangerSoft,
        color: ok ? token.good : token.danger,
        border: `1px solid ${ok ? token.good : token.danger}22`,
      }}
    >
      <Icon name={ok ? 'check' : 'x'} size={16} />
      {msg}
    </div>
  );
}