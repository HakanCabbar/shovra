'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApp } from '../providers'
import ProductCard from '../components/ui/ProductCard'

type Product = {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
}

export default function ProductsPage() {
  const { user } = useApp()
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
      if (!res.ok) throw new Error(data.error || 'Silme işlemi başarısız')
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
    <main className='max-w-6xl mx-auto py-12 px-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            isAdmin={user?.role === 'admin'}
            onDelete={id => deleteMutation.mutate(id)}
            deleting={deleteMutation.status === 'pending'}
          />
        ))}
      </div>
    </main>
  )
}
