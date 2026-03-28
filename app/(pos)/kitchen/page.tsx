"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { acceptOrder, markReady } from "@/lib/api"
import { OrderCard } from "@/components/order-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Clock, CheckCircle2 } from "lucide-react"
import { Empty } from "@/components/ui/empty"

const KITCHEN_CHEF_NAME_KEY = "aldente-kitchen-chef-name"

export default function KitchenPage() {
  const [chefName, setChefName] = useState("")
  const { orders } = useStore()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KITCHEN_CHEF_NAME_KEY)
      if (saved != null) setChefName(saved)
    } catch {
      /* ignore */
    }
  }, [])

  const handleChefNameChange = (value: string) => {
    setChefName(value)
    try {
      localStorage.setItem(KITCHEN_CHEF_NAME_KEY, value)
    } catch {
      /* ignore */
    }
  }

  // Filter orders by status
  const waitingOrders = useMemo(
    () => orders.filter((o) => o.status === "waiting"),
    [orders]
  )
  const cookingOrders = useMemo(
    () => orders.filter((o) => o.status === "cooking"),
    [orders]
  )
  const completedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === "ready" || o.status === "served")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 10),
    [orders]
  )

  const handleAcceptOrder = async (orderId: number) => {
    if (!chefName.trim()) {
      toast.error("Please enter your name first")
      return
    }

    try {
      await acceptOrder(orderId, chefName)
      toast.success(`Order #${orderId} accepted`, {
        description: `Now cooking by ${chefName}`,
      })
    } catch (error) {
      toast.error("Failed to accept order")
    }
  }

  const handleMarkReady = async (orderId: number) => {
    try {
      await markReady(orderId)
      toast.success(`Order #${orderId} is ready!`, {
        description: "Server has been notified",
      })
    } catch (error) {
      toast.error("Failed to mark order as ready")
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kitchen Display</h1>
            <p className="text-muted-foreground">
              Manage incoming orders and cooking queue
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Chef Name Input */}
            <div className="flex items-center gap-2">
              <Label htmlFor="chef-name" className="text-sm text-muted-foreground">
                Chef:
              </Label>
              <Input
                id="chef-name"
                placeholder="Enter your name"
                value={chefName}
                onChange={(e) => handleChefNameChange(e.target.value)}
                className="w-40 bg-input"
              />
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
                <Clock className="h-3.5 w-3.5" />
                {waitingOrders.length} waiting
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-primary text-primary">
                <ChefHat className="h-3.5 w-3.5" />
                {cookingOrders.length} cooking
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="active" className="h-full">
          <TabsList className="mb-4 bg-secondary">
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Active Orders
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Recently Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Waiting Orders */}
              <Card className="bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-warning" />
                    Waiting
                    <Badge variant="secondary" className="ml-auto">
                      {waitingOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {waitingOrders.length === 0 ? (
                    <Empty
                      icon={Clock}
                      title="No waiting orders"
                      description="New orders will appear here"
                    />
                  ) : (
                    <div className="space-y-4">
                      {waitingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          primaryAction={{
                            label: "Accept & Cook",
                            onClick: () => handleAcceptOrder(order.id),
                            disabled: !chefName.trim(),
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cooking Orders */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-primary" />
                    Cooking
                    <Badge variant="secondary" className="ml-auto">
                      {cookingOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cookingOrders.length === 0 ? (
                    <Empty
                      icon={ChefHat}
                      title="Nothing cooking"
                      description="Accept orders to start cooking"
                    />
                  ) : (
                    <div className="space-y-4">
                      {cookingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          primaryAction={{
                            label: "Mark Ready",
                            onClick: () => handleMarkReady(order.id),
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <Card className="bg-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  Recently Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedOrders.length === 0 ? (
                  <Empty
                    icon={CheckCircle2}
                    title="No completed orders"
                    description="Completed orders will appear here"
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        showActions={false}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
