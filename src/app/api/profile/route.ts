import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name } = body
    const supabase = createRouteHandlerClient({ cookies }) // session destekli client

    if (!email && !password && !name) {
      return NextResponse.json({ error: 'At least one field is required' }, { status: 400 })
    }

    const { data, error } = await supabase.auth.updateUser({
      email,
      password,
      data: { name }
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
