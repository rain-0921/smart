import { token } from '../../theme';

export default function Empty({ children }) {
  return (
    <div
      style={{
        padding: '32px 16px',
        textAlign: 'center',
        color: token.inkFaint,
        fontSize: 13,
      }}
    >
      {children}
    </div>
  );
}