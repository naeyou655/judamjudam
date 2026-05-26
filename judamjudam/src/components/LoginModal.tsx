import { useState } from 'react'
import { db } from '../lib/supabase'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const doLogin = async () => {
    setErr('')
    if (!email || !pw) { setErr('이메일과 비밀번호를 입력해주세요.'); return }
    setLoading(true)
    const { error } = await db.auth.signInWithPassword({ email, password: pw })
    if (error) { setErr('이메일 또는 비밀번호가 틀렸습니다.'); setLoading(false); return }
    const { data: admin } = await db.from('admin_users').select('email').eq('email', email).single()
    if (!admin) {
      await db.auth.signOut()
      setErr('어드민 권한이 없습니다.')
      setLoading(false); return
    }
    setLoading(false)
    onSuccess()
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.55)', zIndex: 80,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div style={{
        width: '100%', background: 'var(--bg)',
        padding: '32px 24px 48px', position: 'relative',
        animation: 'slideUp 0.28s ease',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 18,
            fontSize: 20, color: 'var(--charcoal)', cursor: 'pointer',
            background: 'none', border: 'none', width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >✕</button>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          어드민 로그인
        </div>
        <div style={{ fontSize: 12, color: 'var(--charcoal)', marginBottom: 28 }}>주담주담 관리자 전용</div>

        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', color: 'var(--charcoal)', textTransform: 'uppercase', marginBottom: 8 }}>이메일</label>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="admin@judamjudam.kr"
          style={{
            width: '100%', padding: '13px 14px',
            border: '0.5px solid var(--line-strong)',
            background: 'var(--white)', fontSize: 14,
            fontFamily: 'var(--sans)', color: 'var(--text)',
            outline: 'none', marginBottom: 14,
          }}
        />
        <label style={{ display: 'block', fontSize: 11, letterSpacing: '0.1em', color: 'var(--charcoal)', textTransform: 'uppercase', marginBottom: 8 }}>비밀번호</label>
        <input
          type="password" value={pw}
          onChange={e => setPw(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && doLogin()}
          style={{
            width: '100%', padding: '13px 14px',
            border: '0.5px solid var(--line-strong)',
            background: 'var(--white)', fontSize: 14,
            fontFamily: 'var(--sans)', color: 'var(--text)',
            outline: 'none', marginBottom: 14,
          }}
        />
        <button
          onClick={doLogin}
          disabled={loading}
          style={{
            width: '100%', padding: 14,
            background: 'var(--ink)', color: 'var(--bg)',
            border: 'none', fontSize: 14, fontFamily: 'var(--sans)',
            cursor: 'pointer', marginTop: 6,
            opacity: loading ? 0.45 : 1,
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
        {err && <div style={{ fontSize: 12, color: '#C0392B', marginTop: 10, textAlign: 'center' }}>{err}</div>}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
