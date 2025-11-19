import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/admin/dashboard")) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }
  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/dashboard/:path*"]
}

