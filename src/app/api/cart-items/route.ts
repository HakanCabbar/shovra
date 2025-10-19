import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    // Aktif sepeti bul veya oluştur
    let cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: { include: { product: true } } }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } }
      })
    }

    // Sepette var mı kontrol et
    const existingItem = cart.items.find(item => item.productId === productId)

    if (existingItem) {
      await prisma.cartItem.delete({ where: { id: existingItem.id } })

      // Kalan ürünleri kontrol et
      const remainingItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true }
      })

      if (remainingItems.length === 0) {
        await prisma.cart.delete({ where: { id: cart.id } })
        return NextResponse.json({
          message: 'Removed from cart and cart deleted',
          items: [],
          totalPrice: 0,
          totalQuantity: 0
        })
      }

      // Cart toplamlarını güncelle
      const totalQuantity = remainingItems.reduce((acc, i) => acc + i.quantity, 0)
      const totalPrice = remainingItems.reduce((acc, i) => acc + i.quantity * i.product.price, 0)

      await prisma.cart.update({
        where: { id: cart.id },
        data: { totalQuantity, totalPrice }
      })

      return NextResponse.json({ message: 'Removed from cart', items: remainingItems, totalPrice, totalQuantity })
    }

    // Sepete ekle
    const newItem = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity: 1 },
      include: { product: true }
    })

    const updatedItems = [...cart.items, newItem]
    const totalQuantity = updatedItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.quantity * i.product.price, 0)

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalQuantity, totalPrice }
    })

    return NextResponse.json({ message: 'Added to cart', items: updatedItems, totalPrice, totalQuantity })
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
      // Item sil
      await prisma.cartItem.delete({ where: { id: item.id } })
    } else {
      // Quantity güncelle
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: updatedQuantity }
      })
    }

    // Cart toplamlarını yeniden hesapla
    const updatedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true }
    })

    if (updatedItems.length === 0) {
      await prisma.cart.delete({ where: { id: cart.id } })
      return NextResponse.json({ message: 'Cart is empty and deleted' })
    }

    const totalQuantity = updatedItems.reduce((acc, i) => acc + i.quantity, 0)
    const totalPrice = updatedItems.reduce((acc, i) => acc + i.quantity * i.product.price, 0)

    await prisma.cart.update({
      where: { id: cart.id },
      data: { totalQuantity, totalPrice }
    })

    return NextResponse.json({ message: 'Cart updated', cart: { totalQuantity, totalPrice, items: updatedItems } })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

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

    if (!cart) return NextResponse.json({ items: [], totalPrice: 0, totalQuantity: 0 })

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
