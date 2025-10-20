// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password, name } = body

  const { data, error } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name
      }
    }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
