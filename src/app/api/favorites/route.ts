// app/api/favorites/route.ts
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

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const existing = await prisma.userFavorites.findFirst({
      where: { userId, productId }
    })

    if (existing) {
      await prisma.userFavorites.delete({
        where: { id: existing.id }
      })
      return NextResponse.json({ message: 'Removed from favorites', isFavorited: false })
    }

    const favorite = await prisma.userFavorites.create({
      data: { userId, productId }
    })

    return NextResponse.json({ message: 'Added to favorites', isFavorited: true, favorite })
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

    // Kullanıcının sepetini al
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true }
    })

    // Favori ürünleri al
    const favorites = await prisma.userFavorites.findMany({
      where: { userId },
      include: { Product: true }
    })

    // Her ürünün sepette olup olmadığını ekle
    const products = favorites.map(fav => {
      const product = fav.Product
      const isInCart = cart?.items.some(item => item.productId === product.id) ?? false
      return {
        ...product,
        isInCart
      }
    })

    return NextResponse.json(products)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
