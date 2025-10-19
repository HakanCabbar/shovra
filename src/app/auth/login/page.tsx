'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

// Yup validation schema
const loginSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
})

type LoginFormInputs = yup.InferType<typeof loginSchema>

export default function LoginPage() {
  const supabase = createClientComponentClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormInputs>({
    resolver: yupResolver(loginSchema)
  })

  const onSubmit = async (formData: LoginFormInputs) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Login successful!')
      window.location.href = '/home'
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='bg-white shadow-lg rounded-2xl p-8 w-[400px] h-[450px] flex flex-col justify-between gap-2'
    >
      {/* Title */}
      <div className='text-center'>
        <h1 className='text-3xl font-bold text-gray-800'>Login</h1>
        <p className='text-gray-500 mt-2'>Welcome back! Please login to your account.</p>
      </div>

      {/* Inputs */}
      <div className='flex-1 flex flex-col justify-center space-y-4'>
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
            className='w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400'
          />
          {errors.password && <p className='text-red-500 text-xs'>{errors.password.message}</p>}
        </div>
      </div>

      {/* Button + Link */}
      <div className='space-y-4'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg transition-colors'
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        <p className='text-center text-gray-500'>
          <p>Don&apos;t have an account?</p>
          <Link href='/auth/register' className='text-indigo-600 hover:underline font-medium'>
            Sign up
          </Link>
        </p>
      </div>
    </form>
  )
}
