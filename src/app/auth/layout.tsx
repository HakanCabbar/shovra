import Link from 'next/link'
import Header from '../components/shared/Header'
import Footer from '../components/shared/Footer'

export const metadata = {
  title: 'Shovra Auth',
  description: 'Authentication pages for Shovra'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='fixed inset-0 flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white'>
      {/* Header */}
      <Header />

      {/* Ortadaki içerik */}
      <div className='flex-1 flex items-center justify-center relative overflow-hidden'>
        {/* Dekoratif gradient blur daireler */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-32 -left-32 w-80 h-80 bg-purple-600/40 blur-3xl rounded-full animate-pulse' />
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 blur-3xl rounded-full animate-pulse delay-1000' />
        </div>

        {/* İçerik kutusu */}
        <div className='relative z-10 w-full max-w-md px-8 py-10 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10'>
          <div className='text-center mb-8'>
            <Link
              href='/home'
              className='font-extrabold text-3xl tracking-tight text-white hover:text-gray-300 transition'
            >
              Shovra
            </Link>
            <p className='text-sm text-gray-300 mt-2'>Modern alışveriş deneyimi, sade tasarım.</p>
          </div>

          {children}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
