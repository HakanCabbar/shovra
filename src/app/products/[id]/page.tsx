'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FaHeart, FaShoppingCart } from 'react-icons/fa'

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
        toast.success(data.message)
        refetch()
      } else {
        toast.error(data.error || 'An error occurred')
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
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
        refetch()
      } else {
        toast.error(data.error || 'An error occurred')
      }
    } catch {
      toast.error('Failed to update favorites!')
    }
  }

  if (isLoading) return <p className='text-center mt-10'>Loading...</p>
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
            <button
              onClick={handleToggleCart}
              disabled={addingToCart}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors duration-200 ${
                product.isInCart
                  ? 'bg-white border border-red-600 text-red-600 hover:bg-red-50'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <FaShoppingCart />
              {addingToCart ? 'Processing...' : product.isInCart ? 'In Cart' : 'Add to Cart'}
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition text-2xl ${
                product.isProductFavorited
                  ? 'text-yellow-400'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
              aria-label={product.isProductFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              {product.isProductFavorited ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
