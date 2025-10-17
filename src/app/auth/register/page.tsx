'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'

// Yup validation schema
const registerSchema = yup
  .object({
    email: yup.string().email('Please enter a valid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match')
      .required('Password confirmation is required'),
    name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required')
  })
  .required()

type RegisterFormInputs = yup.InferType<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name
        })
      })

      const result = await res.json()

      if (res.ok) {
        toast.success('Registration successful! Please verify your email.')
        router.push('/auth/login')
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch (err) {
      toast.error('An unexpected error occurred.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-sm mx-auto mt-20'>
      <h1 className='text-2xl font-bold text-center'>Register</h1>

      <div>
        <input type='text' placeholder='Name' {...register('name')} className='w-full p-2 border rounded' />
        {errors.name && <p className='text-red-500 text-sm'>{errors.name.message}</p>}
      </div>

      <div>
        <input type='email' placeholder='Email' {...register('email')} className='w-full p-2 border rounded' />
        {errors.email && <p className='text-red-500 text-sm'>{errors.email.message}</p>}
      </div>

      <div>
        <input type='password' placeholder='Password' {...register('password')} className='w-full p-2 border rounded' />
        {errors.password && <p className='text-red-500 text-sm'>{errors.password.message}</p>}
      </div>

      <div>
        <input
          type='password'
          placeholder='Confirm Password'
          {...register('confirmPassword')}
          className='w-full p-2 border rounded'
        />
        {errors.confirmPassword && <p className='text-red-500 text-sm'>{errors.confirmPassword.message}</p>}
      </div>

      <button type='submit' disabled={isSubmitting} className='w-full bg-black text-white p-2 rounded'>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}
