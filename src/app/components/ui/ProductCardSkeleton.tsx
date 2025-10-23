const ProductCardSkeleton = () => {
  return (
    <article className='border rounded-lg overflow-hidden shadow-md animate-pulse bg-white flex flex-col cursor-pointer'>
      <div className='w-full h-48 bg-gray-300' />

      <div className='p-4 flex flex-col flex-1 justify-between'>
        <div>
          <div className='h-5 bg-gray-300 rounded w-3/4 mb-2' />
          <div className='h-4 bg-gray-200 rounded w-full mb-1' />
          <div className='h-4 bg-gray-200 rounded w-5/6 mb-1' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </div>

        <div className='mt-4 flex flex-wrap gap-2 justify-start'>
          <div className='h-8 w-20 bg-gray-300 rounded' />
        </div>
      </div>
    </article>
  )
}

export default ProductCardSkeleton
