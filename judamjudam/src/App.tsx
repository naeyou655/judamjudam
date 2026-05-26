import { useState, useEffect, useRef } from 'react'
import './styles/global.css'
import Header from './components/Header'
import TabBar from './components/TabBar'
import HomeScreen from './pages/HomeScreen'
import TasteScreen from './pages/TasteScreen'
import PairingScreen from './pages/PairingScreen'
import BlogScreen from './pages/BlogScreen'
import ArticleDetail from './components/ArticleDetail'
import LoginModal from './components/LoginModal'
import LoginGuard from './components/LoginGuard'
import Toast from './components/Toast'

export type TabName = 'home' | 'taste' | 'pairing' | 'blog'
const TAB_ORDER: TabName[] = ['home', 'taste', 'pairing', 'blog']

export interface Article {
  id: string
  title: string
  excerpt: string
  body: string
  category: string
  author: string
  read_min: number
  published_at: string
  image_url?: string
  is_hero?: boolean
  view_count?: number
  status?: string
}

export interface TossUser {
  userKey: number
  name?: string
  email?: string
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('home')
  const [prevTab, setPrevTab] = useState<TabName | null>(null)
  const [sliding, setSliding] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('left')
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [articleVisible, setArticleVisible] = useState(false)
  const [tossUser, setTossUser] = useState<TossUser | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const pendingAction = useRef<{ type: 'article'; article: Article } | { type: 'taste' } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [tasteReady, setTasteReady] = useState(false)
  const [toast, setToast] = useState('')
  const slidingRef = useRef(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }

  // 로컬 스토리지에서 세션 복원
  useEffect(() => {
    const saved = localStorage.getItem('toss_user')
    if (saved) {
      try { setTossUser(JSON.parse(saved)) } catch {}
    }
  }, [])

  const switchTab = (tab: TabName) => {
    if (tab === activeTab || slidingRef.current) return
    const fromIdx = TAB_ORDER.indexOf(activeTab)
    const toIdx   = TAB_ORDER.indexOf(tab)
    const dir = toIdx > fromIdx ? 'left' : 'right'
    setDirection(dir)
    setPrevTab(activeTab)
    setSliding(true)
    slidingRef.current = true
    setActiveTab(tab)
    setSelectedArticle(null)
    setTimeout(() => { setSliding(false); setPrevTab(null); slidingRef.current = false }, 320)
  }

  // 로그인 필요한 액션 래퍼
  const requireLogin = (action: typeof pendingAction.current) => {
    pendingAction.current = action
    setShowLogin(true)
  }

  const openArticle = (article: Article) => {
    if (!tossUser) {
      requireLogin({ type: 'article', article })
      return
    }
    if (article.id) {
      import('./lib/supabase').then(({ db }) => {
        db.from('articles').update({ view_count: (article.view_count || 0) + 1 })
          .eq('id', article.id).then(() => {})
      })
    }
    setSelectedArticle(article)
    setTimeout(() => setArticleVisible(true), 10)
  }

  const doOpenArticle = (article: Article) => {
    if (article.id) {
      import('./lib/supabase').then(({ db }) => {
        db.from('articles').update({ view_count: (article.view_count || 0) + 1 })
          .eq('id', article.id).then(() => {})
      })
    }
    setSelectedArticle(article)
    setTimeout(() => setArticleVisible(true), 10)
  }

  const closeArticle = () => {
    setArticleVisible(false)
    setTimeout(() => setSelectedArticle(null), 300)
  }

  const onLoginSuccess = (user: TossUser) => {
    setTossUser(user)
    localStorage.setItem('toss_user', JSON.stringify(user))
    setShowLogin(false)
    showToast(`안녕하세요, ${user.name || ''}님!`)
    const action = pendingAction.current
    pendingAction.current = null
    if (!action) return
    if (action.type === 'article') {
      setSelectedArticle(action.article)
      setArticleVisible(true)
    }
    if (action.type === 'taste') {
      setTasteReady(true)
    }
  }

  const doLogout = () => {
    setTossUser(null)
    localStorage.removeItem('toss_user')
    setShowDropdown(false)
    showToast('로그아웃되었습니다.')
  }

