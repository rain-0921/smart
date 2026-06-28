import { token } from '../../../theme';

export const cardBase     = { background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '22px 24px' };
export const hSection     = { margin: 0, fontFamily: '"Lora", serif', fontSize: 18, color: token.ink };
export const hSub         = { margin: 0, fontFamily: '"Lora", serif', fontSize: 16, color: token.ink };
export const inputStyle   = { width: '100%', background: token.surface2, border: `1px solid ${token.line}`, borderRadius: 8, padding: '10px 14px', color: token.ink, fontSize: 13, fontFamily: '"Inter", sans-serif', outline: 'none', boxSizing: 'border-box' };
export const inputNum     = { ...inputStyle, fontFamily: '"IBM Plex Mono", monospace' };
export const inputDate    = { padding: '6px 10px', fontSize: 12, border: `1px solid ${token.line}`, borderRadius: 6, background: token.surface2, color: token.ink, fontFamily: '"IBM Plex Mono", monospace' };
export const label        = { display: 'block', fontSize: 12, fontWeight: 600, color: token.inkSoft, marginBottom: 6 };
export const btnPrimary   = { background: token.brass, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: '"Inter", sans-serif', width: '100%' };
export const btnRow       = { background: token.brass, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600 };
export const btnGhost     = { background: token.surface2, color: token.ink, border: `1px solid ${token.line}`, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 };
export const btnDanger    = { background: token.dangerSoft, color: token.danger, border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 };
export const btnIcon      = { background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: token.danger, padding: '2px 4px' };

export const table        = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
export const th           = { textAlign: 'left', padding: '8px 12px', color: token.inkFaint, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8, borderBottom: `2px solid ${token.line}`, fontFamily: '"Inter", sans-serif' };
export const td           = { padding: '10px 12px', borderTop: `1px solid ${token.line}`, color: token.ink };
export const tdMuted      = { ...td, color: token.inkSoft };

export const downIcon =
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4v11" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" />
  </svg>;

export function StatusBadge({ status }) {
  const map = {
    draft:       { bg: token.warnSoft,   color: token.warn },
    published:   { bg: token.goodSoft,    color: token.good },
    archived:    { bg: token.surface3,    color: token.inkSoft },
    graded:      { bg: token.goodSoft,    color: token.good },
    submitted:   { bg: token.warnSoft,    color: token.warn },
    in_progress: { bg: token.infoSoft,    color: token.info },
    expired:     { bg: token.dangerSoft, color: token.danger },
  };
  const s = map[status] || { bg: token.surface3, color: token.inkSoft };
  return (
    <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

export function InsStatCard({ label: lbl, value, mono, sub }) {
  return (
    <div className="sils-card" style={{ background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: '20px 24px' }}>
      <div style={{ fontSize: 11, color: token.inkFaint, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        {lbl}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, color: token.brass, fontFamily: mono ? '"IBM Plex Mono", monospace' : '"Lora", serif', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {sub && <div style={{ fontSize: 11, color: token.inkSoft, marginTop: 6, fontFamily: '"IBM Plex Mono", monospace' }}>{sub}</div>}
    </div>
  );
}