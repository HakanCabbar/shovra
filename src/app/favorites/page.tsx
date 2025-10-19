'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import ProductCard from '../components/ui/ProductCard'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { Button } from 'app/components/ui/button'

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isInCart: boolean
}

export default function FavoritesPage() {
  const queryClient = useQueryClient()
  const [cartLoadingIds, setCartLoadingIds] = useState<string[]>([])
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([])

  const previousFavorites = queryClient.getQueryData<Product[]>(['favorites'])

  const {
    data: products,
    isLoading,
    isError,
    refetch
  } = useQuery<Product[]>({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load favorites')
      return res.json()
    }
  })

  const handleToggleCart = async (productId: string, isInCart: boolean) => {
    try {
      setCartLoadingIds(prev => [...prev, productId])
      const res = await fetch('/api/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || (isInCart ? 'Removed from cart!' : 'Added to cart!'))
        refetch()
      } else {
        toast.error(data.error || 'Failed to update cart!')
      }
    } catch {
      toast.error('Failed to update cart!')
    } finally {
      setCartLoadingIds(prev => prev.filter(id => id !== productId))
    }
  }

  const handleRemoveFavorite = async (productId: string) => {
    try {
      setFavoriteLoadingIds(prev => [...prev, productId])
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Removed from favorites!')
        refetch()
      } else {
        toast.error(data.error || 'Failed to update favorites!')
      }
    } catch {
      toast.error('Failed to update favorites!')
    } finally {
      setFavoriteLoadingIds(prev => prev.filter(id => id !== productId))
    }
  }

  if (isError) {
    return <p className='text-center mt-10 text-red-600'>An error occurred while loading your favorites.</p>
  }

  if (!isLoading && (!products || products.length === 0)) {
    return (
      <div className='text-center mt-20'>
        <p className='text-lg text-gray-600 mb-4'>You don’t have any favorite products yet 💔</p>
        <p className='text-sm text-gray-400'>Add products you like to your favorites and see them here.</p>
      </div>
    )
  }

  // Dinamik skeleton sayısı
  const skeletonCount = previousFavorites?.length || 6

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>My Favorites ⭐</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCard key={i} isLoading />)
          : products?.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                actionButtons={
                  <div className='flex gap-2 mt-2 justify-between w-full'>
                    <Button
                      variant={product.isInCart ? 'red' : 'black'}
                      loading={cartLoadingIds.includes(product.id)}
                      onClick={() => handleToggleCart(product.id, product.isInCart)}
                    >
                      {product.isInCart ? 'Remove From Cart' : 'Add to Cart'}
                    </Button>

                    <Button
                      variant='yellow'
                      loading={favoriteLoadingIds.includes(product.id)}
                      onClick={() => handleRemoveFavorite(product.id)}
                    >
                      Remove From Favorites
                    </Button>
                  </div>
                }
              />
            ))}
      </div>
    </main>
  )
}
