You are absolutely right to point that out. My apologies for not providing a single, continuous output as requested. I structured it into sections using Markdown headings and horizontal rules to match standard README formatting, but I understand you need a complete, ready-to-paste block of text.

Here is the complete README content in English, provided as a single, continuous code block for easy copy-pasting:

Markdown

# 🛍️ Shovra E-commerce Platform

Shovra is a modern, performance-oriented e-commerce platform built with Next.js (App Router), Supabase, and Prisma ORM. The entire project — from authentication to the admin panel — was developed from scratch with a focus on scalability, UX, and clean architecture.

---

## 🚀 Tech Stack

| Technology | Description |
| :--- | :--- |
| **Next.js 13 (App Router)** | Server-side rendering, routing, and optimized performance. |
| **TypeScript** | Type-safe, maintainable, and scalable codebase. |
| **Supabase** | Authentication, database, and storage management. |
| **Prisma ORM** | Type-safe database access and schema modeling. |
| **Tailwind CSS** | Utility-first styling for fast UI development. |
| **React Hook Form + Yup** | Form handling and validation. |
| **React Query (TanStack Query)** | Server state and cache management. |
| **Vercel** | CI/CD and production hosting. |

---

## 🧩 Features

### 👤 User Side

* 🔐 Secure authentication via Supabase Auth.
* 🛒 Cart management — add, remove, and calculate totals.
* 💳 Order & checkout flow (supports integration with real or mock payment services).
* ❤️ Add/remove favorites.
* 🌐 Fully responsive and modern UI.

### ⚙️ Admin Panel

* 📦 Product CRUD operations.
* 🧾 Category management.
* 👥 User roles (Admin/User).
* 🗑️ Soft delete and restore support.

---

## 🗄️ Database Schema (Prisma ORM)

The database is hosted on Supabase (PostgreSQL) and managed with Prisma.

```prisma
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
  id    String @id @default(uuid())
  email String @unique
  name  String?
  role  Role   @default(USER)
  orders Order[]
}

model Order {
  id        String   @id @default(uuid())
  userId    String
  total     Float
  status    String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

enum Role {
  USER
  ADMIN
}
⚡ Getting Started
Clone the repository and install dependencies:

1. Installation
Bash

# Clone the repository
git clone [https://github.com/HakanCabbar/shovra.git](https://github.com/HakanCabbar/shovra.git)

# Move into the project directory
cd shovra

# Install dependencies
npm install
2. Environment Variables
Create an .env.local file in the project root:

# Supabase URL and Anon Key (for Frontend access)
NEXT_PUBLIC_SUPABASE_URL='[https://pjhybdodeugulrjtfcew.supabase.co](https://pjhybdodeugulrjtfcew.supabase.co)'
NEXT_PUBLIC_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqaHliZG9kZXVndWxyanRmY2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NzA2NjQsImV4cCI6MjA3NjA0NjY2NH0.CFEVUl9om3qcmJzMtuJhNvXs3lMdPe0wgiiOCq1DYrE'

# Prisma/Database connection URL (for Backend/Prisma)
DATABASE_URL='postgresql://postgres.pjhybdodeugulrjtfcew:shovra@aws-1-eu-west-3.pooler.supabase.com:5432/postgres'
3. Run Prisma Migrations
Bash

npx prisma migrate dev
4. Start the Development Server
Bash

npm run dev
Visit the app at http://localhost:3000.

🧠 Architecture Notes
Next.js App Router: Used for clear server/client boundaries.

Server Actions: Used instead of traditional API routes for a cleaner flow.

Data Fetching: Optimized with React Query and server-side rendering.

Security: Middleware-based role protection ensures secure routing.

Performance: Dynamic imports and Vercel build optimization reduce TTFB and bundle size.

🌍 Deployment
The app is deployed on Vercel, with automatic builds and deployment via CI/CD.

👨‍💻 Author
Hakan CABBAR Frontend Developer — React & Next.js Focus: Creating user-friendly, scalable, and high-performance interfaces.

📄 License
This project is not open-source. All rights reserved — © Hakan CABBAR.
