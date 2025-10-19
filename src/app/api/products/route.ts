import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true } // kategori bilgisi de gelsin
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
