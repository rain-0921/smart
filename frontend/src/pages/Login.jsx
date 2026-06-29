import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const token = {
  paper:      '#F6F4EE',
  surface:    '#FFFFFF',
  line:       '#E7E2D5',
  ink:        '#1C2541',
  inkSoft:    '#5B6478',
  inkFaint:   '#94A0B4',
  brass:      '#A9792C',
  brassSoft:  '#F1E6D2',
  brassDeep:  '#7C5A1E',
  danger:     '#B3261E',
  dangerSoft: '#FBEAE9',
  good:       '#1F7A4D',
  goodSoft:   '#E7F5EE',
  indigo:     '#4F46E5',
  indigoSoft: '#EEF2FF',
};

const fontDisplay = "'Lora', Georgia, serif";
const fontBody    = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const fontMono    = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

      .login-root * { box-sizing: border-box; }
      .login-root { font-family: ${fontBody}; }

      .login-input:focus {
        border-color: ${token.brass};
        box-shadow: 0 0 0 3px ${token.brass}22;
        outline: none;
      }

      .login-btn {
        transition: filter .15s ease, transform .1s ease, box-shadow .15s ease;
      }
      .login-btn:hover:not(:disabled) {
        filter: brightness(1.05);
        box-shadow: 0 4px 16px ${token.brass}40;
      }
      .login-btn:active:not(:disabled) { transform: translateY(1px); }
      .login-btn:focus-visible { outline: 2px solid ${token.brass}; outline-offset: 2px; }
      .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

      .login-card {
        animation: login-rise .3s ease both;
      }
      @keyframes login-rise {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }

      .login-bg-orb {
        animation: orb-drift 8s ease-in-out infinite alternate;
      }
      @keyframes orb-drift {
        from { transform: translate(0, 0) scale(1); }
        to   { transform: translate(24px, -18px) scale(1.06); }
      }
    `}</style>
  );
}

function Icon({ name, size = 18, color = 'currentColor' }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'mail':    return <svg {...c}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case 'lock':    return <svg {...c}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case 'eye':     return <svg {...c}><path d="M2 12s3.6-7 10 7 10-7 10-7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'eye-off': return <svg {...c}><path d="M17.9 17.4A10 10 0 0 1 2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7a10 10 0 0 1-5.1-1.4"/><path d="M2 2l20 20"/><path d="M12 12a2 2 0 0 0 1.6-.4"/></svg>;
    default: return null;
  }
}

function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
      login(res.data.user, res.data.token);

      const role = res.data.user.role;
      if (role === 'student')    navigate('/student');
      if (role === 'instructor') navigate('/instructor');
      if (role === 'admin')      navigate('/admin');
      if (role === 'advisor')    navigate('/advisor');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root" style={styles.root}>
      <GlobalStyle />

      <div className="login-bg-orb" style={{ ...styles.orb, top: '-10%', left: '-8%', width: 480, height: 480, background: `${token.brassSoft}` }} />
      <div className="login-bg-orb" style={{ ...styles.orb, bottom: '-15%', right: '-10%', width: 560, height: 560, background: `${token.indigoSoft}`, animationDelay: '-4s' }} />

      <div className="login-card" style={styles.card}>
        <div style={styles.brandWrap}>
          <div style={styles.brandIcon}>
            <span style={{ fontFamily: fontDisplay, fontStyle: 'italic', fontWeight: 600, color: token.brass, fontSize: 18 }}>S</span>
          </div>
          <div>
            <div style={{ fontFamily: fontDisplay, fontWeight: 600, color: token.ink, fontSize: 18, lineHeight: 1.1 }}>SILS</div>
            <div style={{ fontFamily: fontMono, fontSize: 10, letterSpacing: '0.12em', color: token.inkFaint, textTransform: 'uppercase' }}>Smart Interactive Learning</div>
          </div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.subtitle}>Welcome back</h2>
        <p style={styles.hint}>Sign in to continue to your dashboard</p>

        {error && (
          <div style={styles.errorBox}>
            <Icon name="lock" size={15} color={token.danger} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.field}>
            <label style={styles.label}>
              <Icon name="mail" size={13} color={token.inkSoft} />
              {' '}Email address
            </label>
            <input
              className="login-input"
              style={styles.input}
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <Icon name="lock" size={13} color={token.inkSoft} />
              {' '}Password
            </label>
            <div style={styles.passWrap}>
              <input
                className="login-input"
                style={{ ...styles.input, paddingRight: 44 }}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.passToggle}
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPass ? 'eye-off' : 'eye'} size={16} color={token.inkFaint} />
              </button>
            </div>
          </div>

          <button className="login-btn" style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={styles.spinner} />
                Signing in…
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          <span style={{ color: token.inkFaint }}>Secure academic portal · </span>
          <span style={{ color: token.inkSoft, fontSize: 12 }}>SILS v1.0</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: token.paper,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.45,
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: token.surface,
    borderRadius: 18,
    border: `1px solid ${token.line}`,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 420,
    boxShadow: `0 8px 40px rgba(28,37,65,0.10), 0 2px 8px rgba(28,37,65,0.06)`,
  },
  brandWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: `1.5px solid ${token.brass}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: token.brassSoft,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: `linear-gradient(to right, transparent, ${token.line}, transparent)`,
    marginBottom: 24,
  },
  subtitle: {
    margin: '0 0 6px',
    fontFamily: fontDisplay,
    fontWeight: 600,
    fontSize: 26,
    color: token.ink,
    textAlign: 'center',
  },
  hint: {
    margin: '0 0 24px',
    fontSize: 13.5,
    color: token.inkFaint,
    textAlign: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    padding: '10px 14px',
    borderRadius: 10,
    marginBottom: 18,
    fontSize: 13.5,
    fontWeight: 500,
    background: token.dangerSoft,
    color: token.danger,
    border: `1px solid ${token.danger}22`,
  },
  field: {
    marginBottom: 18,
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginBottom: 7,
    fontSize: 12.5,
    fontWeight: 600,
    color: token.inkSoft,
    letterSpacing: '0.01em',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    border: `1.5px solid ${token.line}`,
    fontSize: 14,
    fontFamily: fontBody,
    color: token.ink,
    background: token.surface,
    boxSizing: 'border-box',
    transition: 'border-color .15s ease, box-shadow .15s ease',
  },
  passWrap: {
    position: 'relative',
  },
  passToggle: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 2,
    lineHeight: 0,
  },
  submitBtn: {
    width: '100%',
    padding: '13px',
    background: `linear-gradient(135deg, ${token.brass}, ${token.brassDeep})`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    fontFamily: fontBody,
    cursor: 'pointer',
    marginTop: 8,
    boxShadow: `0 2px 12px ${token.brass}30`,
  },
  spinner: {
    display: 'inline-block',
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    marginTop: 22,
    textAlign: 'center',
    fontSize: 12,
    color: token.inkFaint,
    fontFamily: fontMono,
  },
};

export default Login;
