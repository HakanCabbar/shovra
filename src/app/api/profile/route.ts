// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, email, password } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, {
      email,
      password,
      user_metadata: { name }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: data })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}
