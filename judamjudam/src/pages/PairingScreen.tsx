import { useEffect, useState } from 'react'
import { db } from '../lib/supabase'

interface Props { active: boolean }

interface FoodPairing {
  id: string
  food_name: string
  food_sub: string
  icon: string
  image_url?: string
  match_liquor: string
  attrs: string
  reason: string
  sort_order: number
}

const FOOD_ICONS: Record<string, JSX.Element> = {
  'ti-flame': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>,
  'ti-soup':  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21a9 9 0 01-9-9h18a9 9 0 01-9 9z"/><path d="M12 3v9"/></svg>,
  'ti-fish':  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 12c0-5.667 4-8.5 9-9.5-.5 2-1 5 0 7-2 2-3.5 2-4.5 3.5-1.5 2.1-1 5-1 8-3.5-2.5-3.5-9-3.5-9z"/></svg>,
  'ti-slice': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
}

export default function PairingScreen({ active }: Props) {
  const [pairings, setPairings] = useState<FoodPairing[]>([])
  const [selected, setSelected] = useState<FoodPairing | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!active) return
    db.from('food_pairings').select('*').order('sort_order').then(({ data }) => {
      setPairings(data || [])
      setLoading(false)
    })
  }, [active])

  const selectFood = (f: FoodPairing) => {
    setSelected(f)
    db.from('pairing_clicks').insert({ food_name: f.food_name }).then(() => {})
  }

  if (!active) return null

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ padding: '22px 22px 14px' }}>
        <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: 6 }}>Tab 03 · Food Pairing</div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.4px' }}>오늘 뭐 시키지?</div>
        <div style={{ fontSize: 12, color: 'var(--charcoal)' }}>안주를 누르면 어울리는 우리술이 펼쳐집니다.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'var(--line-mid)' }}>
        {loading
          ? [1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ minHeight: 96 }} />)
          : pairings.map(f => (
            <div
              key={f.id}
              onClick={() => selectFood(f)}
              style={{
                background: selected?.id === f.id ? 'var(--ink)' : 'var(--bg)',
                padding: '18px 16px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 8, minHeight: 96,
                transition: 'background 0.2s', position: 'relative', overflow: 'hidden',
              }}
            >
              {f.image_url && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                  <img src={f.image_url} alt={f.food_name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: selected?.id === f.id ? 0.1 : 0.18 }} />
                </div>
              )}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ width: 26, height: 26, color: selected?.id === f.id ? 'rgba(255,255,255,0.7)' : 'var(--charcoal)' }}>
                  {f.image_url
                    ? <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: '#ddd' }}>
                        <img src={f.image_url} alt={f.food_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    : <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {(FOOD_ICONS[f.icon] || FOOD_ICONS['ti-flame']).props.children}
                      </svg>
                  }
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 700, color: selected?.id === f.id ? 'rgba(255,255,255,0.9)' : 'var(--text)', lineHeight: 1.3, letterSpacing: '-0.3px' }}>{f.food_name}</div>
                <div style={{ fontSize: 10, color: selected?.id === f.id ? 'rgba(255,255,255,0.5)' : 'var(--charcoal)', fontStyle: 'italic' }}>{f.food_sub}</div>
              </div>
            </div>
          ))
        }
      </div>

      {selected && (
        <div style={{ background: 'var(--ink)', padding: '24px 22px', color: '#fff' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 8 }}>OUTPUT · 우리술 라인업</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 12 }}>{selected.food_name}와 어울리는 술</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.25, marginBottom: 14, letterSpacing: '-0.4px' }}>
            {selected.match_liquor.split(' / ').join(' ·\n')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {selected.attrs.split(' · ').map(a => (
              <span key={a} style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.42)', padding: '4px 10px', border: '0.5px solid rgba(255,255,255,0.18)' }}>{a}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{selected.reason}</div>
        </div>
      )}
      <div style={{ paddingBottom: 40 }} />
    </div>
  )
}
