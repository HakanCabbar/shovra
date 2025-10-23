import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id

    const { data: cartData, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData) return NextResponse.json({ items: [], totalPrice: 0, totalQuantity: 0 })

    const cartId = cartData.id

    const { data: items, error: itemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(id, name, price, imageUrl)')
      .eq('cartId', cartId)
      .order('id', { ascending: true })

    if (itemsError) throw itemsError

    const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = items.reduce((acc, i) => acc + i.quantity * (i.product[0]?.price ?? 0), 0)

    return NextResponse.json({
      id: cartId,
      items,
      totalQuantity,
      totalPrice
    })
  } catch (err: any) {
    console.error('GET /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id
    const { productId, action } = await req.json()

    if (!productId || !['increase', 'decrease'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 1️⃣ Aktif sepeti al
    const { data: cartData, error: cartError } = await supabase
      .from('Cart')
      .select('id, totalQuantity, totalPrice')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const cartId = cartData.id

    // 2️⃣ İlgili cartItem'ı al ve product fiyatını join et
    const { data: items, error: itemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(price)')
      .eq('cartId', cartId)
      .eq('productId', productId)

    if (itemsError) throw itemsError
    if (!items || items.length === 0) return NextResponse.json({ error: 'Product not in cart' }, { status: 404 })

    const item = items[0]
    let updatedQuantity = item.quantity
    if (action === 'increase') updatedQuantity += 1
    if (action === 'decrease') updatedQuantity -= 1

    // 3️⃣ Güncelle veya sil
    if (updatedQuantity <= 0) {
      const { error: deleteError } = await supabase.from('CartItem').delete().eq('id', item.id)
      if (deleteError) throw deleteError
    } else {
      const { error: updateError } = await supabase
        .from('CartItem')
        .update({ quantity: updatedQuantity })
        .eq('id', item.id)
      if (updateError) throw updateError
    }

    // 4️⃣ Sepeti yeniden hesapla
    const { data: updatedItems, error: updatedItemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(price)')
      .eq('cartId', cartId)

    if (updatedItemsError) throw updatedItemsError

    const totalQuantity = updatedItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.quantity * (i.product[0]?.price ?? 0), 0)

    // 5️⃣ Cart toplamlarını güncelle
    const { error: cartUpdateError } = await supabase
      .from('Cart')
      .update({ totalQuantity, totalPrice })
      .eq('id', cartId)
    if (cartUpdateError) throw cartUpdateError

    // 6️⃣ Sepet boşsa sil
    if (totalQuantity === 0) {
      const { error: cartDeleteError } = await supabase.from('Cart').delete().eq('id', cartId)
      if (cartDeleteError) throw cartDeleteError
      return NextResponse.json({ message: 'Cart is empty and deleted', items: [], totalPrice: 0, totalQuantity: 0 })
    }

    return NextResponse.json({ message: 'Cart updated', items: updatedItems, totalPrice, totalQuantity })
  } catch (err: any) {
    console.error('PATCH /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.user.id

    const { data: cartData, error: cartError } = await supabase
      .from('Cart')
      .select('id')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData)
      return NextResponse.json({ message: 'Cart already empty', items: [], totalPrice: 0, totalQuantity: 0 })

    const cartId = cartData.id

    const { error: deleteItemsError } = await supabase.from('CartItem').delete().eq('cartId', cartId)
    if (deleteItemsError) throw deleteItemsError

    const { error: deleteCartError } = await supabase.from('Cart').delete().eq('id', cartId)
    if (deleteCartError) throw deleteCartError

    return NextResponse.json({ message: 'Cart cleared', items: [], totalPrice: 0, totalQuantity: 0 })
  } catch (err: any) {
    console.error('DELETE /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
