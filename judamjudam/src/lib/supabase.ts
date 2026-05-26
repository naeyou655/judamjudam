import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://rjitdsdxcsxmmgsiitre.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXRkc2R4Y3N4bW1nc2lpdHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NzUxMTEsImV4cCI6MjA5NTA1MTExMX0.SSGJyP1szBHcJphbMnjFXXsdzxLLN-ioHt2NSAqkrlI'

export const db = createClient(SUPA_URL, SUPA_KEY)

export const CAT_MAP: Record<string, string> = {
  pick: '이달의 PICK',
  basics: '전통주 입문',
  field: '숨은 양조장 기행',
  essay: '에디터 노트',
}
