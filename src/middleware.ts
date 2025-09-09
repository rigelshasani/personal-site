import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
      const adminLogins = process.env.ADMIN_GITHUB_LOGINS?.split(',') || [];
      const userLogin = req.nextauth.token?.login;
      
      // If not an admin, redirect to home
      if (!adminLogins.includes(typeof userLogin === 'string' ? userLogin : '')) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Require auth for admin routes
        if (req.nextUrl.pathname.startsWith('/admin') || req.nextUrl.pathname.startsWith('/api/admin')) {
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