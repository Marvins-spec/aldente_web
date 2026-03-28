import { SupabaseProvider } from "@/components/supabase-provider"
import { POSSidebar } from "@/components/pos-sidebar"
import { Toaster } from "@/components/ui/sonner"

export default function POSLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseProvider>
      <div className="flex h-screen overflow-hidden">
        <POSSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
        <Toaster />
      </div>
    </SupabaseProvider>
  )
}
