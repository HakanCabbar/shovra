// ** Next.js imports
import Link from 'next/link'
import Image from 'next/image'

export default function ForbiddenPage() {
  return (
    <main className='h-full flex flex-col items-center justify-center bg-white px-4 text-center'>
      <div className='bg-white p-12 rounded-3xl shadow-md border border-red-200 max-w-lg w-full flex flex-col items-center gap-6'>
        <div className='w-48 h-48 relative'>
          <Image src='/images/403.svg' alt='Access Denied' fill style={{ objectFit: 'contain' }} />
        </div>

        <h1 className='text-7xl font-extrabold text-red-600'>403</h1>
        <h2 className='text-3xl font-semibold text-gray-800'>Access Denied</h2>
        <p className='text-gray-600 text-lg'>You do not have permission to view this page.</p>

        <Link
          href='/home'
          className='mt-6 inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow transition-all duration-300'
        >
          Go Back Home
        </Link>
      </div>
    </main>
  )
}
