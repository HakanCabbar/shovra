'use client'

import { FaSpinner } from 'react-icons/fa'

export function InlineSpinner({ size = 16 }: { size?: number }) {
  return (
    <FaSpinner
      className='inline-block animate-spin text-black'
      size={size} // piksel cinsinden boyut
    />
  )
}
