'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function Header() {
  const { user, setUser } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLLIElement | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const clearAllCookies = () => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.warn('supabase signOut hata:', error)
    } finally {
      try {
        clearAllCookies()
      } catch (err) {
        console.warn('cookie clear error:', err)
      }
      setUser(null) // user state sıfırla
      setMenuOpen(false)
      router.push('/auth/login')
    }
  }

  const getInitials = (email?: string | null) => {
    if (!email) return 'U'
    const namePart = email.split('@')[0]
    const parts = namePart.split(/[\.\-_]/).filter(Boolean)
    if (parts.length === 0) return email[0].toUpperCase()
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  return (
    <header className='bg-black text-white p-4 flex justify-between items-center relative'>
      {/* Logo / Home Link */}
      <Link href='/home' className='font-bold text-xl hover:text-gray-300 transition'>
        Shovra
      </Link>

      {/* Navigation */}
      <nav>
        <ul className='flex gap-6 items-center'>
          {/* Normal kullanıcı menüleri */}
          {user?.role && (
            <li>
              <Link href='/favorites' className='hover:text-gray-300 transition'>
                Favorites
              </Link>
            </li>
          )}

          {user?.role && (
            <li>
              <Link href='/cart' className='hover:text-gray-300 transition'>
                Cart
              </Link>
            </li>
          )}

          {/* Admin için Add Product */}
          {user?.role === 'admin' && (
            <li>
              <Link href='/admin/products/create' className='hover:text-gray-300 transition font-semibold'>
                Add Product
              </Link>
            </li>
          )}

          {/* Account / Login Dropdown */}
          <li className='relative' ref={menuRef}>
            {user?.role ? (
              <>
                <button
                  onClick={() => setMenuOpen(prev => !prev)}
                  aria-haspopup='true'
                  aria-expanded={menuOpen}
                  className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold hover:bg-gray-600 transition focus:outline-none'
                >
                  {getInitials(user.email)}
                </button>

                {/* Dropdown: scale+fade animation */}
                <div
                  className={`origin-top-right absolute right-0 mt-3 w-56 bg-white text-black rounded-xl shadow-xl py-3 z-50 transform transition-all duration-200 ${
                    menuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <div className='px-4 pb-2 border-b border-gray-200'>
                    <p className='font-semibold text-sm truncate'>{user.email}</p>
                    <p className='text-xs text-gray-500 capitalize truncate'>{user.role}</p>
                  </div>

                  <div className='flex flex-col py-1'>
                    <Link
                      href='/profile'
                      className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-sm'
                      onClick={() => setMenuOpen(false)}
                    >
                      {/* simple user svg */}
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.121 17.804z'
                        />
                        <path strokeLinecap='round' strokeLinejoin='round' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <span>Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className='flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition text-left text-sm'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                        strokeWidth={2}
                      >
                        <path strokeLinecap='round' strokeLinejoin='round' d='M17 16l4-4m0 0l-4-4m4 4H7' />
                        <path strokeLinecap='round' strokeLinejoin='round' d='M7 8v8' />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link href='/auth/login' className='hover:text-gray-300 transition'>
                Login
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  )
}
