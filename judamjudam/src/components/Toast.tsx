interface Props { message: string }

export default function Toast({ message }: Props) {
  if (!message) return null
  return (
    <div style={{
      position: 'absolute',
      bottom: 'calc(var(--tab-h) + 16px)',
      left: '50%', transform: 'translateX(-50%)',
      background: 'var(--ink)', color: '#fff',
      fontSize: 12, padding: '10px 20px',
      whiteSpace: 'nowrap', zIndex: 100,
      fontFamily: 'var(--sans)',
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  )
}
