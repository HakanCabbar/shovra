import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)

    // Çoklu kategoriyi array olarak al
    const categories = url.searchParams.getAll('category')
    const search = url.searchParams.get('search') || undefined
    const skip = parseInt(url.searchParams.get('skip') || '0')
    const take = parseInt(url.searchParams.get('take') || '20') // default 20

    const products = await prisma.product.findMany({
      where: {
        ...(categories.length > 0 && { categoryId: { in: categories } }),
        ...(search && { name: { contains: search, mode: 'insensitive' } })
      },
      orderBy: { createdAt: 'desc' },
      include: { category: true },
      skip,
      take
    })

    return NextResponse.json(products)
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    if (!file) return NextResponse.json({ error: 'Image required' }, { status: 400 })

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `Products/${fileName}`

    const { error: uploadError } = await supabaseAdmin.storage.from('Products').upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: publicData } = supabaseAdmin.storage.from('Products').getPublicUrl(filePath)

    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const categoryId = formData.get('categoryId') as string

    const { data, error } = await supabaseAdmin.from('Product').insert([
      {
        name,
        description,
        price,
        categoryId,
        imageUrl: publicData.publicUrl,
        is_active: true
      }
    ])

    if (error) return NextResponse.json({ error }, { status: 400 })

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json() // body üzerinden alıyoruz

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Ürün herhangi bir sepette mi kontrol et
    const existingCartItem = await prisma.cartItem.findFirst({
      where: { productId: id }
    })

    if (existingCartItem) {
      return NextResponse.json(
        {
          success: false,
          message: `The product you are trying to delete is currently in a user's cart.`
        },
        { status: 400 }
      )
    }

    // Sepette değilse sil
    const product = await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, product })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
