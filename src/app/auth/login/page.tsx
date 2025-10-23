'use client'

// ** React Hook Form
import { useForm } from 'react-hook-form'

// ** Next.js imports
import Link from 'next/link'
import Image from 'next/image'

// ** Validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Third-party libraries
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// ** Validation schema
const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

type LoginFormInputs = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  // ** Supabase client
  const supabase = createClientComponentClient()

  // ** React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema)
  })

  // ** Handlers
  const onSubmit = async (formData: LoginFormInputs) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Login failed')
        return
      }

      toast.success('Login successful!')
      window.location.href = '/home'
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  // ** JSX
  return (
    <main className='min-h-screen w-full flex items-center justify-center bg-gray-100 p-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className='bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-6'
      >
        <div className='flex flex-col items-center text-center'>
          <Image
            src='/images/shovra-logo-black.png'
            alt='Shovra Logo'
            width={80}
            height={80}
            className='object-contain mb-4'
          />
          <h1 className='text-3xl font-bold text-gray-800'>Login</h1>
          <p className='text-gray-500 mt-2'>Welcome back! Please login to your account.</p>
        </div>

        <div className='flex flex-col justify-center space-y-4'>
          <div className='space-y-2'>
            <input
              type='email'
              placeholder='Email'
              {...register('email')}
              className='w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            {errors.email && <p className='text-red-500 text-xs'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <input
              type='password'
              placeholder='Password'
              {...register('password')}
              autoComplete='new-password'
              className='w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            {errors.password && <p className='text-red-500 text-xs'>{errors.password.message}</p>}
          </div>
        </div>

        <div className='space-y-4'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg transition-colors'
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>

          <p className='text-center text-gray-500'>
            Don&apos;t have an account?{' '}
            <Link href='/auth/register' className='text-indigo-600 hover:underline font-medium'>
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}
