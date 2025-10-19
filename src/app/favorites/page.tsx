'use client'

import { useQuery } from '@tanstack/react-query'
import ProductCard from '../components/ui/ProductCard'
import toast from 'react-hot-toast'
import { useState } from 'react'

export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isInCart: boolean
}

export default function FavoritesPage() {
  const [cartLoadingIds, setCartLoadingIds] = useState<string[]>([])
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([])

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

  if (isLoading) return <p className='text-center mt-10 text-gray-600 animate-pulse'>Loading your favorites...</p>
  if (isError) return <p className='text-center mt-10 text-red-600'>An error occurred while loading your favorites.</p>
  if (!products || products.length === 0)
    return (
      <div className='text-center mt-20'>
        <p className='text-lg text-gray-600 mb-4'>You don’t have any favorite products yet 💔</p>
        <p className='text-sm text-gray-400'>Add products you like to your favorites and see them here.</p>
      </div>
    )

  return (
    <main className='max-w-6xl mx-auto py-12 px-4'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>My Favorites ⭐</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            actionButtons={
              <div className='flex gap-2 mt-2 justify-between'>
                {/* Sepete ekle / çıkar */}
                <button
                  onClick={e => {
                    e.stopPropagation() // 🔹 Bu satır eklenmeli
                    handleToggleCart(product.id, product.isInCart)
                  }}
                  disabled={cartLoadingIds.includes(product.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium ${
                    product.isInCart
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-black text-white hover:bg-gray-800'
                  } transition`}
                >
                  {cartLoadingIds.includes(product.id)
                    ? 'Processing...'
                    : product.isInCart
                      ? 'Remove from Cart'
                      : 'Add to Cart'}
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation() // 🔹 Bu satır eklenmeli
                    handleRemoveFavorite(product.id)
                  }}
                  disabled={favoriteLoadingIds.includes(product.id)}
                  className='flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition'
                >
                  {favoriteLoadingIds.includes(product.id) ? 'Removing...' : 'Remove from Favorites'}
                </button>
              </div>
            }
          />
        ))}
      </div>
    </main>
  )
}
