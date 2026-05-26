import { useEffect, useState } from 'react'
import { db, CAT_MAP } from '../lib/supabase'
import type { Article } from '../App'

interface Props {
  active: boolean
  onArticleClick: (a: Article) => void
  onTasteClick: () => void
  onPairingClick: () => void
  showToast: (msg: string) => void
}

const bottleSVG = (op = 0.42) => `
  <svg viewBox="0 0 30 72" width="30" fill="none">
    <rect x="10" y="0" width="10" height="6" rx="1" fill="#4A5568" opacity="0.5"/>
    <path d="M6 14C4 18 3 24 3 32L3 62C3 66 8 70 15 70C22 70 27 66 27 62L27 32C27 24 26 18 24 14L20 6L10 6Z" fill="#4A5568" opacity="${op}"/>
    <rect x="5" y="38" width="20" height="1" fill="white" opacity="0.4"/>
    <rect x="7" y="46" width="16" height="5" rx="1" fill="white" opacity="0.3"/>
  </svg>
`

export default function HomeScreen({ active, onArticleClick, onTasteClick, onPairingClick, showToast }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const [heroImage, setHeroImage] = useState('')
  const [subEmail, setSubEmail] = useState('')
  const [subMsg, setSubMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!active) return
    Promise.all([
      db.from('articles').select('*').order('published_at', { ascending: false }).limit(5),
      db.from('app_settings').select('*'),
    ]).then(([{ data: arts }, { data: settings }]) => {
      setArticles(arts || [])
      if (settings) {
        const map = Object.fromEntries(settings.map((s: any) => [s.key, s.value]))
        if (map['hero_image']) setHeroImage(map['hero_image'])
      }
      setLoading(false)
    })
  }, [active])

  const doSubscribe = async () => {
    if (!subEmail || !subEmail.includes('@')) { setSubMsg('올바른 이메일을 입력해주세요.'); return }
    const { error } = await db.from('subscribers').insert({ email: subEmail, source: 'web_home' })
    if (error) { setSubMsg(error.code === '23505' ? '이미 구독 중인 이메일입니다.' : '오류가 발생했습니다.'); return }
    setSubEmail('')
    setSubMsg('구독해주셔서 감사합니다 🍶')
    setTimeout(() => setSubMsg(''), 4000)
  }

  if (!active) return null

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* 히어로 */}
      <div style={{
        background: 'var(--ink)', padding: '30px 24px 26px',
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'stretch', gap: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontFamily: 'var(--serif)', marginBottom: 10 }}>
            This week's hero
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 23, lineHeight: 1.35, color: '#fff', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 8 }}>
            "나보다 내 술 취향을<br/>더 잘 아는 공간,<br/>주담주담."
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.48)', lineHeight: 1.7, marginBottom: 22 }}>
            우리술 한 잔과 오늘의 안주 사이를 가장 정갈하게 잇는 큐레이션.
          </div>
          <button
            onClick={onTasteClick}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.1)', border: '0.5px solid rgba(255,255,255,0.24)',
              color: '#fff', fontSize: 12, padding: '10px 16px', cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            1분 만에 내 전통주 취향 진단하기 →
          </button>
        </div>
        {heroImage && (
          <div style={{ width: 100, flexShrink: 0, alignSelf: 'stretch', overflow: 'hidden', margin: '-30px -24px -26px 16px' }}>
            <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          </div>
        )}
      </div>

      {/* 위클리 페어링 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 22px 14px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>이번 주 야식 페어링</div>
        <div style={{ fontSize: 10, color: 'var(--charcoal)' }}>WEEKLY</div>
      </div>

      {[
        { day: 'FRI · 불금 안주', name: '엽떡 매운맛 × 크래프트 막걸리', tag: '탄산이 기름을 씻어내는 황금 조합', bg: 'var(--charcoal)' },
        { day: 'SAT · 주말 혼술', name: '두부김치 × 한산소곡주', tag: '짭조름한 김치의 산미가 단맛을 살린다', bg: '#6B7280' },
      ].map((item, i) => (
        <div key={i} onClick={onPairingClick} style={{
          margin: '0 22px 10px', background: i === 1 ? 'var(--bg-soft)' : 'var(--white)',
          border: '0.5px solid var(--line-mid)', padding: 16,
          display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: item.bg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16 }}>
            {i === 0 ? '🔥' : '🌙'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--charcoal)', marginBottom: 3, textTransform: 'uppercase' }}>{item.day}</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, lineHeight: 1.3, color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.3px' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: 'var(--charcoal)' }}>{item.tag}</div>
          </div>
          <span style={{ color: 'var(--charcoal)', fontSize: 16 }}>›</span>
        </div>
      ))}

      <div style={{ height: 1, background: 'var(--line)', margin: '6px 22px 0' }} />

      {/* 아티클 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 22px 14px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>따끈한 아티클</div>
        <div style={{ fontSize: 10, color: 'var(--charcoal)' }}>JOURNAL</div>
      </div>

      <div style={{ display: 'flex', gap: 12, padding: '0 22px 28px', overflowX: 'auto' }}>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} style={{ flexShrink: 0, width: 158 }}>
              <div className="skeleton" style={{ width: '100%', height: 100, marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 9, width: '80%', marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 13, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 9, width: '55%' }} />
            </div>
          ))
        ) : articles.map(a => (
          <div key={a.id} onClick={() => onArticleClick(a)} style={{ flexShrink: 0, width: 158, cursor: 'pointer' }}>
            <div style={{ width: '100%', height: 100, background: 'var(--bg-soft)', border: '0.5px solid var(--line-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, overflow: 'hidden' }}>
              {a.image_url
                ? <img src={a.image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span dangerouslySetInnerHTML={{ __html: bottleSVG() }} />
              }
            </div>
            <div style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 4 }}>
              {CAT_MAP[a.category] || a.category}
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.3px' }}>
              {a.title}
            </div>
            <div style={{ fontSize: 10, color: 'var(--charcoal)' }}>By Editor {a.author} · {a.read_min} min</div>
          </div>
        ))}
      </div>

      {/* 뉴스레터 */}
      <div style={{ margin: '8px 22px 32px', background: 'var(--ink)', padding: 24 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 8 }}>Newsletter</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1.4, marginBottom: 6, letterSpacing: '-0.3px' }}>
          위클리 페어링,<br/>받아보실래요?
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 18 }}>매주 주담주담의 추천을 메일로 받아보세요.</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
          <input
            type="email" value={subEmail}
            onChange={e => setSubEmail(e.target.value)}
            placeholder="이메일 주소"
            onKeyDown={e => e.key === 'Enter' && doSubscribe()}
            style={{
              flex: 1, minWidth: 0, padding: '11px 14px',
              background: 'rgba(255,255,255,0.1)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              color: '#fff', fontSize: 13,
              fontFamily: 'var(--sans)', outline: 'none',
            }}
          />
          <button
            onClick={doSubscribe}
            style={{
              flexShrink: 0, padding: '11px 14px',
              background: '#fff', color: 'var(--ink)',
              border: 'none', fontSize: 13, fontFamily: 'var(--sans)',
              cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600,
            }}
          >구독</button>
        </div>
        {subMsg && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 10 }}>{subMsg}</div>}
      </div>
      <div style={{ paddingBottom: 40 }} />
    </div>
  )
}
