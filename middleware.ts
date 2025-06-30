import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Allow access to authentication-related paths
    if (req.nextUrl.pathname === '/') {
      return NextResponse.next()
    }

    // Protect /app/* routes
    if (req.nextUrl.pathname.startsWith('/cma') && !req.nextauth.token) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow access to root path
        if (req.nextUrl.pathname === '/') {
          return true
        }
        // Require authentication for /app/* routes
        if (req.nextUrl.pathname.startsWith('/cma')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/cma/:path*']
}
