const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
}

const TOSS_BASE = "https://apps-in-toss-api.toss.im"
const DECRYPT_KEY = Deno.env.get("TOSS_DECRYPT_KEY")!
const DECRYPT_AAD = Deno.env.get("TOSS_DECRYPT_AAD") || "TOSS"

async function decrypt(encryptedText: string): Promise<string> {
  const decoded = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0))
  const keyBytes = Uint8Array.from(atob(DECRYPT_KEY), c => c.charCodeAt(0))
  const iv = decoded.slice(0, 12)
  const ciphertext = decoded.slice(12)
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
  )
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData: new TextEncoder().encode(DECRYPT_AAD) },
    cryptoKey, ciphertext
  )
  return new TextDecoder().decode(decrypted)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })
  try {
    const { authorizationCode, referrer } = await req.json()
    if (!authorizationCode) return Response.json({ error: "authorizationCode required" }, { status: 400, headers: CORS })

    const tokenRes = await fetch(`${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authorizationCode, referrer }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenData.success?.accessToken) {
      return Response.json({ error: "token 발급 실패", detail: tokenData }, { status: 400, headers: CORS })
    }

    const accessToken = tokenData.success.accessToken
    const userRes = await fetch(`${TOSS_BASE}/api-partner/v1/apps-in-toss/user/oauth2/login-me`, {
      headers: { "Authorization": `Bearer ${accessToken}` },
    })
    const userData = await userRes.json()
    if (!userData.success?.userKey) {
      return Response.json({ error: "사용자 정보 조회 실패" }, { status: 400, headers: CORS })
    }

    const { userKey, name: encName, email: encEmail } = userData.success
    let name = null
    let email = null
    try { if (encName) name = await decrypt(encName) } catch {}
    try { if (encEmail) email = await decrypt(encEmail) } catch {}

    return Response.json({ userKey, name, email, accessToken }, { status: 200, headers: CORS })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: CORS })
  }
})
