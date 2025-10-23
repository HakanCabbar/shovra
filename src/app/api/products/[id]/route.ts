import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const userId = session?.user?.id

  try {
    const { data: product, error: prodError } = await supabase
      .from('Product')
      .select('*, category:categoryId(name)')
      .eq('id', id)
      .maybeSingle()
    if (prodError) throw prodError
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

    let isProductFavorited = false
    if (userId) {
      const { data: favs, error: favError } = await supabase
        .from('UserFavorites')
        .select('id')
        .eq('productId', id)
        .eq('userId', userId)
      if (favError) throw favError
      isProductFavorited = (favs?.length ?? 0) > 0
    }

    let cartItemId: string | null = null
    let isInCart = false
    if (userId) {
      const { data: carts, error: cartError } = await supabase.from('Cart').select('id').eq('userId', userId).limit(1)
      if (cartError) throw cartError

      const cartId = carts?.[0]?.id
      if (cartId) {
        const { data: cartItems, error: cartItemsError } = await supabase
          .from('CartItem')
          .select('id')
          .eq('cartId', cartId)
          .eq('productId', id)
        if (cartItemsError) throw cartItemsError

        if (cartItems && cartItems.length > 0) {
          cartItemId = cartItems[0].id
          isInCart = true
        }
      }
    }

    return NextResponse.json({
      ...product,
      isProductFavorited,
      isInCart,
      cartItemId
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
