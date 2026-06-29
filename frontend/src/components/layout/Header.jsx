import { token, fontMono, fontDisplay, styles } from '../../theme';
import { Icon, Avatar } from '../shared';

export default function Header({
  eyebrow,
  title,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search…',
  onNotifications,
  notificationsBadge = false,
  onProfile,
  user,
  userPhoto,
  rightActions,
}) {
  return (
    <header style={styles.topbar}>
      <div>
        {eyebrow && (
          <div
            style={{
              fontFamily: fontMono,
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: token.brassDeep,
              marginBottom: 4,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1 style={{ ...styles.pageTitle, fontFamily: fontDisplay }}>{title}</h1>
      </div>

      <div style={styles.topbarRight}>
        {rightActions}
        {showSearch && (
          <div style={styles.searchBox}>
            <Icon name="search" size={16} color={token.inkFaint} />
            <input
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        )}
        {onNotifications && (
          <button style={styles.iconBtn} onClick={onNotifications} aria-label="Notifications">
            <Icon name="notifications" size={17} />
            {notificationsBadge && (
              <span
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: token.danger,
                }}
              />
            )}
          </button>
        )}
        {onProfile && (
          <button
            style={{ ...styles.iconBtn, border: 'none', background: 'none', cursor: 'pointer' }}
            onClick={onProfile}
            aria-label="Profile"
          >
            <Avatar name={user?.username} src={userPhoto} size={32} />
          </button>
        )}
      </div>
    </header>
  );
}
