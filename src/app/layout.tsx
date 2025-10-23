// ** Styles / Assets
import './styles/globals.css'

// ** Components
import Header from './components/shared/Header'
import Footer from './components/shared/Footer'

// ** Third-Party Libraries
import { Toaster } from 'react-hot-toast'

// ** Providers / Custom Hooks
import Providers from './providers'

// ** Next.js / Supabase
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Shovra',
  description: 'E-commerce platform'
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ** Supabase Client
  const supabase = createServerComponentClient({ cookies })

  // ** Get Logged-in User
  const { data } = await supabase.auth.getUser()
  const userData = data?.user ?? null

  // ** Determine Role
  let role: string | null = null
  if (userData?.id) {
    const { data: userRole } = await supabase.from('UserRoles').select('roleId').eq('userId', userData.id).single()

    if (userRole?.roleId) {
      const { data: roleRow } = await supabase.from('Roles').select('name').eq('id', userRole.roleId).single()
      role = roleRow?.name ?? null
    }
  }

  // ** Construct User Object
  const user = {
    id: userData?.id ?? null,
    name: userData?.user_metadata?.name ?? null,
    email: userData?.email ?? null,
    role
  }

  // ** Render Layout
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
