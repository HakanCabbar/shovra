// app/lib/protectedRoutes.ts
/**
 * PROTECTED_ROUTES:
 * key = route pattern
 * value = array of roles that can access
 *
 * Not:
 * - Dinamik segmentler [id] -> middleware'de startsWith ile kontrol edilecek
 * - Login olmayan kullanıcılar için "user" veya "admin" rolü gerekir
 */

export const PROTECTED_ROUTES: Record<string, string[]> = {
  '/favorites': ['user', 'admin'], // login olan kullanıcılar görebilir
  '/cart': ['user', 'admin'], // login olan kullanıcılar görebilir
  '/products/[id]': ['user', 'admin'], // login olan kullanıcılar görebilir
  '/admin/products/create': ['admin'] // sadece admin
}

/**
 * Middleware kullanırken:
 * - Eğer route '/products/[id]' ise pathname.startsWith('/products/') ile kontrol et
 * - Eğer route '/favorites' veya '/cart' ise tam eşleşme yeterli
 */
