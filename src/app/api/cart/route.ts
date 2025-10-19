import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    })

    if (!cart) {
      return NextResponse.json({ items: [], totalPrice: 0, totalQuantity: 0 })
    }

    return NextResponse.json({
      id: cart.id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      totalQuantity: cart.totalQuantity
    })
  } catch (err: any) {
    console.error(err)
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

    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    })
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const item = cart.items.find(i => i.productId === productId)
    if (!item) return NextResponse.json({ error: 'Product not in cart' }, { status: 404 })

    let updatedQuantity = item.quantity
    if (action === 'increase') updatedQuantity += 1
    if (action === 'decrease') updatedQuantity -= 1

    if (updatedQuantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: updatedQuantity }
      })
    }

    const updatedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true }
    })

    if (updatedItems.length === 0) {
      await prisma.cart.delete({ where: { id: cart.id } })
      return NextResponse.json({ message: 'Cart is empty and deleted', items: [], totalPrice: 0, totalQuantity: 0 })
    }

    const totalQuantity = updatedItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.quantity * i.product.price, 0)

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalQuantity, totalPrice }
    })

    return NextResponse.json({ message: 'Cart updated', items: updatedItems, totalPrice, totalQuantity })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user?.id) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const userId = session.user.id

    const cart = await prisma.cart.findFirst({ where: { userId } })
    if (!cart) return NextResponse.json({ message: 'Cart already empty' })

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
    await prisma.cart.delete({ where: { id: cart.id } })

    return NextResponse.json({ message: 'Cart cleared', items: [], totalPrice: 0, totalQuantity: 0 })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
