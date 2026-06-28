import { token, fontBody } from '../../theme';

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  style = {},
}) {
  const variants = {
    primary: {
      background: token.brass,
      color: '#fff',
      border: `1px solid ${token.brass}`,
    },
    secondary: {
      background: token.surface,
      color: token.ink,
      border: `1px solid ${token.line}`,
    },
    ghost: {
      background: 'transparent',
      color: token.inkSoft,
      border: '1px solid transparent',
    },
    danger: {
      background: token.danger,
      color: '#fff',
      border: `1px solid ${token.danger}`,
    },
    success: {
      background: token.good,
      color: '#fff',
      border: `1px solid ${token.good}`,
    },
  };

  const sizes = {
    sm: { padding: '6px 12px', fontSize: 12, borderRadius: 8 },
    md: { padding: '9px 16px', fontSize: 13.5, borderRadius: 10 },
    lg: { padding: '12px 22px', fontSize: 14.5, borderRadius: 12 },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        fontFamily: fontBody,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'filter .15s ease, transform .1s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
    >
      {children}
    </button>
  );
}