// src/app/api/products/[id]/route.ts
import { prisma } from '@/lib/prisma'
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
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, UserFavorites: true }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const isProductFavorited = userId ? product.UserFavorites.some(fav => fav.userId === userId) : false

    const { UserFavorites, ...productData } = product

    const managedProduct = {
      ...productData,
      isProductFavorited
    }

    return NextResponse.json(managedProduct)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params

  try {
    const product = await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
