'use client'

// ** React And Hooks
import { useEffect } from 'react'

// ** React Hook Form
import { useForm, SubmitHandler } from 'react-hook-form'

// ** Validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Third-Party Utilities
import { toast } from 'react-hot-toast'

// ** App Context / Custom Hooks
import { useApp } from '@/app/providers'

const schema = yup.object({
  name: yup.string().min(3, 'At least 3 characters').required('Required'),
  email: yup.string().email('Invalid email').required('Required'),
  password: yup
    .string()
    .transform(value => (value === '' ? undefined : value))
    .min(6, 'At least 6 characters')
    .notRequired()
})

type FormValues = {
  name: string
  email: string
  password: string | undefined
}

export default function ProfilePage() {
  // ** App / Custom Hooks
  const { user, setUser } = useApp()

  // ** Form Hooks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: '',
      email: '',
      password: undefined
    }
  })

  // ** Populate Form on User Load
  useEffect(() => {
    if (user) {
      reset({
        name: user.name ?? '',
        email: user.email ?? '',
        password: undefined
      })
    }
  }, [user, reset])

  // ** Handlers
  const onSubmit: SubmitHandler<FormValues> = async data => {
    try {
      const updates: Partial<{ name: string; email: string }> = {}
      if (data.name && data.name !== user?.name) updates.name = data.name
      if (data.email && data.email !== user?.email) updates.email = data.email

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          name: updates.name,
          email: updates.email,
          password: data.password || undefined
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Update failed')

      setUser({
        id: user?.id ?? '',
        role: user?.role ?? '',
        name: result.user.user_metadata?.name ?? updates.name ?? user?.name ?? '',
        email: result.user.email ?? updates.email ?? user?.email ?? ''
      })

      toast.success('Profile updated successfully!')
      reset({ ...data, password: undefined })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Update failed')
    }
  }

  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Profile</h1>
      <div className='max-w-lg mx-auto mt-12 bg-white p-6 rounded-2xl shadow-md'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
          <div>
            <label className='block font-medium mb-1'>Name</label>
            <input
              type='text'
              {...register('name')}
              className='w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black'
            />
            {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name.message}</p>}
          </div>

          <div>
            <label className='block font-medium mb-1'>Email</label>
            <input
              type='email'
              {...register('email')}
              className='w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black'
            />
            {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
          </div>

          <div>
            <label className='block font-medium mb-1'>New Password</label>
            <input
              type='password'
              {...register('password')}
              placeholder='Leave blank to keep current password'
              autoComplete='new-password'
              className='w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black'
            />

            {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password.message}</p>}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50'
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </main>
  )
}
