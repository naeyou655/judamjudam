import { useState } from 'react'
import { db } from '../lib/supabase'

interface Props {
  active: boolean
  showToast: (msg: string) => void
}

const SWEET = ['', 'Bone Dry', 'Dry', 'Medium dry', 'Off-sweet', 'Sweet']
const ACID  = ['', 'Smooth', 'Mild Acidic', 'Acidic', 'Bright', 'Vivid']
const ABV   = ['', 'Silky', 'Light Bold', 'Medium Bold', 'Bold', 'Full Bold']
const CAT_LABEL: Record<string, string> = {
  makgeolli: '막걸리', yakju: '약·청주', distilled: '증류식 소주', fruit: '과실주',
}

export default function TasteScreen({ active, showToast }: Props) {
  const [step, setStep] = useState(1)
  const [jujong, setJujong] = useState<string[]>([])
  const [sweet, setSweet] = useState(3)
  const [acid, setAcid] = useState(2)
  const [abv, setAbv]   = useState(2)
  const [mood, setMood]  = useState('')
  const [loading, setLoading] = useState(false)
  const [pick1, setPick1] = useState<any>(null)
  const [pick2, setPick2] = useState<any>(null)

  const toggleJujong = (j: string) => {
    setJujong(prev => prev.includes(j) ? prev.filter(x => x !== j) : [...prev, j])
  }

  const submitTaste = async () => {
    if (!mood) { showToast('무드를 하나 선택해 주세요'); return }
    setLoading(true)
    const catMap: Record<string, string> = {
      '막걸리': 'makgeolli', '약·청주': 'yakju', '증류식 소주': 'distilled', '과실주': 'fruit',
    }
    const cats = jujong.map(j => catMap[j]).filter(Boolean)
    let q = db.from('liquors').select('*').eq('is_available', true)
    if (cats.length) q = (q as any).in('category', cats)
    const { data: liquors } = await q
    if (liquors && liquors.length) {
      const scored = liquors
        .map((l: any) => ({ ...l, score: Math.abs((l.sweet||3)-sweet) + Math.abs((l.acid||3)-acid) + Math.abs((l.body||3)-abv) }))
        .sort((a: any, b: any) => a.score - b.score)
      setPick1(scored[0] || null)
      // Pick2는 Pick1과 다른 술만 — 없으면 null
      const p2 = scored.find((l: any) => l.id !== scored[0]?.id)
      setPick2(p2 || null)

      await db.from('taste_results').insert({
        jujong, sweet, acid, abv, mood,
        pick1_name: scored[0]?.name || '',
        pick1_comment: scored[0]?.description || '',
        pick2_name: p2?.name || '',
        pick2_comment: p2?.description || '',
      })
    }
    setLoading(false)
    setStep(4)
  }

  const reset = () => {
    setStep(1); setJujong([]); setSweet(3); setAcid(2); setAbv(2)
    setMood(''); setPick1(null); setPick2(null)
  }

  if (!active) return null

  const pipStyle = (n: number) => ({
    flex: 1, height: 2,
    background: step > n ? 'var(--ink)' : step === n ? 'var(--charcoal)' : 'var(--line-strong)',
    transition: 'background 0.3s',
  })

  const chipStyle = (selected: boolean) => ({
    padding: '9px 18px',
    border: `0.5px solid ${selected ? 'var(--ink)' : 'var(--line-strong)'}`,
    fontSize: 13, cursor: 'pointer', color: selected ? 'var(--bg)' : 'var(--text)',
    background: selected ? 'var(--ink)' : 'transparent',
    fontFamily: 'var(--sans)', transition: 'all 0.15s',
  })

  return (
    <div style={{ height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>

      {/* STEP 1 */}
      {step === 1 && (
        <div style={{ padding: '26px 22px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
            <div style={pipStyle(1)}/><div style={pipStyle(2)}/><div style={pipStyle(3)}/>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 8 }}>step i · 주종 필터</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 26 }}>어떤 주종이<br/>마음에 드세요?</div>
          <div style={{ fontSize: 12, color: 'var(--charcoal)', marginBottom: 16 }}>복수 선택 가능</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
            {['막걸리', '약·청주', '증류식 소주', '과실주'].map(j => (
              <button key={j} onClick={() => toggleJujong(j)} style={chipStyle(jujong.includes(j))}>{j}</button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--charcoal)', lineHeight: 1.7, padding: '13px 16px', background: 'var(--bg-soft)', borderLeft: '2px solid var(--charcoal)', marginBottom: 24 }}>
            선택한 주종 안에서 단맛·도수·향의 결을 다음 단계에서 묻습니다.
          </div>
          <button className="cta-btn" onClick={() => setStep(2)}>다음 단계 →</button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div style={{ padding: '26px 22px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
            <div style={pipStyle(1)}/><div style={pipStyle(2)}/><div style={pipStyle(3)}/>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 8 }}>step ii · 맛 다이얼</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 26 }}>맛의 결을<br/>조절해 주세요.</div>

          {[
            { label: '단맛', val: sweet, set: setSweet, labels: SWEET, key: 'sweet', ends: ['Dry', 'Sweet'] },
            { label: '신맛', val: acid,  set: setAcid,  labels: ACID,  key: 'acid',  ends: ['Smooth', 'Bright'] },
            { label: '도수 타격감', val: abv, set: setAbv, labels: ABV, key: 'abv', ends: ['Smooth', 'Bold'] },
          ].map(({ label, val, set, labels, ends }) => (
            <div key={label} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{label}</span>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--charcoal)' }}>{labels[val]}</span>
              </div>
              <input type="range" min={1} max={5} value={val} step={1}
                onChange={e => set(parseInt(e.target.value))}
                style={{ WebkitAppearance: 'none', width: '100%', height: 1, background: 'var(--line-strong)', outline: 'none', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--charcoal)' }}>
                <span>{ends[0]}</span><span>{ends[1]}</span>
              </div>
            </div>
          ))}

          <button className="cta-btn" onClick={() => setStep(3)}>다음 단계 →</button>
          <button className="cta-outline" onClick={() => setStep(1)}>← 이전</button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ padding: '26px 22px' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 26 }}>
            <div style={pipStyle(1)}/><div style={pipStyle(2)}/><div style={pipStyle(3)}/>
          </div>
          <div style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 8 }}>step iii · 상황 / 무드</div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 24, fontWeight: 700, lineHeight: 1.35, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 20 }}>오늘의 무드는<br/>어떤가요?</div>
          <div style={{ fontSize: 12, color: 'var(--charcoal)', marginBottom: 20 }}>한 가지만 골라주세요</div>
          {[
            { label: '혼술, 밤새우며 느리게', icon: '🌙' },
            { label: '홈파티, 연인과 두 잔', icon: '♡' },
            { label: '부모님 선물, 한 병', icon: '🎁' },
            { label: '친구들과 시골박적', icon: '🍻' },
          ].map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setMood(label)}
              style={{
                width: '100%', padding: '14px 18px',
                border: `0.5px solid ${mood === label ? 'var(--ink)' : 'var(--line-strong)'}`,
                fontSize: 14, cursor: 'pointer',
                color: mood === label ? 'var(--bg)' : 'var(--text)',
                background: mood === label ? 'var(--ink)' : 'transparent',
                fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: 8, transition: 'all 0.15s',
              }}
            >
              <span>{label}</span><span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>
            </button>
          ))}
          <button className="cta-btn" onClick={submitTaste} disabled={loading} style={{ marginTop: 20 }}>
            {loading ? '분석 중...' : '결과 보기 →'}
          </button>
          <button className="cta-outline" onClick={() => setStep(2)}>← 이전</button>
        </div>
      )}

      {/* RESULT */}
      {step === 4 && (
        <div style={{ paddingBottom: 40 }}>
          <div style={{ background: 'var(--bg-soft)', padding: '22px 22px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--charcoal)', textTransform: 'uppercase', fontStyle: 'italic', fontFamily: 'var(--serif)', marginBottom: 6 }}>진단 결과 · RESULT</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: '-0.4px' }}>
              {SWEET[sweet]} × {ABV[abv]}
            </div>
            <div style={{ fontSize: 12, color: 'var(--charcoal)' }}>FOR YOU · {mood}</div>
          </div>
          <div style={{ padding: '20px 22px' }}>
            {[pick1, pick2].map((pick, i) => pick && (
              <div key={i} style={{ border: '0.5px solid var(--line-mid)', background: 'var(--white)', padding: 18, marginBottom: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 11, color: 'var(--charcoal)', letterSpacing: '0.1em', fontStyle: 'italic', flexShrink: 0, lineHeight: 1.4, textAlign: 'center', minWidth: 28 }}>
                  PICK<br/>{String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--charcoal)', marginBottom: 4, textTransform: 'uppercase' }}>{CAT_LABEL[pick.category] || '전통주'}</div>
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 5, lineHeight: 1.25, letterSpacing: '-0.3px' }}>{pick.name}</div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>{pick.description}</div>
                </div>
              </div>
            ))}
            <button className="cta-outline" onClick={reset} style={{ marginTop: 16 }}>↺ 다시 진단하기</button>
          </div>
        </div>
      )}
    </div>
  )
}
