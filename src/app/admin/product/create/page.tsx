// ** Components
import ProductForm from '../../../components/admin/CreateProductForm'

export default async function CreateProductPage() {
  return (
    <main className='max-w-6xl mx-auto'>
      <h1 className='text-2xl font-semibold mb-8 text-gray-800'>Create Product</h1>
      <div className='max-w-lg mx-auto mt-12 bg-white p-6 rounded-2xl shadow-md'>
        <ProductForm />
      </div>
    </main>
  )
}
