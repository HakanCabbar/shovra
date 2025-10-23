'use client'

// ** React And Hooks
import { useState } from 'react'
import { useFetch } from '@/lib/hooks/useFetch'

// ** Next.js Imports
import Image from 'next/image'

// ** Third-Party Libraries
import { toast } from 'react-hot-toast'
import { FaRegStar, FaShoppingCart, FaStar } from 'react-icons/fa'

// ** Components
import ProductDetailSkeleton from '@/app/components/ui/ProductDetailSkeleton'

// ** App Context / Custom Hooks
import { useApp } from '@/app/providers'
import { Button } from '@/app/components/ui/SharedButton'

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
  cartItemId: string
}

interface Props {
  params: { id: string }
}

export default function ProductDetailPage({ params }: Props) {
  // ** State Hooks
  const [addingToCart, setAddingToCart] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  // ** App / Custom Hooks
  const { user } = useApp()

  // ** Params
  const { id } = params

  // ** React Query / Fetch Hooks
  const {
    data: product,
    isLoading,
    isError,
    refetch
  } = useFetch<Product>({
    queryKey: ['product', id],
    url: `/api/products/${id}`
  })

  // ** Handlers
  const handleToggleCart = async () => {
    if (!product) return
    try {
      setAddingToCart(true)

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
      setAddingToCart(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    try {
      setFavoriteLoading(true)

      const method = product.isProductFavorited ? 'DELETE' : 'POST'

      const res = await fetch('/api/favorites', {
        method,
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

  // ** Error / Loading States
  if (isLoading) return <ProductDetailSkeleton />
  if (isError || !product) return <p className='text-center mt-10 text-red-600'>Product not found!</p>

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Product Detail</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='relative w-full h-96 rounded-lg overflow-hidden shadow-md'>
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className='object-cover' />
          ) : (
            <div className='flex items-center justify-center w-full h-full bg-gray-200'>No Image</div>
          )}
        </div>

        <div className='flex flex-col'>
          <h1 className='text-3xl font-bold mb-2'>{product.name}</h1>
          <p className='text-2xl text-black font-semibold mb-4'>${product.price.toFixed(2)}</p>
          <p className='text-gray-700 mb-6'>{product.description}</p>

          {user?.role && (
            <div className='flex gap-4 items-center justify-between sm:justify-start'>
              <Button
                variant={product.isInCart ? 'red' : 'black'}
                loading={addingToCart}
                icon={<FaShoppingCart className='w-4 h-4' />}
                onClick={handleToggleCart}
              >
                {product.isInCart ? 'In Cart' : 'Add to Cart'}
              </Button>

              <Button
                variant='yellow'
                loading={favoriteLoading}
                icon={product.isProductFavorited ? <FaStar className='w-4 h-4' /> : <FaRegStar className='w-4 h-4' />}
                onClick={handleToggleFavorite}
              >
                {product.isProductFavorited ? 'Favorited' : 'Add to Favorites'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
