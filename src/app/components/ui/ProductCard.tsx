'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Product } from '../../favorites/page'

interface Props {
  product: Product
  actionButtons?: React.ReactNode
  onClick?: () => void
}

export default function ProductCard({ product, actionButtons, onClick }: Props) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) return onClick()
    router.push(`/products/${product.id}`)
  }

  return (
    <article
      onClick={handleClick}
      className='relative border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 duration-200 bg-white flex flex-col cursor-pointer'
    >
      {product.imageUrl && (
        <div className='relative w-full h-48'>
          <Image src={product.imageUrl} alt={product.name} fill className='object-cover' />
          <div className='absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded font-semibold'>
            ${product.price.toFixed(2)}
          </div>
        </div>
      )}

      <div className='p-4 flex flex-col flex-1'>
        <h2 className='font-semibold text-lg mb-1'>{product.name}</h2>
        <p className='text-sm text-slate-600 flex-1 line-clamp-3'>{product.description}</p>

        {actionButtons && <div className='mt-2'>{actionButtons}</div>}
      </div>
    </article>
  )
}
