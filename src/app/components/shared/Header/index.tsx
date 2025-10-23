'use client'

import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/app/providers'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiMenu, FiX } from 'react-icons/fi'
import Image from 'next/image'

export default function Header() {
  const { user, setUser } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
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
      setUser(null)
      setMenuOpen(false)
      router.push('/auth/login')
    }
  }

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim().length > 0) {
      const parts = name.trim().split(' ').filter(Boolean)
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }

    if (email) {
      const namePart = email.split('@')[0]
      const parts = namePart.split(/[\.\-_]/).filter(Boolean)
      if (parts.length === 0) return email[0].toUpperCase()
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }

    return 'U'
  }

  return (
    <header className='bg-black text-white px-4 py-3 flex justify-between items-center relative'>
      <Link
        href='/home'
        // DEĞİŞTİ: Logoyu ve metni hizalamak için flexbox eklendi
        className='inline-flex items-center gap-3 transition-all duration-300 group' // 'group' anasıfını ekledik
      >
        <Image
          src='/images/shovra-logo.png'
          alt='Shovra Logo'
          width={75}
          height={75}
          // DEĞİŞTİ: Hover efekti artık 'group-hover' ile tetiklenecek
          className='bg-transparent group-hover:drop-shadow-[0_0_20px_white] transition-all duration-300'
        />

        {/* EKLENDİ: Logo sağındaki metin */}
        <span
          className='
      text-white text-3xl font-bold tracking-tight 
      group-hover:text-gray-200 transition-colors duration-300
    '
          // 'text-3xl font-bold tracking-tight' "güzel font" görünümü için öneridir.
          // Dilerseniz (text-2xl, font-semibold, vb.) değiştirebilirsiniz.
        >
          Shovra
        </span>
      </Link>

      {/* Hamburger Button */}
      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className='lg:hidden text-white text-2xl focus:outline-none'
        aria-label='Toggle menu'
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Navigation */}
      <nav
        className={`${
          menuOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none lg:pointer-events-auto lg:opacity-100 lg:translate-y-0'
        } 
        absolute lg:static top-[64px] left-0 w-full lg:w-auto bg-black lg:bg-transparent 
        flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-6 py-4 lg:py-0 px-6 lg:px-0 transition-all duration-300 z-40`}
      >
        {user?.role && (
          <>
            <Link
              href='/favorites'
              onClick={() => setMenuOpen(false)}
              className='hover:text-gray-300 transition font-medium w-full lg:w-auto text-left whitespace-nowrap'
            >
              Favorites
            </Link>
            <Link
              href='/cart'
              onClick={() => setMenuOpen(false)}
              className='hover:text-gray-300 transition font-medium w-full lg:w-auto text-left whitespace-nowrap'
            >
              Cart
            </Link>
          </>
        )}

        {user?.role === 'admin' && (
          <Link
            href='/admin/products/create'
            onClick={() => setMenuOpen(false)}
            className='hover:text-gray-300 transition font-medium w-full lg:w-auto text-left whitespace-nowrap'
          >
            Create Product
          </Link>
        )}

        {/* Account */}
        <div className='w-full lg:w-auto' ref={dropdownRef}>
          {user?.role ? (
            <div className='relative inline-block'>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-haspopup='true'
                aria-expanded={dropdownOpen}
                className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-medium hover:bg-purple-700 relative transition focus:outline-none'
              >
                {getInitials(user.name)}
              </button>

              {/* Dropdown Box */}
              <div
                className={`absolute mt-3 w-64 bg-white text-black rounded-xl shadow-lg py-4 z-50 transform transition-all duration-200
                  ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                  left-0 lg:right-0 lg:left-auto 
                `}
              >
                <div className='px-5 pb-4 border-b border-gray-200 flex flex-col gap-1'>
                  {user.name && <p className='font-semibold text-sm text-gray-800 truncate'>{user.name}</p>}
                  <p className='text-sm text-gray-600 truncate'>{user.email}</p>
                  <p className='text-xs text-gray-400 capitalize truncate'>{user.role}</p>
                </div>

                <div className='flex flex-col mt-2'>
                  <Link
                    href='/profile'
                    onClick={() => {
                      setDropdownOpen(false)
                      setMenuOpen(false)
                    }}
                    className='flex items-center gap-2 px-5 py-2 hover:bg-gray-100 transition text-sm font-medium rounded-lg'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-4 h-4 text-gray-500'
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
                    className='flex items-center gap-2 px-5 py-2 hover:bg-gray-100 transition text-left text-sm font-medium w-full rounded-lg'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='w-4 h-4 text-gray-500'
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
            </div>
          ) : (
            <Link
              href='/auth/login'
              onClick={() => setMenuOpen(false)}
              className='hover:text-gray-300 transition font-medium w-full text-left'
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
