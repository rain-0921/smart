import { token } from '../../../theme';

export default function SectionLabel({ children, style = {} }) {
  return (
    <h4
      style={{
        marginTop: 0,
        marginBottom: 10,
        fontSize: 11.5,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: token.inkFaint,
        ...style,
      }}
    >
      {children}
    </h4>
  );
}
