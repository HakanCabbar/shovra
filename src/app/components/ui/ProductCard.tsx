'use client'

import Image from 'next/image'
import { Trash2, ShoppingCart, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  isProductFavorited?: boolean
}

interface Props {
  product: Product
  isAdmin?: boolean
  onDelete?: (id: string) => void
  deleting?: boolean
  /** Favoriler sayfasında gösterilecek "Favoriden kaldır" butonu */
  showFavoriteActions?: boolean
  /** "Sepete ekle" butonunu göster */
  showAddToCartButton?: boolean
  refetch?: () => void
}

export default function ProductCard({
  product,
  isAdmin,
  onDelete,
  deleting,
  showFavoriteActions = false,
  showAddToCartButton = false,
  refetch
}: Props) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  const handleClick = () => {
    router.push(`/products/${product.id}`)
  }

  const handleRemoveFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setRemoving(true)
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id })
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message)
        refetch?.()
      } else {
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setRemoving(false)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation()
    toast.success('Sepete eklendi 🛒')
  }

  return (
    <article
      onClick={handleClick}
      className='relative border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-200 bg-white flex flex-col cursor-pointer'
    >
      {product.imageUrl && (
        <div className='relative w-full h-48'>
          <Image
            src={product.imageUrl}
            alt={product.name}
            className='object-cover w-full h-full'
            fill
            sizes='(max-width: 768px) 100vw, 33vw'
          />
          <div className='absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded font-semibold'>
            ${product.price.toFixed(2)}
          </div>

          {isAdmin && onDelete && (
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete(product.id)
              }}
              disabled={deleting}
              className='absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 p-1 rounded-full transition'
              title='Ürünü sil'
            >
              <Trash2 className='w-4 h-4 text-white' />
            </button>
          )}
        </div>
      )}

      <div className='p-4 flex flex-col flex-1'>
        <h2 className='font-semibold text-lg mb-1'>{product.name}</h2>
        <p className='text-sm text-slate-600 flex-1 line-clamp-3'>{product.description}</p>
        {(showFavoriteActions || showAddToCartButton) && (
          <div className='flex gap-2 mt-2 justify-between'>
            {showFavoriteActions && (
              <button
                onClick={handleRemoveFavorite}
                disabled={removing}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
          ${
            removing
              ? 'bg-yellow-200 text-yellow-700 cursor-not-allowed'
              : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
          }`}
              >
                <Star className='w-3.5 h-3.5' />
                {removing ? 'Kaldırılıyor...' : 'Kaldır'}
              </button>
            )}

            {showAddToCartButton && (
              <button
                onClick={handleAddToCart}
                disabled={false}
                className='flex items-center justify-center gap-1.5 bg-black text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-gray-800 transition-all'
              >
                <ShoppingCart className='w-3.5 h-3.5' />
                Sepete Ekle
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
