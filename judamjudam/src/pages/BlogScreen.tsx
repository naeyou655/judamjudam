import { useEffect, useState } from 'react'
import { db, CAT_MAP } from '../lib/supabase'
import type { Article } from '../App'

interface Props {
  active: boolean
  onArticleClick: (a: Article) => void
}

const CATS = [
  { id: 'all', label: '전체' },
  { id: 'pick', label: '이달의 PICK' },
  { id: 'basics', label: '전통주 입문' },
  { id: 'field', label: '양조장 기행' },
  { id: 'essay', label: '에디터 노트' },
]

const ThumbFallback = () => (
  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#E8E8E2,#F0EDE6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg viewBox="0 0 30 72" width="28" fill="none">
      <rect x="10" y="0" width="10" height="6" rx="1" fill="#4A5568" opacity="0.4"/>
      <path d="M6 14C4 18 3 24 3 32L3 62C3 66 8 70 15 70C22 70 27 66 27 62L27 32C27 24 26 18 24 14L20 6L10 6Z" fill="#4A5568" opacity="0.3"/>
    </svg>
  </div>
)

export default function BlogScreen({ active, onArticleClick }: Props) {
  const [articles, setArticles] = useState<Article[]>([])
  const [cat, setCat] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!active) return
    db.from('articles').select('*').order('published_at', { ascending: false })
      .then(({ data }) => { setArticles(data || []); setLoading(false) })
  }, [active])

  if (!active) return null

  const filtered = cat === 'all' ? articles : articles.filter(a => a.category === cat)
  const [hero, ...rest] = filtered

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* 카테고리 탭 */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
        {CATS.map(c => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            style={{
              padding: '13px 16px', fontSize: 12,
              fontWeight: cat === c.id ? 600 : 400,
              color: cat === c.id ? 'var(--text)' : 'var(--charcoal)',
              whiteSpace: 'nowrap', cursor: 'pointer',
              border: 'none', borderBottom: `1.5px solid ${cat === c.id ? 'var(--ink)' : 'transparent'}`,
              marginBottom: -1, fontFamily: 'var(--sans)', background: 'none',
              transition: 'all 0.15s',
            }}
          >{c.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '16px 22px' }}>
          <div className="skeleton" style={{ width: '100%', height: 220, borderRadius: 2, marginBottom: 16 }} />
          <div className="skeleton" style={{ height: 11, width: '40%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 20, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 13 }} />
        </div>
      ) : !filtered.length ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--charcoal)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          아직 아티클이 없습니다.
        </div>
      ) : (
        <>
          {/* 히어로 아티클 */}
          {hero && (
            <div onClick={() => onArticleClick(hero)} style={{ padding: '24px 22px 20px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
              <div style={{ width: '100%', height: 166, background: 'var(--bg-soft)', border: '0.5px solid var(--line-mid)', marginBottom: 14, overflow: 'hidden' }}>
                {hero.image_url
                  ? <img src={hero.image_url} alt={hero.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ThumbFallback />
                }
              </div>
              <div style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 8 }}>
                {CAT_MAP[hero.category] || hero.category} · {new Date(hero.published_at).toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.4px', marginBottom: 8 }}>{hero.title}</div>
              <div style={{ fontSize: 12, color: 'var(--charcoal)', lineHeight: 1.75, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                {hero.excerpt}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--charcoal)' }}>
                <span>By Editor {hero.author}</span>
                <span>{hero.read_min} min read</span>
              </div>
            </div>
          )}

          {/* 나머지 */}
          {rest.map(a => (
            <div key={a.id} onClick={() => onArticleClick(a)} style={{ display: 'flex', gap: 14, padding: '16px 22px', borderBottom: '1px solid var(--line)', cursor: 'pointer', alignItems: 'center' }}>
              <div style={{ width: 74, height: 74, background: 'var(--bg-soft)', border: '0.5px solid var(--line-mid)', flexShrink: 0, overflow: 'hidden' }}>
                {a.image_url
                  ? <img src={a.image_url} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ThumbFallback />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9, color: 'var(--charcoal)', letterSpacing: '0.14em', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 4 }}>
                  {CAT_MAP[a.category] || a.category}
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: 6, letterSpacing: '-0.3px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as any}>
                  {a.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--charcoal)' }}>By Editor {a.author} · {a.read_min} min</div>
              </div>
            </div>
          ))}
        </>
      )}
      <div style={{ paddingBottom: 40 }} />
    </div>
  )
}
