import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: categories, error } = await supabase.from('Category').select('*').order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(categories)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
