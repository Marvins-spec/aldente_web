import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { ADMIN_COOKIE_NAME, adminSessionCookieValue } from "@/lib/admin-auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next()
  }

  const secret = process.env.ADMIN_PASSWORD
  if (!secret) {
    const login = new URL("/admin/login", request.url)
    login.searchParams.set("error", "config")
    return NextResponse.redirect(login)
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  const expected = await adminSessionCookieValue(secret)
  if (cookie === expected) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
}
