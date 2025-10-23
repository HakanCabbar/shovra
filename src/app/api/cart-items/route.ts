import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const { productId } = await req.json()
    if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 })

    // 1️⃣ Aktif sepeti al veya oluştur
    const { data: cartData, error: cartError } = await supabase.from('Cart').select('id').eq('userId', userId).single()

    if (cartError && cartError.code !== 'PGRST116') throw cartError

    let cartId = cartData?.id
    if (!cartId) {
      const { data: newCart, error: createError } = await supabase.from('Cart').insert({ userId }).select('id').single()
      if (createError) throw createError
      cartId = newCart.id
    }

    // 2️⃣ Sepete ekle
    const { data: newItem, error: itemError } = await supabase
      .from('CartItem')
      .insert({ cartId, productId, quantity: 1 })
      .select('id, productId, quantity')
      .single()

    if (itemError) throw itemError

    return NextResponse.json({
      message: 'Added to cart',
      item: newItem
    })
  } catch (err: any) {
    console.error('POST /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const { cartItemId } = await req.json()

    if (!cartItemId) {
      return NextResponse.json({ error: 'Missing cartItemId' }, { status: 400 })
    }

    // 1️⃣ Kullanıcının aktif sepetini al
    const { data: cartData, error: cartError } = await supabase
      .from('Cart')
      .select('id, totalPrice, totalQuantity')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData) return NextResponse.json({ error: 'Cart not found', status: 404 })

    const cartId = cartData.id

    const { error: deleteError } = await supabase.from('CartItem').delete().eq('id', cartItemId)
    if (deleteError) throw deleteError

    const { data: remainingItems, error: itemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(id,name,description,price,imageUrl)')
      .eq('cartId', cartId)

    if (itemsError) throw itemsError

    const totalQuantity = remainingItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = remainingItems.reduce((acc, i) => acc + i.quantity * (i.product[0]?.price ?? 0), 0)

    const { error: updateError } = await supabase.from('Cart').update({ totalQuantity, totalPrice }).eq('id', cartId)

    if (updateError) throw updateError

    return NextResponse.json({
      message: 'Cart item removed',
      items: remainingItems,
      totalPrice,
      totalQuantity
    })
  } catch (err: any) {
    console.error('DELETE /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
