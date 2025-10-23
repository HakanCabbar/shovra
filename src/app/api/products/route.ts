import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const url = new URL(req.url)

    const categories = url.searchParams.getAll('category')
    const search = url.searchParams.get('search') || undefined
    const skip = parseInt(url.searchParams.get('skip') || '0')
    const take = parseInt(url.searchParams.get('take') || '20')

    let query = supabase.from('Product').select('*, Category(*)')

    if (categories.length > 0) {
      query = query.in('categoryId', categories)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    query = query.order('createdAt', { ascending: false }).range(skip, skip + take - 1)

    const { data: products, error } = await query

    if (error) throw error

    return NextResponse.json(products)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) return NextResponse.json({ error: 'Image required' }, { status: 400 })

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = fileName

    // ✅ Auth context taşıyan supabase ile işlem
    const { error: uploadError } = await supabase.storage.from('Shovra').upload(filePath, file)
    const { data: publicData } = supabase.storage.from('Shovra').getPublicUrl(filePath)

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string

    const { data, error } = await supabase.from('Product').insert([
      {
        name,
        description,
        price,
        categoryId,
        imageUrl: publicData.publicUrl,
        is_active: true
      }
    ])

    const anyError = uploadError || error

    if (anyError) {
      const text = anyError.message?.toLowerCase() ?? ''
      if (text.includes('violates row-level security')) {
        return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 })
      }

      return NextResponse.json({ error: anyError.message || 'An unexpected error occurred.' }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Catch error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    const { data: existingCartItem, error: cartCheckError } = await supabase
      .from('CartItem')
      .select('*')
      .eq('productId', id)
      .maybeSingle()

    if (cartCheckError) throw cartCheckError

    if (existingCartItem) {
      return NextResponse.json(
        {
          success: false,
          message: `The product you are trying to delete is currently in a user's cart.`
        },
        { status: 400 }
      )
    }

    // 2️⃣ Sepette değilse ürünü sil
    const { data: deletedProduct, error: deleteError } = await supabase
      .from('Product')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle() // 👈 .single() yerine .maybeSingle() kullan

    if (deleteError) throw deleteError

    // 3️⃣ RLS nedeniyle data null dönmüşse (yani user yetkili değilse)
    if (!deletedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: 'You do not have permission to delete this product.'
        },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true, product: deletedProduct })
  } catch (err: any) {
    console.error('DELETE /api/products error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
