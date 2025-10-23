'use client'

// ** React & Hooks
import { useState, useEffect, useRef } from 'react'

// ** Next.js
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// ** Third-Party Libraries
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FiMenu, FiX } from 'react-icons/fi'

// ** App Context
import { useApp } from '@/app/providers'

export default function Header() {
  // ** App / State Hooks
  const { user, setUser } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // ** Next.js / Supabase
  const router = useRouter()
  const supabase = createClientComponentClient()

  // ** Effects
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout error:', error)
    } finally {
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

  // ** Render
  return (
    <header className='bg-black text-white px-4 py-3 flex justify-between items-center relative'>
      <Link href='/home' className='inline-flex items-center gap-3 transition-all duration-300 group'>
        <Image
          src='/images/shovra-logo.png'
          alt='Shovra Logo'
          width={75}
          height={75}
          className='bg-transparent group-hover:drop-shadow-[0_0_20px_white] transition-all duration-300'
        />
        <span className='text-white text-3xl font-bold tracking-tight group-hover:text-gray-200 transition-colors duration-300'>
          Shovra
        </span>
      </Link>

      <button
        onClick={() => setMenuOpen(prev => !prev)}
        className='lg:hidden text-white text-2xl focus:outline-none'
        aria-label='Toggle menu'
      >
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

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
              className='hover:text-gray-300 transition font-bold tracking-tight text-base lg:text-lg'
            >
              Favorites
            </Link>
            <Link
              href='/cart'
              onClick={() => setMenuOpen(false)}
              className='hover:text-gray-300 transition font-bold tracking-tight text-base lg:text-lg'
            >
              Cart
            </Link>
          </>
        )}

        {user?.role === 'admin' && (
          <Link
            href='/admin/products/create'
            onClick={() => setMenuOpen(false)}
            className='hover:text-gray-300 transition font-bold tracking-tight text-base lg:text-lg'
          >
            Create Product
          </Link>
        )}

        <div className='w-full lg:w-auto' ref={dropdownRef}>
          {user?.role ? (
            <div className='relative inline-block'>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-haspopup='true'
                aria-expanded={dropdownOpen}
                className='w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white font-medium hover:bg-purple-700 relative transition focus:outline-none'
              >
                {getInitials(user.name, user.email)}
              </button>

              <div
                className={`absolute mt-3 w-64 bg-white text-black rounded-xl shadow-lg py-4 z-50 transform transition-all duration-200
                  ${dropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
                  left-0 lg:right-0 lg:left-auto`}
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
                    className='flex items-center gap-2 px-5 py-2 hover:bg-gray-100 transition text-left font-bold tracking-tight text-base rounded-lg'
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className='flex items-center gap-2 px-5 py-2 hover:bg-gray-100 transition text-left font-bold tracking-tight text-base rounded-lg'
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href='/auth/login'
              onClick={() => setMenuOpen(false)}
              className='hover:text-gray-300 transition font-bold tracking-tight text-base'
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
