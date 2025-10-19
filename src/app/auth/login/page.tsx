'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'

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
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-sm mx-auto mt-20'>
      <h1 className='text-2xl font-bold text-center'>Login</h1>

      <div>
        <input
          type='email'
          placeholder='Email'
          {...register('email')}
          className='w-full p-2 border rounded  text-black placeholder-gray-400'
        />
        {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
      </div>

      <div>
        <input
          type='password'
          placeholder='Password'
          {...register('password')}
          className='w-full p-2 border rounded  text-black placeholder-gray-400'
        />
        {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
      </div>

      <button type='submit' disabled={isSubmitting} className='w-full bg-black text-white p-2 rounded'>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
