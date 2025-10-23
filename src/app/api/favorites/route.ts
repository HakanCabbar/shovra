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

    const { data: cartItemsData, error: cartError } = await supabase
      .from('CartItem')
      .select('productId')
      .eq('cartId', userId)

    if (cartError) throw cartError

    const cartProductIds = cartItemsData?.map((item: any) => item.productId) || []

    const { data: favoritesData, error: favError } = await supabase
      .from('UserFavorites')
      .select(
        `
    Product(
      id,
      name,
      description,
      price,
      imageUrl,
      categoryId
    )
  `
      )
      .eq('userId', userId)

    if (favError) throw favError

    const products = favoritesData.map((fav: any) => {
      const product = fav.Product
      const isInCart = cartProductIds.includes(product.id)
      return {
        ...product,
        isInCart,
        isProductFavorited: true
      }
    })

    return NextResponse.json(products)
  } catch (err: any) {
    console.error('GET /favorites error:', err)
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

    const { productId } = await req.json()
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('UserFavorites')
      .insert([{ userId: session.user.id, productId }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'Added to favorites', isFavorited: true, data })
  } catch (err: any) {
    console.error('POST /favorites error:', err)
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

    const { productId } = await req.json()
    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('UserFavorites')
      .delete()
      .eq('userId', session.user.id)
      .eq('productId', productId)

    if (error) throw error

    return NextResponse.json({ message: 'Removed from favorites', isFavorited: false })
  } catch (err: any) {
    console.error('DELETE /favorites error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
