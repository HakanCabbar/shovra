'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FaRegStar, FaShoppingCart, FaStar } from 'react-icons/fa'
import { Button } from 'app/components/ui/button'
import { PageSpinner } from '@/app/components/ui/page-spinner'

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category?: Category
  isProductFavorited: boolean
  isInCart: boolean
}

interface Props {
  params: { id: string }
}

export default function ProductDetailPage({ params }: Props) {
  const [addingToCart, setAddingToCart] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const { id } = params

  const {
    data: product,
    isLoading,
    refetch,
    isError
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('Failed to load product')
      return res.json()
    }
  })

  const handleToggleCart = async () => {
    if (!product) return
    try {
      setAddingToCart(true)
      const res = await fetch('/api/cart-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
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
      setAddingToCart(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    try {
      setFavoriteLoading(true)
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || (product.isProductFavorited ? 'Removed from favorites!' : 'Added to favorites!'))
        refetch()
      } else {
        toast.error(data.error || 'Failed to update favorites!')
      }
    } catch {
      toast.error('Failed to update favorites!')
    } finally {
      setFavoriteLoading(false)
    }
  }

  if (isLoading) return <PageSpinner size={40} />
  if (isError || !product) return <p className='text-center mt-10 text-red-600'>Product not found!</p>

  return (
    <main className='max-w-5xl mx-auto py-12 px-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Left: Image */}
        <div className='relative w-full h-96 rounded-lg overflow-hidden shadow-md'>
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className='object-cover' />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-gray-200'>No Image</div>
          )}
        </div>

        {/* Right: Info */}
        <div className='flex flex-col'>
          <h1 className='text-3xl font-bold mb-2'>{product.name}</h1>
          <p className='text-2xl text-black font-semibold mb-4'>${product.price.toFixed(2)}</p>
          <p className='text-gray-700 mb-6'>{product.description}</p>

          <div className='flex gap-4 items-center'>
            {/* Cart Button */}
            <Button
              variant={product.isInCart ? 'red' : 'black'}
              loading={addingToCart}
              icon={<FaShoppingCart className='w-4 h-4' />}
              onClick={handleToggleCart}
            >
              {product.isInCart ? 'In Cart' : 'Add to Cart'}
            </Button>

            {/* Favorite Button */}
            <Button
              variant='yellow'
              loading={favoriteLoading}
              icon={product.isProductFavorited ? <FaStar className='w-4 h-4' /> : <FaRegStar className='w-4 h-4' />}
              onClick={handleToggleFavorite}
            >
              {product.isProductFavorited ? 'Favorited' : 'Add to Favorites'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
