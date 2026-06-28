import { token } from '../../theme';

export default function Card({ children, style = {}, padding = 20 }) {
  return (
    <div
      style={{
        background: token.surface,
        borderRadius: token.radius,
        border: `1px solid ${token.line}`,
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
}