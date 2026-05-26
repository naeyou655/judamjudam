interface Props {
  isLoggedIn: boolean
  onUserClick: () => void
}

export default function Header({ isLoggedIn, onUserClick }: Props) {
  return (
    <div style={{
      height: 'var(--header-h)', background: 'var(--bg)',
      borderBottom: '1px solid var(--line)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', flexShrink: 0, zIndex: 20,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700,
          color: 'var(--text)', letterSpacing: '-0.4px',
        }}>주담주담</div>
        <div style={{ fontSize: 10, color: 'var(--charcoal)', letterSpacing: '0.1em', marginTop: 1 }}>
          guide · may 2026
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* 검색 */}
        <div style={{ width: 22, height: 22, cursor: 'pointer', color: 'var(--charcoal)', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        {/* 유저 아이콘 */}
        <div style={{ width: 22, height: 22, cursor: 'pointer', color: 'var(--charcoal)', display: 'flex', alignItems: 'center' }} onClick={onUserClick}>
          {isLoggedIn ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
              <polyline points="16,11 18,13 22,9" strokeWidth="2.2"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
