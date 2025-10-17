'use client'

import Image from 'next/image'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApp } from '../providers'

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
}

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const {
    data: products = [],
    isLoading,
    isError
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Ürünler yüklenemedi')
      return res.json()
    }
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Silme işlemi başarısız')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Silme işlemi tamamlandı')
    },
    onError: error => {
      toast.error(error.message)
    }
  })

  if (isLoading) return <p className='text-center mt-10'>Yükleniyor...</p>
  if (isError) return <p className='text-center mt-10 text-red-600'>Hata oluştu!</p>

  return (
    <main className='max-w-5xl mx-auto py-12 px-4'>
      <h1 className='text-4xl font-bold mb-8 text-center'>Products</h1>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {products.map(p => (
          <article
            key={p.id}
            className='border rounded-lg p-4 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition transform hover:-translate-y-1 duration-200 bg-white'
          >
            {p.imageUrl && (
              <div className='relative w-full h-48 mb-4 rounded overflow-hidden'>
                <img src={p.imageUrl} alt={p.name} className='object-cover' sizes='(max-width: 768px) 100vw, 33vw' />
              </div>
            )}
            c<h2 className='font-semibold text-lg'>{p.name}</h2>
            <p className='text-sm text-slate-600 mt-1 line-clamp-3'>{p.description}</p>
            <p className='mt-2 font-medium text-black'>${p.price.toFixed(2)}</p>
            <button
              onClick={() => deleteMutation.mutate(p.id)}
              disabled={deleteMutation.status === 'pending'}
              className='mt-3 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition'
            >
              {deleteMutation.status === 'pending' ? 'Siliniyor...' : 'Sil'}
            </button>
          </article>
        ))}
      </div>
    </main>
  )
}
