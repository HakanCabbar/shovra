'use client'

// ** React and hooks
import { useState } from 'react'
import { useFetch } from '@/lib/hooks/useFetch'

// ** React Hook Form
import { useForm } from 'react-hook-form'

// ** Validation
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// ** Third-party UI / Toast
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
}

const schema = yup.object({
  name: yup.string().required('Product name is required'),
  description: yup.string().required('Description is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price is required'),
  categoryId: yup.string().required('Category is required'),
  image: yup
    .mixed<FileList>()
    .required('Image is required')
    .test('fileRequired', 'Image is required', value => {
      return value !== undefined && value.length > 0
    })
})

type FormValues = yup.InferType<typeof schema>

export default function ProductForm() {
  // ** Local state
  const [loading, setLoading] = useState(false)

  // ** Fetch categories
  const {
    data: categories = [],
    isLoading,
    isError: error
  } = useFetch<Category[]>({
    queryKey: ['categories'],
    url: '/api/categories'
  })

  // ** React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: yupResolver(schema)
  })

  // ** Handlers
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description)
      formData.append('price', data.price.toString())
      formData.append('categoryId', data.categoryId)
      // @ts-ignore
      formData.append('image', data.image[0])

      const res = await fetch('/api/products', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      toast.success('Product created successfully!')
      reset()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ** Loading & error states
  if (isLoading) return <p>Loading categories...</p>
  if (error) return <p className='text-red-500'>Failed to load categories</p>

  // ** JSX
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <label className='block mb-1 font-medium'>Product Name</label>
        <input type='text' {...register('name')} className='w-full border p-2 rounded' />
        {errors.name && <p className='text-red-500 text-sm'>{errors.name.message}</p>}
      </div>

      <div>
        <label className='block mb-1 font-medium'>Description</label>
        <textarea {...register('description')} className='w-full border p-2 rounded' />
        {errors.description && <p className='text-red-500 text-sm'>{errors.description.message}</p>}
      </div>

      <div>
        <label className='block mb-1 font-medium'>Price</label>
        <input type='number' step='0.01' {...register('price')} className='w-full border p-2 rounded' />
        {errors.price && <p className='text-red-500 text-sm'>{errors.price.message}</p>}
      </div>

      <div>
        <label className='block mb-1 font-medium'>Category</label>
        <select {...register('categoryId')} className='w-full border p-2 rounded' defaultValue=''>
          <option value='' disabled>
            Select category
          </option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className='text-red-500 text-sm'>{errors.categoryId.message}</p>}
      </div>

      <div>
        <label className='block mb-1 font-medium'>Product Image</label>
        <input type='file' accept='image/*' {...register('image')} className='w-full border p-2 rounded' />
        {errors.image && <p className='text-red-500 text-sm'>{errors.image.message}</p>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition'
      >
        {loading ? 'Saving...' : 'Create Product'}
      </button>
    </form>
  )
}
