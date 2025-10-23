'use client'

export const CartItemSkeleton = () => {
  return (
    <div className='flex sm:gap-4 gap-4 border rounded-xl p-4 animate-pulse'>
      <div className='bg-gray-200 rounded-xl w-32 h-32'></div>

      <div className='flex flex-col justify-between w-full'>
        <div className='flex flex-col gap-2'>
          <div className='bg-gray-200 h-6 w-3/4 rounded'></div>
          <div className='bg-gray-200 h-5 w-1/4 rounded'></div>
        </div>

        <div className='flex items-center gap-2 mt-2'>
          <div className='bg-gray-200 w-6 h-6 rounded'></div>
          <div className='bg-gray-200 w-6 h-6 rounded'></div>
          <div className='bg-gray-200 w-6 h-6 rounded'></div>
        </div>
      </div>

      <div className='flex flex-col justify-between items-end ml-auto h-full'>
        <div className='bg-gray-200 w-6 h-6 rounded'></div>
        <div className='bg-gray-200 w-12 h-6 rounded mt-auto'></div>
      </div>
    </div>
  )
}
