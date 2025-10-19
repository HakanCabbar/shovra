import Link from 'next/link'
import Header from '../components/shared/Header'
import Footer from '../components/shared/Footer'

export const metadata = {
  title: 'Shovra Auth',
  description: 'Authentication pages for Shovra'
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='fixed inset-0 flex flex-col min-h-screen bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 text-white'>
      {/* Header */}
      <Header />

      {/* Ortadaki içerik */}
      <div className='flex-1 flex items-center justify-center relative overflow-hidden'>
        {/* Dekoratif gradient blur daireler */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-32 -left-32 w-80 h-80 bg-purple-400/40 blur-3xl rounded-full animate-pulse' />
          <div className='absolute bottom-0 right-0 w-96 h-96 bg-pink-400/30 blur-3xl rounded-full animate-pulse delay-1000' />
        </div>

        {/* İçerik kutusu */}
        {children}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
