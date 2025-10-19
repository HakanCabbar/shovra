'use client'

import { FaSpinner } from 'react-icons/fa'

export function PageSpinner({ size = 40 }: { size?: number }) {
  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
      <FaSpinner className='animate-spin text-black' size={size} />
    </div>
  )
}
