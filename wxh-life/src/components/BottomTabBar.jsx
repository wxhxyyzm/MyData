export default function BottomTabBar({ tabs, active, onChange }) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '0 auto',
          padding: '8px 20px 16px',
          background: 'linear-gradient(to top, var(--bg) 70%, transparent)',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--line)',
            borderRadius: 16,
            padding: 4,
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${active === tab.id ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              <tab.Icon size={20} strokeWidth={2} />
              <span>{tab.label}</span>
              <span className="tab-dot" />
              {tab.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 'calc(50% - 22px)',
                    background: '#dc2626',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: 999,
                    minWidth: 16,
                    textAlign: 'center',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
