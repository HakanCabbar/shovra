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
      .select('id, totalPrice, totalQuantity')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData) return NextResponse.json({ items: [], totalPrice: 0, totalQuantity: 0 })

    const cartId = cartData.id

    const { data: items, error: itemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(id,name,description,price,imageUrl)')
      .eq('cartId', cartId)

    if (itemsError) throw itemsError

    return NextResponse.json({
      id: cartId,
      items,
      totalPrice: cartData.totalPrice,
      totalQuantity: cartData.totalQuantity
    })
  } catch (err: any) {
    console.error('GET /cart-items error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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

    const { data: cartData, error: cartError } = await supabase
      .from('Cart')
      .select('id, totalQuantity, totalPrice')
      .eq('userId', userId)
      .maybeSingle()

    if (cartError) throw cartError
    if (!cartData) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const cartId = cartData.id

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

    const { data: updatedItems, error: updatedItemsError } = await supabase
      .from('CartItem')
      .select('id, productId, quantity, product:productId(price)')
      .eq('cartId', cartId)

    if (updatedItemsError) throw updatedItemsError

    const totalQuantity = updatedItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.quantity * (i.product[0]?.price ?? 0), 0)

    const { error: cartUpdateError } = await supabase
      .from('Cart')
      .update({ totalQuantity, totalPrice })
      .eq('id', cartId)
    if (cartUpdateError) throw cartUpdateError

    if (totalQuantity === 0) {
      const { error: cartDeleteError } = await supabase.from('Cart').delete().eq('id', cartId)
      if (cartDeleteError) throw cartDeleteError
      return NextResponse.json({
        message: 'Cart is empty and deleted',
        cart: { totalQuantity: 0, totalPrice: 0, items: [] }
      })
    }

    return NextResponse.json({ message: 'Cart updated', cart: { totalQuantity, totalPrice, items: updatedItems } })
  } catch (err: any) {
    console.error('PATCH /cart-items error:', err)
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
