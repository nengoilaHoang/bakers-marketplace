import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const GUEST_ROUTES = new Set([
  '/authen/login',
  '/authen/register',
  '/authen/forgot-password',
]);

const PUBLIC_ROUTES = new Set([
  '/',
  '/recipes',
  '/recipes/search',
  '/vendors/products/search',
  '/products',
  '/cart',
  '/authen/google/callback',
  '/authen/google/callbackRegister',
]);

const PUBLIC_ROUTE_PREFIXES = ['/authen/verify/', '/authen/reset-password/'];

// Chỉ khớp trang chi tiết /posts/<uuid> và /recipes/<uuid>,
// không khớp /posts/new, /recipes/new, /<...>/<uuid>/edit
const PUBLIC_DETAIL_PATTERN = /^\/(posts|recipes)\/[0-9a-f-]{36}$/i;

// Trang chi tiết sản phẩm /products/<slug>
const PRODUCT_DETAIL_PATTERN = /^\/products\/[a-z0-9-]+$/i;

function isPublicRoute(pathname: string): boolean {
  return (
    PUBLIC_ROUTES.has(pathname) ||
    PUBLIC_DETAIL_PATTERN.test(pathname) ||
    PRODUCT_DETAIL_PATTERN.test(pathname) ||
    PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasAccessToken = request.cookies.has('accessToken');
  const hasRefreshToken = request.cookies.has('refreshToken');
  // Access token chỉ sống 15 phút; còn refresh token là còn phiên đăng nhập,
  // lần gọi API đầu tiên trên trang sẽ tự lấy access token mới (lib/api.ts).
  const canAccessProtectedRoutes = hasRefreshToken;
  const isGuestRoute = GUEST_ROUTES.has(pathname);

  // Chỉ đẩy khỏi trang đăng nhập khi chắc chắn đang đăng nhập (đủ 2 token).
  // Refresh token có thể đã chết (seed lại DB, phiên bị thu hồi) mà cookie vẫn còn.
  if (isGuestRoute && hasAccessToken && hasRefreshToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isGuestRoute || isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!canAccessProtectedRoutes) {
    const loginUrl = new URL('/authen/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
