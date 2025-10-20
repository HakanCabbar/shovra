'use client'

import Image from 'next/image'
import { FaPlus, FaMinus, FaTrash, FaSpinner } from 'react-icons/fa'
import { CartItemSkeleton } from './CartItemSkeleton'
import { CartItemType } from '@/app/cart/page'

interface CartItemProps {
  item?: CartItemType
  loadingItemId?: string | null
  onUpdateQuantity?: (productId: string, action: 'increase' | 'decrease') => void
  onRemove?: (productId: string) => void
  loading?: boolean
}

export const CartItem = ({ item, loadingItemId, onUpdateQuantity, onRemove, loading = false }: CartItemProps) => {
  if (loading) return <CartItemSkeleton />

  const { productId, quantity, product } = item!

  return (
    <div className='flex sm:gap-4 gap-4 border rounded-xl p-2 shadow-sm hover:shadow-md transition'>
      <div>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={128}
            height={128}
            className='object-cover rounded-xl h-full'
          />
        ) : (
          <div className='bg-gray-200 w-[128px] h-[128px] flex items-center justify-center rounded-xl text-gray-500 font-semibold'>
            No Image
          </div>
        )}
      </div>

      <div className='flex justify-between w-full'>
        <div className='flex flex-col justify-between'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-lg font-semibold line-clamp-2'>{product.name}</h2>
            <p className='text-gray-700 font-medium'>${product.price.toFixed(2)}</p>
          </div>

          <div className='flex items-center gap-2 mt-2'>
            <button
              disabled={loadingItemId === productId}
              onClick={() => onUpdateQuantity?.(productId, 'decrease')}
              className='bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 w-6 h-6 flex items-center justify-center rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs'
            >
              {loadingItemId === productId ? (
                <FaSpinner className='animate-spin text-xs' />
              ) : (
                <FaMinus className='text-xs' />
              )}
            </button>

            <span className='px-2 text-gray-800 font-medium text-sm'>{quantity}</span>

            <button
              disabled={loadingItemId === productId}
              onClick={() => onUpdateQuantity?.(productId, 'increase')}
              className='bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 w-6 h-6 flex items-center justify-center rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs'
            >
              {loadingItemId === productId ? (
                <FaSpinner className='animate-spin text-xs' />
              ) : (
                <FaPlus className='text-xs' />
              )}
            </button>
          </div>
        </div>

        <div className='flex flex-col justify-between'>
          <div className='flex flex-col justify-between items-end ml-auto h-full'>
            {onRemove && (
              <button onClick={() => onRemove(productId)} className='text-red-600 hover:text-red-800 text-lg'>
                <FaTrash />
              </button>
            )}

            <div className='font-semibold text-gray-800 text-lg mt-auto'>${(product.price * quantity).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
