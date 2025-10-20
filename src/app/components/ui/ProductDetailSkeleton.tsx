import React from 'react'

const ProductDetailSkeleton = () => {
  return (
    <main className='max-w-6xl mx-auto animate-pulse'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800 bg-gray-200 rounded-lg w-48 h-8'></h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='w-full h-96 bg-gray-200 rounded-lg shadow-md' />

        <div className='flex flex-col space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-3/4'></div>
          <div className='h-6 bg-gray-200 rounded w-1/3'></div>
          <div className='h-24 bg-gray-200 rounded w-full'></div>

          <div className='flex gap-4 mt-4'>
            <div className='h-10 bg-gray-200 rounded-lg w-32'></div>
            <div className='h-10 bg-gray-200 rounded-lg w-40'></div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProductDetailSkeleton
