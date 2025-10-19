'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApp } from '../providers'
import ProductCard from '../components/ui/ProductCard'
import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Trash2 } from 'lucide-react'

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
  const [deletingIds, setDeletingIds] = useState<string[]>([])

  const previousProducts = queryClient.getQueryData<Product[]>(['products'])

  const {
    data: products,
    isLoading,
    isError
  } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products')
      if (!res.ok) throw new Error('Failed to load products')
      return res.json()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to delete product')
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product successfully deleted')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product')
    }
  })

  const handleDelete = async (id: string) => {
    setDeletingIds(prev => [...prev, id])
    deleteMutation.mutate(id, {
      onSettled: () => {
        setDeletingIds(prev => prev.filter(pid => pid !== id))
      }
    })
  }

  if (isError) return <p className='text-center mt-10 text-red-600'>An error occurred!</p>

  const skeletonCount = previousProducts?.length || 8

  return (
    <main className='max-w-6xl mx-auto py-12 px-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, i) => <ProductCard key={i} isLoading />)
          : products?.map(p => (
              <ProductCard
                key={p.id}
                product={p as any}
                deleteButton={
                  user?.role === 'admin' && (
                    <Button
                      variant='red'
                      icon={<Trash2 className='w-3.5 h-3.5' />}
                      loading={deletingIds.includes(p.id)}
                      onClick={() => handleDelete(p.id)}
                    />
                  )
                }
              />
            ))}
      </div>
    </main>
  )
}
