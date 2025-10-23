// app/404/page.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function NotFoundPage() {
  return (
    <main className=' h-full flex flex-col items-center justify-center bg-white text-center'>
      <div className='bg-white p-12 rounded-3xl shadow-md border border-gray-200 max-w-lg w-full flex flex-col items-center gap-6'>
        {/* SVG Illustration */}
        <div className='w-48 h-48 relative'>
          <Image src='/images/404.svg' alt='Page Not Found' fill style={{ objectFit: 'contain' }} />
        </div>

        <h1 className='text-7xl font-extrabold text-gray-800'>404</h1>
        <h2 className='text-3xl font-semibold text-gray-800'>Page Not Found</h2>
        <p className='text-gray-600 text-lg'>The page you are looking for does not exist or has been moved.</p>

        <Link
          href='/home'
          className='mt-6 inline-block bg-gray-800 hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-xl shadow transition-all duration-300'
        >
          Go Back Home
        </Link>
      </div>
    </main>
  )
}
