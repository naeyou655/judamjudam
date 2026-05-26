import type { TabName } from '../App'

interface Props {
  activeTab: TabName
  onTabChange: (tab: TabName) => void
}

const TABS: { id: TabName; label: string; icon: JSX.Element }[] = [
  {
    id: 'home', label: '홈',
    icon: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  },
  {
    id: 'taste', label: '취향진단',
    icon: <svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>,
  },
  {
    id: 'pairing', label: '안주페어링',
    icon: <svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
  },
  {
    id: 'blog', label: '블로그',
    icon: <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  },
]

export default function TabBar({ activeTab, onTabChange }: Props) {
  return (
    <div style={{
      height: `calc(var(--tab-h) + var(--safe-bottom))`,
      paddingBottom: 'var(--safe-bottom)',
      background: '#FFFFFF',
      borderTop: '1px solid var(--line-mid)',
      display: 'flex', alignItems: 'stretch',
      flexShrink: 0, zIndex: 20,
    }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
            cursor: 'pointer',
            color: activeTab === tab.id ? '#111111' : 'rgba(17,17,17,0.32)',
            background: 'none', border: 'none',
            fontFamily: 'var(--sans)', transition: 'color 0.18s',
            userSelect: 'none', padding: 0,
          }}
        >
          <div style={{
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg
              width="22" height="22"
              viewBox="0 0 24 24"
              fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            >
              {tab.icon.props.children}
            </svg>
          </div>
          <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: '#111',
            opacity: activeTab === tab.id ? 1 : 0,
            transition: 'opacity 0.18s',
          }} />
        </button>
      ))}
    </div>
  )
}
