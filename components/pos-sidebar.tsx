"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  ChefHat,
  UtensilsCrossed,
  Package,
  Settings,
  Calculator,
} from "lucide-react"

const navigation = [
  { name: "Cashier", href: "/cashier", icon: CreditCard },
  { name: "Kitchen", href: "/kitchen", icon: ChefHat },
  { name: "Serving", href: "/serving", icon: UtensilsCrossed },
  { name: "Stock", href: "/stock", icon: Package },
  { name: "Cost Calculator", href: "/cost-calculator", icon: Calculator },
  { name: "Admin", href: "/admin", icon: Settings },
]

export function POSSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">AD</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            Al Dente&apos;s
          </h1>
          <p className="text-xs text-muted-foreground">POS System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-muted-foreground">Restaurant Mode</p>
          <p className="text-sm font-medium text-sidebar-foreground">
            Active Session
          </p>
        </div>
      </div>
    </aside>
  )
}
