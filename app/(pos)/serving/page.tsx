"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { takeServing, markServed } from "@/lib/api"
import { OrderCard } from "@/components/order-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UtensilsCrossed, CheckCircle2, Truck } from "lucide-react"
import { Empty } from "@/components/ui/empty"

export default function ServingPage() {
  const [serverName, setServerName] = useState("")
  const { orders } = useStore()

  // Filter orders by status
  const readyOrders = useMemo(
    () => orders.filter((o) => o.status === "ready" && !o.serverName),
    [orders]
  )
  const deliveringOrders = useMemo(
    () => orders.filter((o) => o.status === "ready" && o.serverName),
    [orders]
  )
  const servedOrders = useMemo(
    () =>
      orders
        .filter((o) => o.status === "served")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 10),
    [orders]
  )

  const handleTakeServing = async (orderId: number) => {
    if (!serverName.trim()) {
      toast.error("Please enter your name first")
      return
    }

    try {
      await takeServing(orderId, serverName)
      toast.success(`Order #${orderId} picked up`, {
        description: `Being delivered by ${serverName}`,
      })
    } catch (error) {
      toast.error("Failed to take order")
    }
  }

  const handleMarkServed = async (orderId: number) => {
    try {
      await markServed(orderId)
      toast.success(`Order #${orderId} served!`, {
        description: "Order completed successfully",
      })
    } catch (error) {
      toast.error("Failed to mark as served")
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Serving Station</h1>
            <p className="text-muted-foreground">
              Pick up ready orders and deliver to customers
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Server Name Input */}
            <div className="flex items-center gap-2">
              <Label htmlFor="server-name" className="text-sm text-muted-foreground">
                Server:
              </Label>
              <Input
                id="server-name"
                placeholder="Enter your name"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-40 bg-input"
              />
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-success text-success">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                {readyOrders.length} ready
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 border-primary text-primary">
                <Truck className="h-3.5 w-3.5" />
                {deliveringOrders.length} delivering
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
              Served History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Ready Orders */}
              <Card className="bg-card border-success/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-success" />
                    Ready for Pickup
                    <Badge variant="secondary" className="ml-auto">
                      {readyOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {readyOrders.length === 0 ? (
                    <Empty
                      icon={UtensilsCrossed}
                      title="No orders ready"
                      description="Ready orders will appear here"
                    />
                  ) : (
                    <div className="space-y-4">
                      {readyOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          primaryAction={{
                            label: "Pick Up",
                            onClick: () => handleTakeServing(order.id),
                            disabled: !serverName.trim(),
                          }}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivering Orders */}
              <Card className="bg-card border-primary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Being Delivered
                    <Badge variant="secondary" className="ml-auto">
                      {deliveringOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {deliveringOrders.length === 0 ? (
                    <Empty
                      icon={Truck}
                      title="No orders in delivery"
                      description="Pick up orders to deliver"
                    />
                  ) : (
                    <div className="space-y-4">
                      {deliveringOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          primaryAction={{
                            label: "Mark Served",
                            onClick: () => handleMarkServed(order.id),
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
                  <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                  Served Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servedOrders.length === 0 ? (
                  <Empty
                    icon={CheckCircle2}
                    title="No served orders"
                    description="Completed orders will appear here"
                  />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {servedOrders.map((order) => (
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
