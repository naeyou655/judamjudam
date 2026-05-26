import { useEffect } from 'react'
import { appLogin } from '@apps-in-toss/web-framework'
import type { TossUser } from '../App'

interface Props {
  onClose: () => void
  onSuccess: (user: TossUser) => void
}

export default function LoginModal({ onClose, onSuccess }: Props) {
  useEffect(() => {
    doTossLogin()
  }, [])

  const doTossLogin = async () => {
    try {
      const { authorizationCode, referrer } = await appLogin()
      const res = await fetch(
        'https://judamjudam.vercel.app/api/toss-login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authorizationCode, referrer }),
        }
      )
      if (!res.ok) throw new Error('로그인 실패')
      const { userKey, name, email } = await res.json()
      onSuccess({ userKey, name, email })
    } catch (e) {
      console.error('토스 로그인 실패:', e)
      onClose()
    }
  }

  return null
}
