"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ChefHat, User, UserCheck } from "lucide-react"
import { getMenuItem } from "@/lib/data"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"

interface OrderCardProps {
  order: Order
  showActions?: boolean
  primaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

const statusColors: Record<OrderStatus, string> = {
  waiting: "bg-warning text-warning-foreground",
  cooking: "bg-primary text-primary-foreground",
  ready: "bg-success text-success-foreground",
  served: "bg-muted text-muted-foreground",
}

const statusLabels: Record<OrderStatus, string> = {
  waiting: "Waiting",
  cooking: "Cooking",
  ready: "Ready",
  served: "Served",
}

export function OrderCard({
  order,
  showActions = true,
  primaryAction,
  secondaryAction,
}: OrderCardProps) {
  const timeSince = getTimeSince(order.createdAt)

  const getItemDisplay = (item: typeof order.items[0]) => {
    let display = `${item.quantity}x ${item.name}`
    if (item.size) display += ` (${item.size})`
    
    // Show set menu details
    if (item.setDetails) {
      const pizza = getMenuItem(item.setDetails.pizza)
      const dessert = getMenuItem(item.setDetails.dessert)
      const drink = getMenuItem(item.setDetails.drink)
      
      return (
        <div key={item.id}>
          <span className="font-medium">{display}</span>
          <ul className="ml-4 text-xs text-muted-foreground">
            <li>- {pizza?.name}</li>
            <li>- {dessert?.name}</li>
            <li>- {drink?.name}</li>
            {item.setDetails.type === "grand-mix-box" && (
              <li>- Wings & Fries</li>
            )}
          </ul>
        </div>
      )
    }
    
    return <span key={item.id}>{display}</span>
  }

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary">
              Order #{order.id}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>{order.customerName}</span>
            </div>
          </div>
          <Badge className={cn("shrink-0", statusColors[order.status])}>
            {statusLabels[order.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {/* Order Items */}
        <div className="space-y-1 text-sm">
          {order.items.map((item, index) => (
            <div key={`${item.id}-${index}`}>
              {getItemDisplay(item)}
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{timeSince}</span>
          </div>
          {order.chefName && (
            <div className="flex items-center gap-1">
              <ChefHat className="h-3.5 w-3.5" />
              <span>{order.chefName}</span>
            </div>
          )}
          {order.serverName && (
            <div className="flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5" />
              <span>
                {order.status === "served"
                  ? `Served by ${order.serverName}`
                  : `Server: ${order.serverName}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      {showActions && (primaryAction || secondaryAction) && (
        <CardFooter className="gap-2 border-t border-border pt-3">
          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button
              size="sm"
              className="flex-1"
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.label}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

function getTimeSince(date: Date | string): string {
  const now = new Date()
  const orderDate = new Date(date)
  const diffMs = now.getTime() - orderDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins === 1) return "1 min ago"
  if (diffMins < 60) return `${diffMins} mins ago`
  
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return "1 hour ago"
  return `${diffHours} hours ago`
}
