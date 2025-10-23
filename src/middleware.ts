import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { PROTECTED_ROUTES } from './lib/protectedRoutes'

export function middleware(req: NextRequest) {
  let pathname = req.nextUrl.pathname
  const role = req.cookies.get('userRole')?.value
  if (pathname.endsWith('/') && pathname.length > 1) {
    pathname = pathname.slice(0, -1)
  }

  const protectedRoute = Object.keys(PROTECTED_ROUTES).find(routePattern => {
    if (routePattern.includes('[id]')) {
      const baseRoute = routePattern.replace('/[id]', '')
      return pathname.startsWith(baseRoute)
    }

    return pathname === routePattern
  })

  if (protectedRoute) {
    const allowedRoles = PROTECTED_ROUTES[protectedRoute]
    if (!role || !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/403', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/favorites/:path*', '/cart/:path*', '/admin/:path*']
}
