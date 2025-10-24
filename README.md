🛍️ Shovra

Shovra is a modern, performance-oriented e-commerce platform built with Next.js (App Router), Supabase, and Prisma ORM.
The entire project — from authentication to the admin panel — was developed from scratch by me with a focus on scalability, UX, and clean architecture.

🚀 Tech Stack
Technology	Description
Next.js 13 (App Router)	Server-side rendering, routing, and optimized performance
TypeScript	Type-safe, maintainable, and scalable codebase
Supabase	Authentication, database, and storage management
Prisma ORM	Type-safe database access and schema modeling
Tailwind CSS	Utility-first styling for fast UI development
React Hook Form + Yup	Form handling and validation
React Query (TanStack Query)	Server state and cache management
Vercel	CI/CD and production hosting
🧩 Features
👤 User Side

🔐 Secure authentication via Supabase Auth

🛒 Cart management — add, remove, and calculate totals

💳 Order & checkout flow (supports integration with real or mock payment services)

❤️ Add/remove favorites

🌐 Fully responsive and modern UI

⚙️ Admin Panel

📦 Product CRUD operations

🧾 Category management

👥 User roles (Admin/User)

🗑️ Soft delete and restore support

🗄️ Database Schema (Example)

The database is hosted on Supabase (PostgreSQL) and managed with Prisma.

model Product {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  imageUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id       String  @id @default(uuid())
  email    String  @unique
  name     String?
  role     Role    @default(USER)
  orders   Order[]
}

model Order {
  id        String    @id @default(uuid())
  userId    String
  total     Float
  status    String
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
}

⚡ Getting Started

Clone the repository and install dependencies:

# Clone the repository
git clone https://github.com/HakanCabbar/shovra.git

# Move into the project directory
cd shovra

# Install dependencies
npm install


Create an .env.local file in the project root:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=


Run the Prisma migrations:

npx prisma migrate dev


Start the development server:

npm run dev


Visit the app at http://localhost:3000
.

🧠 Architecture Notes

Built with the Next.js App Router for clear server/client boundaries.

Uses Server Actions instead of traditional API routes for a cleaner flow.

Data fetching is optimized with React Query and server-side rendering.

Middleware-based role protection ensures secure routing.

Dynamic imports and Vercel build optimization reduce TTFB and bundle size.

🌍 Deployment

The app is deployed on Vercel, with automatic builds and deployment via CI/CD.

👨‍💻 Author

Hakan CABBAR
Frontend Developer — React & Next.js
🎨 Focused on creating user-friendly, scalable, and high-performance interfaces.

📄 License

This project is not open-source.
All rights reserved — © Hakan CABBAR.
