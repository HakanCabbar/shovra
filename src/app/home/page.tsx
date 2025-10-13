import { prisma } from "@/lib/prisma";

export default async function ProductsPage() {
  const products = await prisma.product.findMany();
  return (
    <main className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((p) => (
          <article key={p.id} className="border rounded p-4">
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm text-slate-600">{p.description}</p>
            <p className="mt-2 font-medium">${p.price.toFixed(2)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
