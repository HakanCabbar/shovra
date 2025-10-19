'use client'

import Image from 'next/image'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FaPlus, FaMinus, FaTrash, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import { useState } from 'react'

type CartItem = {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    imageUrl?: string
  }
}

type CartData = {
  id: string
  items: CartItem[]
  totalPrice: number
  totalQuantity: number
}

export default function CartPage() {
  const {
    data: cart,
    refetch,
    isLoading,
    isError
  } = useQuery<CartData>({
    queryKey: ['cart'],
    queryFn: async () => {
      const res = await fetch('/api/cart')
      if (!res.ok) throw new Error('Failed to fetch cart')
      return res.json()
    }
  })

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

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
    onSuccess: data => {
      toast.success('Cart updated successfully')
      refetch()
    },
    onError: (err: any) => {
      toast.error(err.message || 'Something went wrong')
    },
    onSettled: () => {
      setLoadingItemId(null)
    }
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
    onError: (err: any) => {
      toast.error(err.message || 'Failed to clear cart')
    },
    onSettled: () => {
      setClearing(false)
    }
  })

  if (isLoading) return <p className='text-center mt-10'>Loading...</p>
  if (isError || !cart) return <p className='text-center mt-10 text-red-600'>Cart not found!</p>

  return (
    <main className='max-w-4xl mx-auto py-12 px-4'>
      <h1 className='text-3xl font-bold mb-6'>Your Cart</h1>

      {cart.items.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <Image
            src='/images/empty-cart.svg'
            alt='Empty cart'
            className='w-40 h-40 mb-6 opacity-80'
            width={12}
            height={12}
          />
          <h2 className='text-2xl font-semibold mb-2'>Your cart is empty</h2>
          <p className='text-gray-500 max-w-sm mb-6'>
            Looks like you haven’t added anything yet. Start exploring our products and find something you love!
          </p>
          <Link href='/home' className='px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all'>
            Browse Products
          </Link>
        </div>
      )}

      <div className='flex flex-col gap-6'>
        {cart.items.map(item => (
          <div key={item.id} className='flex items-center gap-4 border-b pb-4'>
            <div className='w-24 h-24 relative'>
              {item.product.imageUrl ? (
                <Image src={item.product.imageUrl} alt={item.product.name} fill className='object-cover rounded' />
              ) : (
                <div className='bg-gray-200 w-full h-full flex items-center justify-center rounded'>No Image</div>
              )}
            </div>

            <div className='flex-1'>
              <h2 className='text-lg font-semibold'>{item.product.name}</h2>
              <p className='text-gray-700'>${item.product.price.toFixed(2)}</p>
            </div>

            <div className='flex items-center gap-2'>
              <button
                disabled={loadingItemId === item.productId}
                onClick={() => updateQuantity.mutate({ productId: item.productId, action: 'decrease' })}
                className='bg-gray-200 p-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loadingItemId === item.productId ? <FaSpinner className='animate-spin' /> : <FaMinus />}
              </button>
              <span className='px-3'>{item.quantity}</span>
              <button
                disabled={loadingItemId === item.productId}
                onClick={() => updateQuantity.mutate({ productId: item.productId, action: 'increase' })}
                className='bg-gray-200 p-2 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loadingItemId === item.productId ? <FaSpinner className='animate-spin' /> : <FaPlus />}
              </button>
            </div>

            <div className='ml-6 font-semibold'>${(item.product.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {cart.items.length > 0 && (
        <>
          <div className='mt-8 flex justify-end items-center gap-6'>
            <span className='text-lg font-semibold'>Total:</span>
            <span className='text-2xl font-bold'>${cart.totalPrice.toFixed(2)}</span>
          </div>
          <div className='mt-4 flex justify-end'>
            <button
              disabled={clearing}
              onClick={() => clearCart.mutate()}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {clearing ? <FaSpinner className='animate-spin' /> : <FaTrash />} Clear Cart
            </button>
          </div>
        </>
      )}
    </main>
  )
}
