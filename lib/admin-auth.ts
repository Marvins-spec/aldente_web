/** Shared between middleware (Edge) and API routes — Web Crypto only. */

const SALT = "aldente-admin-v1"

export const ADMIN_COOKIE_NAME = "aldente_admin_auth"

export async function adminSessionCookieValue(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret + SALT)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
