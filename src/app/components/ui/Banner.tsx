'use client'

// ** React And Hooks
import { useState, useEffect } from 'react'

// ** Next.js Imports
import Image from 'next/image'

interface BannerProps {
  images: string[]
  intervalMs?: number
}

export default function Banner({ images, intervalMs = 4000 }: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(interval)
  }, [images.length, intervalMs])

  return (
    <div className='relative w-full h-[300px] sm:h-[400px] mb-10 overflow-hidden rounded-2xl shadow-md'>
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image src={src} alt={`Banner ${i + 1}`} fill className='object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent' />
        </div>
      ))}

      {/* Dots */}
      <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2'>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${i === currentIndex ? 'bg-white' : 'bg-gray-400/60'}`}
          />
        ))}
      </div>
    </div>
  )
}
