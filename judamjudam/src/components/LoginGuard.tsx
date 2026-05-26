interface Props {
  onLoginClick: () => void
  message?: string
}

export default function LoginGuard({ onLoginClick, message = '이 기능을 이용하려면\n로그인이 필요해요.' }: Props) {
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '0 40px', zIndex: 10,
    }}>
      {/* 보틀 아이콘 */}
      <svg viewBox="0 0 30 72" width="40" fill="none" style={{ marginBottom: 24, opacity: 0.25 }}>
        <rect x="10" y="0" width="10" height="6" rx="1" fill="#2C1A0E" opacity="0.5"/>
        <path d="M6 14C4 18 3 24 3 32L3 62C3 66 8 70 15 70C22 70 27 66 27 62L27 32C27 24 26 18 24 14L20 6L10 6Z" fill="#2C1A0E" opacity="0.42"/>
      </svg>

      <div style={{
        fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700,
        color: 'var(--text)', textAlign: 'center', lineHeight: 1.5,
        letterSpacing: '-0.4px', marginBottom: 8, whiteSpace: 'pre-line',
      }}>
        {message}
      </div>
      <div style={{ fontSize: 13, color: 'var(--charcoal)', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
        토스 계정으로 1초만에 시작하세요.
      </div>

      <button
        onClick={onLoginClick}
        style={{
          width: '100%', maxWidth: 280, padding: '16px',
          background: 'var(--ink)', color: '#fff',
          border: 'none', fontSize: 15, fontWeight: 700,
          fontFamily: 'var(--sans)', cursor: 'pointer',
          borderRadius: 12, letterSpacing: '-0.3px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        토스로 로그인
      </button>
    </div>
  )
}
