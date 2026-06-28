import { token } from '../../theme';

export default function Spinner({ label = 'Loading…', size = 28 }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        gap: 12,
        color: token.inkSoft,
        fontSize: 13,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `3px solid ${token.line}`,
          borderTopColor: token.brass,
          animation: 'sils-spin 0.9s linear infinite',
        }}
      />
      {label}
      <style>{`@keyframes sils-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}