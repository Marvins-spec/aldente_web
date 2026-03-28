"use client"

import { useEffect, useState } from "react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase"
import {
  subscribeSupabasePOS,
  supabaseRefreshAllState,
  supabaseSeedIfEmpty,
} from "@/lib/supabase-db"
import { useStore } from "@/lib/store"

type SyncStatus = "idle" | "connecting" | "ready" | "error"

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>(() =>
    isSupabaseConfigured() ? "connecting" : "idle"
  )

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const sb = getSupabaseBrowserClient()
    if (!sb) {
      setStatus("error")
      return
    }

    let cancelled = false
    let unsub: (() => void) | undefined

    void (async () => {
      try {
        const { error: authError } = await sb.auth.signInAnonymously()
        if (authError) throw authError
        if (cancelled) return

        try {
          localStorage.removeItem("al-dentes-pos-storage")
        } catch {
          /* ignore */
        }

        await supabaseSeedIfEmpty()
        if (cancelled) return

        const apply = useStore.getState().applyRemoteState
        await supabaseRefreshAllState(apply)
        if (cancelled) return

        if (cancelled) return
        unsub = subscribeSupabasePOS(() => {
          void supabaseRefreshAllState(apply)
        })

        if (!cancelled) setStatus("ready")
      } catch (e) {
        console.error("Supabase init failed:", e)
        if (!cancelled) setStatus("error")
      }
    })()

    return () => {
      cancelled = true
      unsub?.()
    }
  }, [])

  return (
    <>
      {status === "connecting" && (
        <div className="border-b border-border bg-muted/80 px-4 py-2 text-center text-sm text-muted-foreground">
          Connecting to Supabase…
        </div>
      )}
      {status === "error" && (
        <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          Supabase connection failed. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, run
          supabase/schema.sql, and enable Anonymous sign-in in Authentication → Providers.
        </div>
      )}
      {children}
    </>
  )
}
