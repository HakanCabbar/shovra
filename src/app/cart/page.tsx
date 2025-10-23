'use client'

// ** React and Hooks
import { useState } from 'react'
import { useFetch } from '@/lib/hooks/useFetch'

// ** Next.js Imports
import Link from 'next/link'
import Image from 'next/image'

// ** Third-Party Libraries
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FaTrash } from 'react-icons/fa'

// ** Components
import { Button } from '../components/ui/Button'
import { CartItem } from '../components/ui/CartItem'

// ** Types
type CartData = {
  id: string
  items: CartItemType[]
  totalPrice: number
  totalQuantity: number
}

export type CartItemType = {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string
  }
  loadingItemId?: string | null
  onUpdateQuantity: (productId: string, action: 'increase' | 'decrease') => void
  onRemove?: (productId: string) => void
}

type RemoveItemParams = {
  cartItemId: string
  productId: string
}

export default function CartPage() {
  const queryClient = useQueryClient()
  const previousCart = queryClient.getQueryData<CartData>(['cart'])

  // ** Fetch cart data
  const {
    data: cart,
    isLoading,
    isError,
    refetch
  } = useFetch<CartData>({
    queryKey: ['cart'],
    url: '/api/cart'
  })

  // ** Local states
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  // ** Mutations
  const updateQuantity = useMutation({
    mutationFn: async ({ productId, action }: { productId: string; action: 'increase' | 'decrease' }) => {
      setLoadingItemId(productId)
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, action })
      })
      if (!res.ok) throw new Error('Failed to update cart')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Cart updated successfully')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Something went wrong')
    },
    onSettled: () => setLoadingItemId(null)
  })

  const removeItem = useMutation({
    mutationFn: async ({ cartItemId, productId }: RemoveItemParams) => {
      setLoadingItemId(productId)
      const res = await fetch('/api/cart-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId })
      })
      if (!res.ok) throw new Error('Failed to remove item')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Item removed successfully')
      refetch()
    },
    onError: (err: any) => toast.error(err.message || 'Failed to remove item'),
    onSettled: () => setLoadingItemId(null)
  })

  const clearCart = useMutation({
    mutationFn: async () => {
      setClearing(true)
      const res = await fetch('/api/cart', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to clear cart')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Cart cleared successfully')
      refetch()
    },
    onError: (err: any) => toast.error(err.message || 'Failed to clear cart'),
    onSettled: () => setClearing(false)
  })

  const skeletonCount = previousCart?.items?.length || 3

  // ** Error state
  if (!isLoading && (isError || !cart)) {
    return <p className='text-center mt-10 text-red-600'>Cart not found!</p>
  }

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Cart</h1>

      {isLoading ? (
        <div className='flex flex-col gap-6'>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <CartItem key={i} loading={true} />
          ))}
        </div>
      ) : cart?.items.length === 0 ? (
        <div className='flex flex-col items-center justify-center text-center mt-20 gap-4'>
          <Image src='/images/empty-cart.svg' alt='Empty cart' width={160} height={160} />
          <h2 className='text-2xl font-semibold mb-2'>Your cart is empty</h2>
          <p className='text-gray-500 max-w-sm mb-6'>
            Looks like you haven’t added anything yet. Start exploring our products and find something you love!
          </p>
          <Link href='/home' className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all'>
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          <div className='flex flex-col gap-6'>
            {cart?.items.map(item => (
              <CartItem
                key={item.id}
                item={item}
                loadingItemId={loadingItemId}
                onUpdateQuantity={(productId, action) => updateQuantity.mutate({ productId, action })}
                onRemove={() => removeItem.mutate({ cartItemId: item.id, productId: item.product.id })}
              />
            ))}
          </div>

          <div className='mt-8 flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='text-lg sm:text-xl font-semibold text-gray-800'>
              Total: <span className='text-2xl font-bold'>${cart?.totalPrice.toFixed(2)}</span>
            </div>
            <Button
              variant='red'
              icon={<FaTrash />}
              loading={clearing}
              onClick={() => clearCart.mutate()}
              className='mt-2 sm:mt-0'
            >
              Clear Cart
            </Button>
          </div>
        </>
      )}
    </main>
  )
}
