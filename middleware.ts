import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Check for auth token in cookies
  const authToken = request.cookies.get("authjs.session-token") || 
                    request.cookies.get("__Secure-authjs.session-token")
  
  if (!authToken && request.nextUrl.pathname.startsWith("/admin/dashboard")) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/dashboard/:path*"]
}

