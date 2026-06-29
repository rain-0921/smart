import { useEffect } from 'react';
import { token, fontDisplay, styles } from '../../theme';
import Icon from './Icon';

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={styles.modalOverlay}>
      <div
        style={{ ...styles.modalBox, maxWidth: wide ? 860 : 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: fontDisplay,
              fontWeight: 600,
              color: token.ink,
              fontSize: 20,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={styles.modalCloseBtn}
            aria-label="Close"
          >
            <Icon name="x" size={16} color={token.inkSoft} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}