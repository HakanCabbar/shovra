const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const products = [
    {
      name: 'iPhone 15',
      description: 'Apple akıllı telefon',
      price: 1499.99,
      imageUrl: 'https://example.com/iphone15.jpg'
    },
    {
      name: 'MacBook Pro 16',
      description: 'Apple dizüstü bilgisayar',
      price: 2499.99,
      imageUrl: 'https://example.com/macbookpro16.jpg'
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Sony kablosuz kulaklık',
      price: 399.99,
      imageUrl: 'https://example.com/sonywh1000xm5.jpg'
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log('Products seeded!')
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
