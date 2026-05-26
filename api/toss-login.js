import https from 'https'

const TOSS_BASE = 'apps-in-toss-api.toss.im'
const DECRYPT_KEY = process.env.TOSS_DECRYPT_KEY
const DECRYPT_AAD = process.env.TOSS_DECRYPT_AAD || 'TOSS'
const CERT = process.env.TOSS_CERT?.replace(/\\n/g, '\n')
const KEY  = process.env.TOSS_KEY?.replace(/\\n/g, '\n')

function httpsRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null
    const options = {
      hostname: TOSS_BASE,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
      cert: CERT,
      key: KEY,
      rejectUnauthorized: true,
    }
    const req = https.request(options, (res) => {
      let raw = ''
      res.on('data', chunk => raw += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) }
        catch { resolve(raw) }
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

function httpsRequestWithAuth(path, accessToken) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: TOSS_BASE,
      path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
      cert: CERT,
      key: KEY,
      rejectUnauthorized: true,
    }
    const req = https.request(options, (res) => {
      let raw = ''
      res.on('data', chunk => raw += chunk)
      res.on('end', () => {
        try { resolve(JSON.parse(raw)) }
        catch { resolve(raw) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

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
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
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
    // 1. 토큰 발급
    const tokenData = await httpsRequest(
      '/api-partner/v1/apps-in-toss/user/oauth2/generate-token',
      'POST',
      { authorizationCode, referrer }
    )
    if (!tokenData.success?.accessToken) {
      return res.status(400).json({ error: 'token 발급 실패', detail: tokenData })
    }

    // 2. 사용자 정보 조회
    const userData = await httpsRequestWithAuth(
      '/api-partner/v1/apps-in-toss/user/oauth2/login-me',
      tokenData.success.accessToken
    )
    if (!userData.success?.userKey) {
      return res.status(400).json({ error: '사용자 정보 조회 실패' })
    }

    const { userKey, name: encName, email: encEmail } = userData.success
    let name = null, email = null
    try { if (encName)  name  = await decrypt(encName)  } catch {}
    try { if (encEmail) email = await decrypt(encEmail) } catch {}

    return res.status(200).json({ userKey, name, email })
  } catch (e) {
    console.error('toss-login error:', e)
    return res.status(500).json({ error: String(e) })
  }
}
