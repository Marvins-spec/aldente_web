import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { ADMIN_COOKIE_NAME, adminSessionCookieValue } from "@/lib/admin-auth"

function safeComparePassword(input: string, expected: string): boolean {
  try {
    const a = Buffer.from(input, "utf8")
    const b = Buffer.from(expected, "utf8")
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) {
    return NextResponse.json(
      { error: "Admin password is not configured on the server." },
      { status: 503 }
    )
  }

  let body: { password?: string }
  try {
    body = (await request.json()) as { password?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const password = typeof body.password === "string" ? body.password : ""
  if (!safeComparePassword(password, secret)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const token = await adminSessionCookieValue(secret)
  const res = NextResponse.json({ ok: true })
  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
