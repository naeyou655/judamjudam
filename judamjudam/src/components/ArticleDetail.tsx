import type { Article } from '../App'
import { CAT_MAP } from '../lib/supabase'

interface Props {
  article: Article
  onClose: () => void
}

const BODY_TMPL: Record<string, { type: string; text?: string; title?: string; cite?: string }[]> = {
  pick: [
    { type: 'lead', text: '에디터가 직접 고르고, 직접 마시고, 직접 썼다.' },
    { type: 'section', title: '이달의 선택', text: '매달 계절과 분위기에 맞는 전통주를 엄선합니다.' },
    { type: 'quote', text: '한 잔을 다 마셨을 때, 또 한 잔이 먹고 싶어지는 술이 좋은 술이다.', cite: '에디터' },
  ],
  basics: [
    { type: 'lead', text: '처음 전통주 코너 앞에 서면 막막하다.' },
    { type: 'section', title: '기초부터 시작하기', text: '막걸리, 약주, 청주, 증류식 소주. 이름은 달라도 뿌리는 하나다.' },
    { type: 'quote', text: '희석식과 증류식의 차이를 알면, 전통주의 절반은 이해한 것이다.', cite: '에디터' },
  ],
  field: [
    { type: 'lead', text: '서울에서 차로 두 시간 반. 양조장 문이 열리는 시간은 오전 여섯 시.' },
    { type: 'section', title: '현장의 이야기', text: '손이 거칠고, 말이 없다. 하지만 술 이야기가 나오면 눈이 달라진다.' },
    { type: 'quote', text: '기계로 만든 누룩은 균일하다. 손으로 만든 누룩에는 계절이 담긴다.', cite: '양조장 대표' },
  ],
  essay: [
    { type: 'lead', text: '전통주라는 이름이 붙기 전에, 이 술들은 그냥 술이었다.' },
    { type: 'section', title: '이름이 생긴다는 것', text: '무언가에 이름이 붙는다는 건 그것이 의식의 대상이 되었다는 뜻이다.' },
    { type: 'quote', text: '우리술이라는 말이 좋다. 우리가 함께 마시는 술이라는 의미로.', cite: '에디터' },
  ],
}

export default function ArticleDetail({ article, onClose }: Props) {
  const tmpl = BODY_TMPL[article.category] || BODY_TMPL.essay
  const dateStr = new Date(article.published_at).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  const initial = (article.author || 'E')[0].toUpperCase()

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      background: 'var(--bg)', zIndex: 50,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        height: 'var(--header-h)', background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 22px', flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
            color: 'var(--charcoal)', cursor: 'pointer',
            fontFamily: 'var(--sans)', background: 'none', border: 'none',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          블로그
        </button>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 썸네일 */}
        <div style={{
          width: '100%', height: 220, background: 'var(--ink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        }}>
          {article.image_url
            ? <img src={article.image_url} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <svg width="80" height="180" viewBox="0 0 80 180" fill="none">
                <path d="M16 36C10 48 8 64 8 88L8 158C8 165 18 172 40 172C62 172 72 165 72 158L72 88C72 64 70 48 64 36L52 16L28 16Z" fill="rgba(255,255,255,0.15)"/>
              </svg>
          }
        </div>

        <div style={{ padding: '28px 22px 60px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 12 }}>
            {CAT_MAP[article.category] || article.category}
          </div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, letterSpacing: '-0.6px', marginBottom: 16 }}>
            {article.title}
          </div>

          {/* 바이라인 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--charcoal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
              {initial}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Editor {article.author}</div>
              <div style={{ fontSize: 11, color: 'var(--charcoal)' }}>{dateStr}</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--charcoal)', padding: '4px 10px', border: '0.5px solid var(--line-strong)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
              {article.read_min} min read
            </div>
          </div>

          {/* 본문 */}
          {article.body && article.body.trim()
            ? <div dangerouslySetInnerHTML={{ __html: article.body }} style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text)', fontFamily: 'var(--sans)' }} />
            : tmpl.map((block, i) => {
                if (block.type === 'lead') return (
                  <p key={i} style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, fontStyle: 'italic', lineHeight: 1.7, color: 'var(--text)', marginBottom: 24 }}>
                    {block.text}
                  </p>
                )
                if (block.type === 'section') return (
                  <div key={i}>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12, lineHeight: 1.35, letterSpacing: '-0.4px' }}>{block.title}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.9, color: 'var(--text)', marginBottom: 20 }}>{block.text}</p>
                    <div style={{ height: 1, background: 'var(--line-strong)', margin: '28px 0' }} />
                  </div>
                )
                if (block.type === 'quote') return (
                  <div key={i} style={{ padding: '20px 20px 20px 18px', borderLeft: '3px solid var(--ink)', background: 'var(--bg-soft)', margin: '28px 0' }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic', lineHeight: 1.6, color: 'var(--text)' }}>{block.text}</p>
                    <cite style={{ fontSize: 11, color: 'var(--charcoal)', fontStyle: 'normal', display: 'block', marginTop: 8, letterSpacing: '0.08em' }}>— {block.cite}</cite>
                  </div>
                )
                return null
              })
          }

          {/* 태그 */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 32 }}>
            {['# ' + (CAT_MAP[article.category] || '전통주'), '# 주담주담', '# 우리술'].map(tag => (
              <span key={tag} style={{ fontSize: 11, color: 'var(--charcoal)', padding: '5px 12px', border: '0.5px solid var(--line-strong)', letterSpacing: '0.04em' }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
