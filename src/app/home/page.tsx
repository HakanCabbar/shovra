'use client'

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useApp } from '../providers'
import ProductCard from '../components/ui/ProductCard'
import { useState, useRef, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Trash2 } from 'lucide-react'
import Banner from '../components/ui/Banner'
import { InlineSpinner } from '../components/ui/inline-spinner'
import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl?: string
}

type Category = {
  id: string
  name: string
}

const PAGE_SIZE = 10

export default function ProductsPage() {
  const { user } = useApp()
  const queryClient = useQueryClient()
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [selectedCategory, setSelectedCategory] = useState<string[]>([])
  const loaderRef = useRef<HTMLDivElement>(null)

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400) // 400ms delay after typing stops

    return () => clearTimeout(handler)
  }, [search])

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Failed to load categories')
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

  const handleDelete = (id: string) => {
    setDeletingIds(prev => [...prev, id])
    deleteMutation.mutate(id, {
      onSettled: () => setDeletingIds(prev => prev.filter(pid => pid !== id))
    })
  }

  // 🔹 Products Infinite Query
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useInfiniteQuery<
    Product[],
    Error
  >({
    queryKey: ['products', selectedCategory, debouncedSearch],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()
      params.append('skip', String(pageParam))
      params.append('take', String(PAGE_SIZE))

      if (selectedCategory && selectedCategory.length > 0) {
        selectedCategory.forEach(cat => params.append('category', cat))
      }

      if (debouncedSearch) params.append('search', debouncedSearch)

      const res = await fetch(`/api/products?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load products')
      return res.json()
    },
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined),
    initialPageParam: 0
  })

  // 🔹 Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    if (loaderRef.current) observer.observe(loaderRef.current)
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (loaderRef.current) observer.unobserve(loaderRef.current)
    }
  }, [fetchNextPage, hasNextPage])

  const bannerImages = [
    '/images/garden-supplies-banner.png',
    '/images/tech-banner.png',
    '/images/home-decoration-banner.png'
  ]

  if (isError) return <p className='text-center mt-10 text-red-600'>An error occurred!</p>

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Home</h1>

      <Banner images={bannerImages} />

      {/* 🔹 Categories Tabs */}
      <div className='flex gap-2 mb-6 flex-wrap'>
        {categories?.map(c => {
          const isSelected = selectedCategory?.includes(c.id)
          return (
            <button
              key={c.id}
              className={`px-3 py-1 rounded-md whitespace-nowrap text-sm font-medium transition-colors
              ${isSelected ? 'bg-black text-white' : 'bg-gray-200 text-black'}
              w-full sm:w-auto`}
              onClick={() => {
                if (!selectedCategory) setSelectedCategory([c.id])
                else if (isSelected) setSelectedCategory(selectedCategory.filter(id => id !== c.id))
                else setSelectedCategory([...selectedCategory, c.id])
              }}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      {/* 🔹 Search */}
      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search products...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          className='w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* 🔹 Products Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
        {isLoading ? (
          Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductCard key={i} isLoading />)
        ) : data?.pages.flat().length === 0 ? (
          <div className='flex flex-col items-center justify-center text-center mt-20 gap-4 col-span-full'>
            <Image src='/images/no-data.svg' alt='No products' width={160} height={160} />
            <h2 className='text-2xl font-semibold mb-2'>No products found</h2>
            <p className='text-gray-500 max-w-sm mb-6'>
              There are no products matching your selected filters or search criteria.
            </p>
          </div>
        ) : (
          data?.pages
            .flat()
            .map(p => (
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
            ))
        )}
      </div>

      {/* 🔹 Loader */}
      <div ref={loaderRef} className='text-center mt-4'>
        {isFetchingNextPage && <InlineSpinner />}
      </div>
    </main>
  )
}
