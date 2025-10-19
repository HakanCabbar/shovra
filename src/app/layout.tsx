// app/layout.tsx
import './styles/globals.css'
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'
import { Toaster } from 'react-hot-toast'
import Providers from './providers'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Shovra',
  description: 'E-commerce platform'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  const { data } = await supabase.auth.getUser()
  const userData = data?.user ?? null

  let role: string | null = null

  if (userData?.id) {
    const { data: userRole } = await supabase.from('UserRoles').select('roleId').eq('userId', userData.id).single()

    if (userRole?.roleId) {
      const { data: roleRow } = await supabase.from('Roles').select('name').eq('id', userRole.roleId).single()
      role = roleRow?.name ?? null
    }
  }

  const user = {
    id: userData?.id ?? null,
    email: userData?.email ?? null,
    role
  }

  return (
    <html lang='en'>
      <body className='bg-gray-100 text-slate-900 min-h-screen flex flex-col'>
        <Providers initialUser={user}>
          <Header />
          <main className='bg-white flex-1 px-4 py-8 md:px-8 lg:px-16'>
            {children}
            <Toaster position='top-right' />
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
