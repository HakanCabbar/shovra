'use client'

// ** Next.js Imports
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ** Types / App Imports
import { Product } from '../../favorites/page'

// ** Components
import ProductCardSkeleton from './ProductCardSkeleton'

interface Props {
  product?: Product
  actionButtons?: React.ReactNode
  deleteButton?: React.ReactNode
  onClick?: () => void
  isLoading?: boolean
}

export default function ProductCard({ product, actionButtons, deleteButton, onClick, isLoading }: Props) {
  const router = useRouter()

  if (isLoading) {
    return <ProductCardSkeleton />
  }

  const handleClick = () => {
    if (onClick) return onClick()
    if (!product) return
    router.push(`/products/${product.id}`)
  }

  return (
    <article
      onClick={handleClick}
      className='relative border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-200 bg-white flex flex-col cursor-pointer'
    >
      {deleteButton && <div className='absolute top-2 right-2 z-10'>{deleteButton}</div>}

      {product?.imageUrl && (
        <div className='relative w-full h-48'>
          <Image src={product.imageUrl} alt={product.name} fill className='object-cover' />
          <div className='absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded font-semibold'>
            ${product.price.toFixed(2)}
          </div>
        </div>
      )}

      <div className='p-4 flex flex-col flex-1 justify-between'>
        <div>
          <h2 className='font-semibold text-lg mb-1'>{product?.name}</h2>
          <p className='text-sm text-slate-600 line-clamp-3'>{product?.description}</p>
        </div>

        {actionButtons && <div className='mt-4 flex flex-wrap gap-2 justify-start'>{actionButtons}</div>}
      </div>
    </article>
  )
}
