import { token, fontMono } from '../../../theme';

export function avgColor(avgScore) {
  const v = parseFloat(avgScore || 0);
  return v >= 70 ? token.good : v >= 50 ? token.warn : token.danger;
}

export function scoreColor(score) {
  const v = parseFloat(score || 0);
  return v >= 70 ? token.good : v >= 50 ? token.warn : token.danger;
}

export function avgText(avgScore) {
  if (avgScore == null) return '—';
  return `${parseFloat(avgScore).toFixed(2)}%`;
}

export function pctText(p, decimals = 1) {
  if (p == null) return '—';
  return `${parseFloat(p).toFixed(decimals)}%`;
}

const STATUS_MAP = {
  active:      { bg: token.goodSoft,    fg: token.good },
  inactive:    { bg: token.line,        fg: token.inkSoft },
  suspended:   { bg: token.dangerSoft,  fg: token.danger },
  dropped:     { bg: token.dangerSoft,  fg: token.danger },
  completed:   { bg: token.infoSoft,    fg: token.info },
  graded:      { bg: token.goodSoft,    fg: token.good },
  submitted:   { bg: token.warnSoft,    fg: token.warn },
  in_progress: { bg: token.infoSoft,    fg: token.info },
  pending:     { bg: token.warnSoft,    fg: token.warn },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { bg: token.line, fg: token.inkSoft };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 99,
        fontSize: 11.5,
        fontWeight: 600,
        background: s.bg,
        color: s.fg,
      }}
    >
      {status}
    </span>
  );
}

export const gpaColor = avgColor;
export const gpaText = avgText;

export function StatusPill({ status, mono = false }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 11.5,
      fontWeight: 600,
      fontFamily: mono ? fontMono : undefined,
    }}>
      {status}
    </span>
  );
}