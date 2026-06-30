import { token, fontDisplay, fontMono, styles } from '../../theme';
import { Icon } from '../shared';

export default function Sidebar({
  user,
  portalName = 'Portal',
  navGroups = [],
  activeKey,
  onNavigate,
  onLogout,
  onProfile,
  profilePhoto,
}) {
  return (
    <nav style={styles.sidebar}>
      <div className="sils-brand" style={styles.sidebarLogo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: `1.5px solid ${token.brass}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fontDisplay,
              fontStyle: 'italic',
              fontWeight: 600,
              color: token.brass,
              fontSize: 14,
            }}
          >
            SL
          </div>
          <div>
            <div
              style={{
                fontFamily: fontDisplay,
                fontSize: 16,
                fontWeight: 600,
                color: '#fff',
                letterSpacing: '0.04em',
              }}
            >
              SILS
            </div>
            <span style={{ fontFamily: fontMono, fontSize: 10, color: '#8893A8', letterSpacing: '0.1em' }}>
              {portalName}
            </span>
          </div>
        </div>
      </div>

      {navGroups.map((group, gi) => (
        <div key={gi} style={styles.navSection}>
          {group.label && <div style={styles.navLabel}>{group.label}</div>}
          {group.items.map((item) => {
            const active = item.key === activeKey;
            return (
              <div
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`sils-nav-item${active ? ' active' : ''}`}
                style={{
                  ...styles.navItem,
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? '#fff' : '#B7BFCF',
                }}
              >
                <span style={styles.navIcon}>
                  <Icon name={item.icon} size={16} />
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge > 0 && (
                  <span
                    style={{
                      background: token.brass,
                      color: '#1C2541',
                      fontSize: 11,
                      fontWeight: 700,
                      borderRadius: 99,
                      padding: '1px 7px',
                      fontFamily: fontMono,
                    }}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div className="sils-spacer" style={{ flex: 1 }} />

      <div style={{ padding: '0 12px' }}>
        <div
          onClick={onProfile}
          className="sils-nav-item"
          style={{ ...styles.navItem, color: '#B7BFCF' }}
        >
          <img
            src={profilePhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'U')}`}
            alt={user?.username}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.username}
            </div>
            <div style={{ fontSize: 11, color: '#8893A8' }}>View profile</div>
          </div>
        </div>
        <div
          onClick={onLogout}
          className="sils-nav-item sils-foot"
          style={{ ...styles.navItem, color: '#E2A6A1' }}
        >
          <Icon name="logout" size={16} /> Log out
        </div>
      </div>
    </nav>
  );
}
