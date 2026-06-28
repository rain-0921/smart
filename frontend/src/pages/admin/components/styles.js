import { token } from '../../../theme';

export const card       = { background: token.surface, borderRadius: 12, padding: 22, border: `1px solid ${token.line}` };
export const cardTitle  = { marginTop: 0, marginBottom: 16, fontSize: 15, fontFamily: '"Lora", serif', fontWeight: 600, color: token.ink };
export const table      = { width: '100%', borderCollapse: 'collapse', fontSize: 13.5, minWidth: 560 };
export const th         = { textAlign: 'left', padding: '9px 12px', background: token.paper, color: token.inkSoft, fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: `1px solid ${token.line}` };
export const td         = { padding: '10px 12px', borderBottom: `1px solid ${token.line}`, color: token.ink };
export const btnPrimary = { background: token.indigo, color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600 };
export const btnSmall   = { background: token.ink, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 11px', cursor: 'pointer', fontSize: 12, fontWeight: 600, marginRight: 6 };
export const formLabel  = { display: 'block', fontSize: 12.5, fontWeight: 600, color: token.inkSoft, marginBottom: 5 };
export const formInput  = { width: '100%', padding: '10px 12px', border: `1px solid ${token.line}`, borderRadius: 8, fontSize: 14, boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: token.ink };

export const roleBadge = (r) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { student: token.indigoSoft, instructor: '#F3E8FF', advisor: token.goodSoft, admin: token.brassSoft }[r] || token.line,
  color: { student: token.indigo, instructor: '#7C3AED', advisor: token.good, admin: token.brass }[r] || token.inkSoft,
});

export const statusBadge = (s) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { active: token.goodSoft, inactive: token.line, suspended: token.dangerSoft, draft: token.warnSoft, published: token.goodSoft, archived: token.line }[s] || token.line,
  color: { active: token.good, inactive: token.inkSoft, suspended: token.danger, draft: token.warn, published: token.good, archived: token.inkSoft }[s] || token.inkSoft,
});

export const typeBadge = (t) => ({
  display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
  background: { announcement: '#EEF2FF', deadline: '#FEF3C7', quiz_score: '#D1FAE5', admin_broadcast: token.brassSoft }[t] || token.line,
  color: { announcement: token.indigo, deadline: token.warn, quiz_score: token.good, admin_broadcast: token.brass }[t] || token.inkSoft,
});