'use client'

// ** React And Hooks
import { useState } from 'react'

// ** React Query
import { useQueryClient } from '@tanstack/react-query'

// ** App Context / Custom Hooks
import { useApp } from '../providers'

// ** Third-Party UI / Toast
import toast from 'react-hot-toast'

// ** Next.js Imports
import Link from 'next/link'
import Image from 'next/image'

// ** Components
import ProductCard from '../components/ui/ProductCard'
import { useFetch } from '@/lib/hooks/useFetch'
import { Button } from '../components/ui/Button'

// ** Types
export type Product = {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isInCart: boolean
  cartItemId?: string
}

export default function FavoritesPage() {
  // ** State Hooks
  const [cartLoadingIds, setCartLoadingIds] = useState<string[]>([])
  const [favoriteLoadingIds, setFavoriteLoadingIds] = useState<string[]>([])

  // ** App / Custom Hooks
  const { user } = useApp()

  // ** React Query Hooks
  const queryClient = useQueryClient()
  const previousFavorites = queryClient.getQueryData<Product[]>(['favorites'])
  const {
    data: products,
    isLoading,
    isError,
    refetch
  } = useFetch<Product[]>({
    queryKey: ['favorites'],
    url: '/api/favorites'
  })

  // ** Handlers
  const handleToggleCart = async (product: Product) => {
    if (!product) return
    try {
      setCartLoadingIds(prev => [...prev, product.id])

      const method = product.isInCart ? 'DELETE' : 'POST'
      const body = product.isInCart
        ? JSON.stringify({ cartItemId: product.cartItemId })
        : JSON.stringify({ productId: product.id })

      const res = await fetch('/api/cart-items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || (product.isInCart ? 'Removed from cart!' : 'Added to cart!'))
        refetch()
      } else {
        toast.error(data.error || 'Failed to update cart!')
      }
    } catch {
      toast.error('Failed to update cart!')
    } finally {
      setCartLoadingIds(prev => prev.filter(id => id !== product.id))
    }
  }

  const handleRemoveFavorite = async (productId: string) => {
    try {
      setFavoriteLoadingIds(prev => [...prev, productId])
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
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

  // ** Error State
  if (isError) {
    return <p className='text-center mt-10 text-red-600'>An Error Occurred While Loading Your Favorites.</p>
  }

  // ** Derived Values
  const skeletonCount = previousFavorites?.length || 6

  // ** JSX / Return
  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Favorites</h1>

      {isLoading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCard key={i} isLoading />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center mt-20 gap-4'>
          <Image src='/images/favorite-item.svg' alt='No favorite items' width={124} height={124} />
          <h2 className='text-2xl font-semibold mb-2'>No Favorite Products Yet 💔</h2>
          <p className='text-gray-500 max-w-sm mb-6'>
            Add Products You Like To Your Favorites And They Will Appear Here.
          </p>
          <Link href='/home' className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all'>
            Browse Products
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {products?.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              actionButtons={
                user?.role && (
                  <div className='flex gap-2 mt-2 justify-between w-full'>
                    <Button
                      variant={product.isInCart ? 'red' : 'black'}
                      loading={cartLoadingIds.includes(product.id)}
                      onClick={() => handleToggleCart(product)}
                    >
                      {product.isInCart ? 'Remove From Cart' : 'Add To Cart'}
                    </Button>

                    <Button
                      variant='yellow'
                      loading={favoriteLoadingIds.includes(product.id)}
                      onClick={() => handleRemoveFavorite(product.id)}
                    >
                      Remove From Favorites
                    </Button>
                  </div>
                )
              }
            />
          ))}
        </div>
      )}
    </main>
  )
}
