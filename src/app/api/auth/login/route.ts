import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    const supabase = createRouteHandlerClient({ cookies })

    // 1️⃣ Supabase ile giriş yap
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    const user = data.user
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2️⃣ Kullanıcının rolünü al
    const { data: userRole } = await supabase.from('UserRoles').select('roleId').eq('userId', user.id).single()

    let roleName: string | null = null

    if (userRole?.roleId) {
      const { data: roleRow } = await supabase.from('Roles').select('name').eq('id', userRole.roleId).single()

      roleName = roleRow?.name ?? null
    }

    if (roleName) {
      cookies().set('userRole', roleName, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      })
    }

    return NextResponse.json({ success: true, role: roleName })
  } catch (err: any) {
    console.error('POST /api/auth/login error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
