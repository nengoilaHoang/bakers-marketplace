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
	'/authen/google/callback',
	'/authen/google/callbackRegister',
]);

const PUBLIC_ROUTE_PREFIXES = [
	'/authen/verify/',
	'/authen/reset-password/',
];

// Chỉ khớp trang chi tiết /posts/<uuid> và /recipes/<uuid>,
// không khớp /posts/new, /recipes/new, /<...>/<uuid>/edit
const PUBLIC_DETAIL_PATTERN = /^\/(posts|recipes)\/[0-9a-f-]{36}$/i;

function isPublicRoute(pathname: string): boolean {
	return (
		PUBLIC_ROUTES.has(pathname) ||
		PUBLIC_DETAIL_PATTERN.test(pathname) ||
		PUBLIC_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix))
	);
}

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const hasAccessToken = request.cookies.has('accessToken');
	const hasRefreshToken = request.cookies.has('refreshToken');
	const hasActiveSession = hasAccessToken && hasRefreshToken;
	const canRefreshAccessToken = !hasAccessToken && hasRefreshToken;
	const canAccessProtectedRoutes =
		hasActiveSession || canRefreshAccessToken;
	const isGuestRoute = GUEST_ROUTES.has(pathname);

	if (isGuestRoute && canAccessProtectedRoutes) {
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
