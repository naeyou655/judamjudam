import "@supabase/functions-js/edge-runtime.d.ts"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  let userKey: number | null = null
  let referrer: string | null = null

  if (req.method === "GET") {
    const url = new URL(req.url)
    userKey  = Number(url.searchParams.get("userKey"))
    referrer = url.searchParams.get("referrer")
  } else {
    try {
      const body = await req.json()
      userKey  = body?.userKey
      referrer = body?.referrer
    } catch {}
  }

  console.log(`Toss unlink: userKey=${userKey}, referrer=${referrer}`)

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
  )
})
