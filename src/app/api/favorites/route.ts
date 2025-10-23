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

    const { data: carts, error: cartError } = await supabase.from('Cart').select('id').eq('userId', userId).limit(1)
    if (cartError) throw cartError

    const cartId = carts?.[0]?.id

    const products = await Promise.all(
      favoritesData.map(async (fav: any) => {
        const product = fav.Product
        let isInCart = false
        let cartItemId: string | undefined = undefined

        if (cartId) {
          const { data: cartItems, error: cartItemsError } = await supabase
            .from('CartItem')
            .select('id')
            .eq('cartId', cartId)
            .eq('productId', product.id)

          if (cartItemsError) throw cartItemsError

          if (cartItems && cartItems.length > 0) {
            cartItemId = cartItems[0].id
            isInCart = true
          }
        }

        return {
          ...product,
          isInCart,
          cartItemId,
          isProductFavorited: true
        }
      })
    )

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
