'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import ProductCard from '../components/ui/ProductCard'

export default function FavoritesPage() {
  const queryClient = useQueryClient()

  const {
    data: products,
    isLoading,
    refetch,
    isError
  } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites', { cache: 'no-store' })
      if (!res.ok) throw new Error('Favoriler yüklenemedi')
      return res.json()
    }
  })

  if (isLoading) return <p className='text-center mt-10 text-gray-600 animate-pulse'>Favoriler yükleniyor...</p>

  if (isError) return <p className='text-center mt-10 text-red-600'>Favoriler yüklenirken bir hata oluştu.</p>

  if (!products || products.length === 0)
    return (
      <div className='text-center mt-20'>
        <p className='text-lg text-gray-600 mb-4'>Henüz favori ürününüz yok 💔</p>
        <p className='text-sm text-gray-400'>Beğendiğiniz ürünleri favorilere ekleyerek burada görebilirsiniz.</p>
      </div>
    )

  return (
    <main className='max-w-6xl mx-auto py-12 px-4'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Favorilerim ⭐</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} showFavoriteActions showAddToCartButton refetch={refetch} />
        ))}
      </div>
    </main>
  )
}
