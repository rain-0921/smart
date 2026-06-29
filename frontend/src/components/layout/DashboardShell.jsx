import { token, styles } from '../../theme';

export default function DashboardShell({
  sidebar,
  header,
  children,
}) {
  return (
    <div className="sils-root" style={styles.appShell}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        .sils-root * { box-sizing: border-box; }
        .sils-root { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: ${token.ink}; background: ${token.paper}; }

        .sils-nav-item { transition: background-color .15s ease, color .15s ease; position: relative; cursor: pointer; }
        .sils-nav-item:hover { background: rgba(36,84,166,0.08); color: #fff; }
        .sils-nav-item.active::before {
          content: ''; position: absolute; left: -16px; top: 8px; bottom: 8px; width: 3px;
          background: ${token.brass}; border-radius: 2px;
        }

        .sils-card { animation: sils-rise .22s ease both; }
        @keyframes sils-rise { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        .sils-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
        .sils-scroll::-webkit-scrollbar-thumb { background: ${token.line}; border-radius: 8px; }

        @media (prefers-reduced-motion: reduce) {
          .sils-card { animation: none; }
        }

        @media (max-width: 860px) {
          .sils-root { flex-direction: column !important; }
          nav[class] { width: 100% !important; flex-direction: row !important; overflow-x: auto; padding: 12px !important; position: sticky; top: 0; z-index: 50; height: auto !important; }
          nav .sils-brand, nav .sils-spacer, nav .sils-foot { display: none !important; }
          .sils-nav-item { white-space: nowrap; }
          .sils-nav-item.active::before { left: 0; top: auto; bottom: -10px; right: 8px; width: auto; height: 3px; }
        }
      `}</style>

      {sidebar}
      <div style={styles.main}>
        {header}
        <div className="sils-scroll" style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
}
