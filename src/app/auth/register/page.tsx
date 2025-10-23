'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'
// Yup validation schema (Değişiklik yok)
const registerSchema = yup
  .object({
    name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: yup.string().email('Please enter a valid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords do not match')
      .required('Password confirmation is required')
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

  // onSubmit fonksiyonu (Değişiklik yok)
  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
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
    // EKLENDİ: Formu sayfanın tamamında ortalamak için ana sarmalayıcı
    <main className='min-h-screen w-full flex items-center justify-center bg-gray-100 p-4'>
      <form
        onSubmit={handleSubmit(onSubmit)}
        // DEĞİŞTİRİLDİ: Daha iyi boşluk ve sağlam genişlik için class'lar güncellendi
        className='bg-white shadow-lg rounded-2xl p-8 w-full max-w-md flex flex-col gap-6'
      >
        <div className='flex flex-col items-center text-center'>
          <Image
            src='/images/shovra-logo-black.png'
            alt='Shovra Logo'
            width={80}
            height={80}
            className='object-contain mb-4' // Logo ile başlık arasına boşluk eklendi
          />
          <h1 className='text-3xl font-bold text-gray-800'>Register</h1>
          <p className='text-gray-500 mt-2'>Create your account to get started.</p>
        </div>
        {/* Başlık alanı (Yapısal değişiklik yok, zaten ortalı) */}

        {/* Input alanı (Yapısal değişiklik yok) */}
        <div className=' flex flex-col justify-center space-y-4'>
          <div className='space-y-2'>
            <input
              type='text'
              placeholder='Name'
              {...register('name')}
              className='w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            {errors.name && <p className='text-red-500 text-xs'>{errors.name.message}</p>}
          </div>

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

          <div className='space-y-2'>
            <input
              type='password'
              placeholder='Confirm Password'
              {...register('confirmPassword')}
              autoComplete='new-password'
              className='w-full p-3 border rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400'
            />
            {errors.confirmPassword && <p className='text-red-500 text-xs'>{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Button ve Link alanı (Yapısal değişiklik yok) */}
        <div className='space-y-4'>
          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-lg transition-colors'
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <p className='text-center text-gray-500'>
            Already have an account?{' '}
            <Link href='/auth/login' className='text-indigo-600 hover:underline font-medium'>
              Login
            </Link>
          </p>
        </div>
      </form>
    </main>
  )
}
