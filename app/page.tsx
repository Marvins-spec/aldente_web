import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, ChefHat, UtensilsCrossed, Package, Settings, ArrowRight } from "lucide-react"

const stations = [
  {
    title: "Cashier",
    description: "Take orders and manage the cart",
    href: "/cashier",
    icon: CreditCard,
    color: "bg-primary",
  },
  {
    title: "Kitchen",
    description: "View and manage cooking orders",
    href: "/kitchen",
    icon: ChefHat,
    color: "bg-chart-4",
  },
  {
    title: "Serving",
    description: "Deliver ready orders to customers",
    href: "/serving",
    icon: UtensilsCrossed,
    color: "bg-success",
  },
  {
    title: "Stock",
    description: "Monitor inventory and stock levels",
    href: "/stock",
    icon: Package,
    color: "bg-chart-2",
  },
  {
    title: "Admin",
    description: "System settings and configuration",
    href: "/admin",
    icon: Settings,
    color: "bg-muted",
  },
]

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
            <span className="text-3xl font-bold text-primary-foreground">AD</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Al Dente&apos;s
          </h1>
          <p className="mt-2 text-xl text-muted-foreground">
            Restaurant POS System
          </p>
        </div>

        {/* Station Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stations.map((station) => (
            <Link key={station.href} href={station.href}>
              <Card className="group h-full cursor-pointer transition-all hover:border-primary hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${station.color}`}
                    >
                      <station.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{station.title}</CardTitle>
                      <CardDescription>{station.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-secondary"
                  >
                    Open Station
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Production-ready POS system with recipe-based stock management
        </p>
      </div>
    </main>
  )
}
