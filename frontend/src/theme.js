export const token = {
  paper:      '#F6F4EE',
  surface:    '#FFFFFF',
  surface2:   '#F1E6D2',
  surface3:   '#E7E2D5',
  line:       '#E7E2D5',
  border:     '#E7E2D5',
  border2:    '#D6CBBF',
  ink:        '#1C2541',
  inkSoft:    '#5B6478',
  inkFaint:   '#94A0B4',
  brass:      '#A9792C',
  brassSoft:  '#F1E6D2',
  brassDeep:  '#7C5A1E',
  danger:     '#B3261E',
  dangerSoft: '#FBEAE9',
  warn:       '#92400E',
  warnSoft:   '#FDF1DF',
  good:       '#1F7A4D',
  goodSoft:   '#E7F5EE',
  info:       '#2454A6',
  infoSoft:   '#EAF1FB',
  indigo:     '#4F46E5',
  indigoSoft: '#EEF2FF',
  accent:     '#A9792C',
  accent2:    '#2454A6',
  accent3:    '#1F7A4D',
  accent4:    '#92400E',
  accent5:    '#B3261E',
  radius:     14,
  radiusSm:   8,
};

export const theme = {
  bg:          token.paper,
  surface:     token.surface,
  surface2:    token.surface2,
  surface3:    token.surface3,
  border:      token.border,
  border2:     token.border2,
  text:        token.ink,
  textMuted:   token.inkSoft,
  textDim:     token.inkFaint,
  accent:      token.accent,
  accent2:     token.accent2,
  accent3:     token.accent3,
  accent4:     token.accent4,
  accent5:     token.accent5,
  radius:      token.radius,
  radiusSm:    token.radiusSm,
};

export const fontDisplay = "'Lora', Georgia, serif";
export const fontBody    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
export const fontMono    = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

export const courseTones = [
  {
    thumb:    'linear-gradient(135deg,#2454A6,#183E7F)',
    tagBg:    'rgba(36,84,166,0.12)',
    tagColor: token.accent,
    progress: 'linear-gradient(90deg,#2454A6,#A9792C)',
  },
  {
    thumb:    'linear-gradient(135deg,#1F7A4D,#16603C)',
    tagBg:    'rgba(31,122,77,0.12)',
    tagColor: token.accent3,
    progress: 'linear-gradient(90deg,#1F7A4D,#2454A6)',
  },
  {
    thumb:    'linear-gradient(135deg,#92400E,#7A320B)',
    tagBg:    'rgba(146,64,14,0.12)',
    tagColor: token.accent4,
    progress: 'linear-gradient(90deg,#92400E,#B3261E)',
  },
  {
    thumb:    'linear-gradient(135deg,#7C5A1E,#A9792C)',
    tagBg:    'rgba(169,121,44,0.12)',
    tagColor: token.accent2,
    progress: 'linear-gradient(90deg,#A9792C,#2454A6)',
  },
];

export const styles = {
  appShell: { display: 'flex', minHeight: '100vh', background: token.paper },

  sidebar: {
    width: 248,
    flexShrink: 0,
    background: token.ink,
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  },

  sidebarLogo: {
    padding: '0 20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 20,
  },

  navSection: { padding: '0 12px', marginBottom: 18 },

  navLabel: {
    fontFamily: fontMono,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    color: '#8893A8',
    padding: '0 8px 6px',
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13.5,
    marginBottom: 2,
  },

  navIcon: { display: 'inline-flex', alignItems: 'center', width: 18, justifyContent: 'center' },

  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },

  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    borderBottom: `1px solid ${token.line}`,
    background: token.surface,
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },

  pageTitle: {
    fontFamily: fontDisplay,
    fontSize: 24,
    fontWeight: 600,
    color: token.ink,
    margin: 0,
  },

  topbarRight: { display: 'flex', alignItems: 'center', gap: 14 },

  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    background: token.paper,
    border: `1px solid ${token.line}`,
    borderRadius: 10,
    width: 260,
  },

  searchInput: {
    border: 'none',
    outline: 'none',
    background: 'transparent',
    flex: 1,
    fontSize: 13.5,
    color: token.ink,
    fontFamily: fontBody,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: token.paper,
    border: `1px solid ${token.line}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    color: token.inkSoft,
  },

  content: {
    flex: 1,
    padding: 32,
    overflowY: 'auto',
    background: token.paper,
  },

  card: {
    background: token.surface,
    borderRadius: token.radius,
    border: `1px solid ${token.line}`,
    padding: 20,
  },

  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(28,37,65,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)', padding: 16,
  },

  modalBox: {
    background: token.surface,
    borderRadius: token.radius,
    padding: 28,
    width: '100%',
    maxWidth: 520,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(28,37,65,0.2)',
    border: `1px solid ${token.line}`,
  },

  modalCloseBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 20, color: token.inkFaint, padding: 4, lineHeight: 1,
  },

  statusPill: (kind) => ({
    background:
      kind === 'good'      ? token.goodSoft  :
      kind === 'warn'      ? token.warnSoft  :
      kind === 'danger'    ? token.dangerSoft :
      kind === 'info'      ? token.infoSoft  :
                             token.surface3,
    color:
      kind === 'good'      ? token.good  :
      kind === 'warn'      ? token.warn  :
      kind === 'danger'    ? token.danger :
      kind === 'info'      ? token.info  :
                             token.inkSoft,
    padding: '2px 10px',
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
  }),
};
