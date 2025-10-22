import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProductForm from '../../../components/admin/CreateProductForm'

export default async function CreateProductPage() {
  const supabase = createRouteHandlerClient({ cookies })

  const { data: categories, error } = await supabase.from('Category').select('*').order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories:', error)
    return <p>Error loading categories</p>
  }

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Create Product</h1>
      <div className='max-w-lg mx-auto mt-12 bg-white p-6 rounded-2xl shadow-md'>
        <ProductForm categories={categories} />
      </div>
    </main>
  )
}
