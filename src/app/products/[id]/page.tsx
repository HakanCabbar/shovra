'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { FaHeart, FaRegHeart, FaShoppingCart } from 'react-icons/fa'

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
  images?: string[]
  category?: Category
  isProductFavorited: boolean
}
interface Props {
  params: { id: string }
}

export default function ProductDetailPage({ params }: Props) {
  // ** States
  const [addingToCart, setAddingToCart] = useState(false)

  const { id } = params

  // ** Hooks
  const {
    data: product,
    isLoading,
    refetch,
    isError
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`)
      if (!res.ok) throw new Error('Ürün yüklenemedi')
      return res.json()
    }
  })

  const handleAddToCart = async () => {
    if (!product) return
    try {
      setAddingToCart(true)
      await new Promise(resolve => setTimeout(resolve, 500)) // demo delay
      toast.success(`${product.name} sepete eklendi!`)
    } catch (err) {
      toast.error('Sepete ekleme başarısız!')
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
        toast.error(data.error || 'Bir hata oluştu')
      }
    } catch (err) {
      toast.error('Favorilere ekleme başarısız!')
    }
  }

  if (isLoading) return <p className='text-center mt-10'>Yükleniyor...</p>
  if (isError || !product) return <p className='text-center mt-10 text-red-600'>Ürün bulunamadı!</p>

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
            {/* Sepete ekle: ikon + yazı */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className='flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition'
            >
              <FaShoppingCart />
              {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
            </button>

            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition text-xl ${
                product.isProductFavorited
                  ? 'text-yellow-400' // favori ise sarı yıldız
                  : 'text-gray-400 hover:text-gray-600' // favori değilse gri yıldız
              }`}
              aria-label={product.isProductFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
            >
              {product.isProductFavorited ? '⭐' : '☆'}
            </button>
          </div>
        </div>
      </div>

      {product.images && product.images.length > 0 && (
        <div className='mt-8 grid grid-cols-4 gap-4'>
          {product.images.map((img, idx) => (
            <div key={idx} className='relative w-full h-24 rounded overflow-hidden shadow-sm'>
              <Image src={img} alt={`Extra ${idx}`} fill className='object-cover' />
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
