import https from 'https'
import { readFileSync } from 'fs'
import { join } from 'path'

const TOSS_BASE = 'https://apps-in-toss-api.toss.im'
const DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY
const DECRYPT_AAD = process.env.TOSS_DECRYPT_AAD || 'TOSS'

// mTLS 인증서
const cert = process.env.TOSS_CERT
const key  = process.env.TOSS_KEY

const agent = new https.Agent({
  cert,
  key,
  rejectUnauthorized: true,
})

async function decrypt(encryptedText) {
  const { createDecipheriv } = await import('crypto')
  const decoded    = Buffer.from(encryptedText, 'base64')
  const keyBytes   = Buffer.from(DECRYPT_KEY, 'base64')
  const iv         = decoded.slice(0, 12)
  const authTag    = decoded.slice(decoded.length - 16)
  const ciphertext = decoded.slice(12, decoded.length - 16)
  const decipher   = createDecipheriv('aes-256-gcm', keyBytes, iv)
  decipher.setAuthTag(authTag)
  decipher.setAAD(Buffer.from(DECRYPT_AAD))
  const decrypted  = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')

  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { authorizationCode, referrer } = req.body

  if (!authorizationCode) return res.status(400).json({ error: 'authorizationCode required' })

  try {
    // 1. authorizationCode → accessToken
    const tokenRes = await fetch(`${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorizationCode, referrer }),
      // @ts-ignore
      agent,
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.success?.accessToken) {
      return res.status(400).json({ error: 'token 발급 실패', detail: tokenData })
    }

    const accessToken = tokenData.success.accessToken

    // 2. accessToken → 사용자 정보
    const userRes = await fetch(`${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      // @ts-ignore
      agent,
    })
    const userData = await userRes.json()
    if (!userData.success?.userKey) {
      return res.status(400).json({ error: '사용자 정보 조회 실패' })
    }

    const { userKey, name: encName, email: encEmail } = userData.success

    let name  = null
    let email = null
    try { if (encName)  name  = await decrypt(encName)  } catch {}
    try { if (encEmail) email = await decrypt(encEmail) } catch {}

    return res.status(200).json({ userKey, name, email })

  } catch (e) {
    console.error('toss-login error:', e)
    return res.status(500).json({ error: String(e) })
  }
}
