import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"

const isApiAdminPath = (pathname: string) => pathname.startsWith('/api/admin')
const isAdminPath = (pathname: string) => pathname.startsWith('/admin')

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname
    // Always allow the custom sign-in page
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    const userLogin = req.nextauth.token?.login
    const authorized = isAdmin(typeof userLogin === 'string' ? userLogin : undefined)

    // An expired session in an open editor tab would otherwise follow the
    // redirect and try to parse the sign-in page as JSON.
    if (isApiAdminPath(pathname)) {
      return authorized
        ? NextResponse.next()
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (isAdminPath(pathname) && !authorized) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        if (pathname === '/admin/login') {
          return true
        }
        // Handled in the middleware body so the response is a 401 rather than
        // next-auth's redirect to the sign-in page.
        if (isApiAdminPath(pathname)) {
          return true
        }
        // Require auth for admin pages
        if (isAdminPath(pathname)) {
          return !!token;
        }
        return true;
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
