export const PROTECTED_ROUTES: Record<string, string[]> = {
  '/favorites': ['user', 'admin'],
  '/cart': ['user', 'admin'],
  '/products/[id]': ['user', 'admin'],
  '/admin/products/create': ['admin']
}
