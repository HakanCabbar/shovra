import { prisma } from "@/lib/prisma";
import ProductForm from "../../../components/admin/CreateProductForm";

export default async function CreateProductPage() {
  const categories = await prisma.category.findMany();

  return (
    <main className="max-w-lg mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Create Product</h1>
      <ProductForm categories={categories} />
    </main>
  );
}
