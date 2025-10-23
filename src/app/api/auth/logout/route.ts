// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  await supabase.auth.signOut()

  cookies().set('userRole', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(0)
  })

  return NextResponse.json({ success: true })
}
