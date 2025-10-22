// src/app/api/products/[id]/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createRouteHandlerClient({ cookies })

  // Auth session al
  const {
    data: { session }
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  try {
    // 1️⃣ Product + Category
    const { data: product, error: productError } = await supabase
      .from('Product')
      .select('*, category:Category(*)')
      .eq('id', id)
      .maybeSingle()

    if (productError) throw productError
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    // 2️⃣ UserFavorites
    let isProductFavorited = false
    if (userId) {
      const { data: favorites } = await supabase
        .from('UserFavorites')
        .select('*')
        .eq('productId', id)
        .eq('userId', userId)

      isProductFavorited = (favorites ?? []).length > 0
    }

    // 3️⃣ CartItems
    let isInCart = false
    if (userId) {
      // 1️⃣ Kullanıcının cart'ını al
      const { data: userCart, error: cartError } = await supabase
        .from('Cart')
        .select('id')
        .eq('userId', userId)
        .maybeSingle()

      if (cartError) throw cartError

      // 2️⃣ Eğer cart varsa, ürün cartItems içinde mi kontrol et
      if (userCart?.id) {
        const { data: cartItems, error: itemsError } = await supabase
          .from('CartItem')
          .select('*')
          .eq('cartId', userCart.id)
          .eq('productId', id)

        if (itemsError) throw itemsError

        isInCart = (cartItems ?? []).length > 0
      }
    }

    const managedProduct = {
      ...product,
      isProductFavorited,
      isInCart
    }

    return NextResponse.json(managedProduct)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