  const getScreenStyle = (tab: TabName): React.CSSProperties => {
    const isActive = tab === activeTab
    const isPrev   = tab === prevTab
    if (!sliding) {
      return { position: 'absolute', inset: 0, transform: isActive ? 'translateX(0)' : 'translateX(100%)', transition: 'none', visibility: isActive ? 'visible' : 'hidden' }
    }
    if (isActive) return { position: 'absolute', inset: 0, animation: `slideIn${direction === 'left' ? 'Right' : 'Left'} 0.3s cubic-bezier(0.4,0,0.2,1) forwards` }
    if (isPrev)   return { position: 'absolute', inset: 0, animation: `slideOut${direction === 'left' ? 'Left' : 'Right'} 0.3s cubic-bezier(0.4,0,0.2,1) forwards` }
    return { position: 'absolute', inset: 0, transform: 'translateX(100%)', visibility: 'hidden' }
  }

  return (
    <div style={{ width: '100%', height: '100dvh', minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @keyframes slideInRight  { from { transform:translateX(100%) }  to { transform:translateX(0) } }
        @keyframes slideInLeft   { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        @keyframes slideOutLeft  { from { transform:translateX(0) }     to { transform:translateX(-100%) } }
        @keyframes slideOutRight { from { transform:translateX(0) }     to { transform:translateX(100%) } }
        @keyframes slideUpIn     { from { transform:translateY(100%); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes slideUpOut    { from { transform:translateY(0);    opacity:1 } to { transform:translateY(100%); opacity:0 } }
        @keyframes stepFadeSlide { from { transform:translateX(24px); opacity:0 } to { transform:translateX(0); opacity:1 } }
      `}</style>

      <Header isLoggedIn={!!tossUser} userName={tossUser?.name} onUserClick={() => { if (tossUser) setShowDropdown(v => !v); else setShowLogin(true) }} />

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div style={getScreenStyle('home')}>
          <HomeScreen active={activeTab === 'home' || prevTab === 'home'} onArticleClick={openArticle} onTasteClick={() => switchTab('taste')} onPairingClick={() => switchTab('pairing')} showToast={showToast} />
        </div>
        <div style={getScreenStyle('taste')}>
          <TasteScreen
            active={activeTab === 'taste' || prevTab === 'taste'}
            showToast={showToast}
            tossUser={tossUser}
            tasteReady={tasteReady}
            onTasteReady={() => setTasteReady(false)}
            onLoginRequired={() => {
              pendingAction.current = { type: 'taste' }
              setShowLogin(true)
            }}
          />
        </div>
        <div style={getScreenStyle('pairing')}>
          <PairingScreen active={activeTab === 'pairing' || prevTab === 'pairing'} />
        </div>
        <div style={getScreenStyle('blog')}>
          <BlogScreen active={activeTab === 'blog' || prevTab === 'blog'} onArticleClick={openArticle} />
        </div>
      </div>

      <TabBar activeTab={activeTab} onTabChange={switchTab} />

      {/* 아티클 상세 */}
      {selectedArticle && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 50, animation: articleVisible ? 'slideUpIn 0.32s cubic-bezier(0.4,0,0.2,1) forwards' : 'slideUpOut 0.28s cubic-bezier(0.4,0,0.2,1) forwards' }}>
          <ArticleDetail article={selectedArticle} onClose={closeArticle} />
        </div>
      )}

      {/* 토스 로그인 모달 */}
      {showLogin && (
        <LoginModal
          onClose={() => { setShowLogin(false); pendingAction.current = null }}
          onSuccess={onLoginSuccess}
        />
      )}

      {/* 유저 드롭다운 */}
      {showDropdown && (
        <>
          <div style={{ position: 'absolute', inset: 0, zIndex: 85 }} onClick={() => setShowDropdown(false)} />
          <div style={{ position: 'absolute', top: 'calc(var(--header-h) + 4px)', right: 16, background: 'var(--white)', border: '0.5px solid var(--line-mid)', padding: '8px 0', zIndex: 90, minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--text)', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 600 }}>{tossUser?.name || '사용자'}</div>
              <div style={{ fontSize: 11, color: 'var(--charcoal)', marginTop: 2 }}>{tossUser?.email || ''}</div>
            </div>
            <div onClick={doLogout} style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', color: '#C0392B' }}>↩ 로그아웃</div>
          </div>
        </>
      )}

      <Toast message={toast} />
    </div>
  )
}
