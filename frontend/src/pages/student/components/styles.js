import { token, theme, fontDisplay } from '../../../theme';

export const card         = { background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 22 };
export const cardHeader   = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 };
export const cardTitle    = { fontFamily: fontDisplay, fontSize: 16, color: token.ink };
export const sectionTitle = { fontSize: 12, fontWeight: 600, letterSpacing: 1.2, textTransform: 'uppercase', color: theme.textMuted, marginBottom: 14 };

export const table        = { width: '100%', borderCollapse: 'collapse', fontSize: 13 };
export const th           = { textAlign: 'left', padding: '10px 12px', color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: 11 };
export const td           = { padding: '10px 12px', borderTop: `1px solid ${theme.border}`, color: theme.text };

export const gridTwoOne   = { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 };
export const courseGrid   = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 };
export const courseGridWide = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 };
export const lessonsGrid  = { display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.2fr)', gap: 20 };

export const courseCard   = { background: token.surface, border: `1px solid ${token.line}`, borderRadius: token.radius, padding: 18, cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' };
export const courseThumb  = { height: 90, borderRadius: token.radiusSm, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 };
export const courseTag    = { fontSize: 10, fontWeight: 600, letterSpacing: 0.8, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8 };
export const courseTitle  = { fontSize: 14, fontWeight: 600, color: token.ink, marginBottom: 6, lineHeight: 1.4 };
export const courseMeta   = { fontSize: 12, color: token.inkSoft, marginBottom: 12 };
export const courseDesc   = { fontSize: 13, color: token.inkSoft, marginBottom: 14, minHeight: 40 };

export const progressBar  = { background: token.surface3, borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 6 };
export const progressFill = { height: '100%', borderRadius: 4, transition: 'width 1s ease' };
export const progressLabel= { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: token.inkSoft };

export const quizItem     = { display: 'flex', alignItems: 'center', gap: 14, padding: 12, borderRadius: token.radiusSm, background: token.surface2, border: `1px solid ${token.line}`, marginBottom: 8 };
export const quizIcon     = { width: 38, height: 38, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 };
export const quizInfo     = { flex: 1, minWidth: 0 };
export const quizName     = { fontSize: 13, fontWeight: 500, color: token.ink, marginBottom: 2 };
export const quizMeta     = { fontSize: 11, color: token.inkSoft };
export const quizStatus   = { fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, whiteSpace: 'nowrap' };

export const notifItem    = { display: 'flex', gap: 12, padding: 12, borderRadius: token.radiusSm, marginBottom: 6, transition: 'background 0.15s', cursor: 'pointer', borderLeft: '3px solid transparent' };
export const notifItemUnread = { borderLeftColor: theme.accent, background: 'rgba(108,143,255,0.04)' };
export const notifDotSm   = { width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5 };
export const notifTitle   = { fontSize: 13, fontWeight: 500, color: theme.text, marginBottom: 2 };
export const notifMsg     = { fontSize: 12, color: theme.textMuted, lineHeight: 1.4 };
export const notifTime    = { fontSize: 11, color: theme.textDim, marginTop: 3 };
export const notifBadge   = { background: theme.accent5, color: '#fff', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 };

export const lessonRow    = { display: 'flex', gap: 12, padding: '10px 0', borderBottom: `1px solid ${theme.border}`, alignItems: 'flex-start' };
export const link         = { fontSize: 13, color: theme.accent, display: 'inline-block', marginTop: 4, textDecoration: 'none' };
export const quizQuestion = { marginBottom: 20, padding: 16, background: theme.surface2, borderRadius: theme.radiusSm, border: `1px solid ${theme.border}` };
export const radioLabel   = { display: 'block', marginBottom: 6, cursor: 'pointer', color: theme.text };
export const gradeRow     = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${theme.border}` };
export const gradeTitle   = { fontWeight: 600, fontSize: 13, color: theme.text };
export const gradeBadge   = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 26, borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: '"DM Serif Display", serif' };

export const btnPrimary   = { background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})`, color: '#fff', border: 'none', borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
export const btnGhost     = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.textMuted, borderRadius: theme.radiusSm, padding: '10px 18px', cursor: 'pointer', fontSize: 13, fontWeight: 500 };
export const btnSmall     = { background: theme.surface2, border: `1px solid ${theme.border}`, color: theme.text, borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 500 };

export const formLabel    = { display: 'block', fontSize: 12, fontWeight: 600, color: theme.textMuted, marginBottom: 6, letterSpacing: 0.5 };
export const formInput    = { width: '100%', background: theme.surface2, border: `1px solid ${theme.border}`, borderRadius: theme.radiusSm, padding: '10px 14px', color: theme.text, fontFamily: '"DM Sans", sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

export const emptyState       = { textAlign: 'center', padding: '36px 20px', color: theme.textMuted };
export const emptyStateSmall  = { textAlign: 'left', padding: '12px 4px', color: theme.textDim, fontSize: 12 };
export const statCard         = { background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: theme.radius, padding: 20, position: 'relative', overflow: 'hidden' };

export const greetingTitle = { fontFamily: '"DM Serif Display", serif', fontSize: 26, color: theme.text, letterSpacing: -0.5, marginBottom: 4 };
export const greetingSub   = { fontSize: 14, color: theme.textMuted };

export const statusPill = (type) => ({
  due:  { background: 'rgba(249,115,22,0.12)', color: theme.accent4 },
  open: { background: 'rgba(52,211,153,0.12)', color: theme.accent3 },
  done: { background: 'rgba(108,143,255,0.12)', color: theme.accent },
}[type] || { background: theme.surface2, color: theme.textMuted });

export const gradeBadgeTone = (g) => {
  if (g.status !== 'graded') return { background: theme.surface2, color: theme.textMuted };
  if (g.score >= 70) return { background: 'rgba(52,211,153,0.12)', color: theme.accent3 };
  if (g.score >= 50) return { background: 'rgba(249,115,22,0.12)', color: theme.accent4 };
  return { background: 'rgba(251,113,133,0.12)', color: theme.accent5 };
};

export const statusBadge = (s) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 99,
  fontSize: 11,
  fontWeight: 600,
  background: { not_started: theme.surface2, in_progress: 'rgba(249,115,22,0.12)', completed: 'rgba(52,211,153,0.12)' }[s] || theme.surface2,
  color: { not_started: theme.textMuted, in_progress: theme.accent4, completed: theme.accent3 }[s] || theme.textMuted
});

export function StudentStatCard({ label, value, icon, tone, trend }) {
  const accentColor = {
    blue:   token.info,
    green:  token.good,
    purple: token.brass,
    orange: token.warn,
  }[tone] || token.ink;

  return (
    <div style={{
      background: token.surface, borderRadius: 10, padding: '16px 20px',
      border: `1px solid ${token.line}`, borderLeft: `4px solid ${accentColor}`, flex: '1 1 180px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: token.inkSoft }}>{label}</span>
        {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
      </div>
      <div style={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: 28, fontWeight: 600, color: token.ink, marginTop: 6, lineHeight: 1.1 }}>{value}</div>
      {trend && (
        <div style={{ fontSize: 11, fontWeight: 500, marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 4, color: trend.type === 'down' ? token.danger : token.good }}>
          {trend.type === 'down' ? '⚠' : '↑'} {trend.text}
        </div>
      )}
    </div>
  );
}