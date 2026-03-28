"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import { getMenuItem } from "@/lib/data"
import type { CartItem } from "@/lib/types"

interface CartPanelProps {
  items: CartItem[]
  customerName: string
  onCustomerNameChange: (name: string) => void
  onUpdateQuantity: (cartId: string, quantity: number) => void
  onRemoveItem: (cartId: string) => void
  onClearCart: () => void
  onSubmitOrder: () => void
  isSubmitting: boolean
}

export function CartPanel({
  items,
  customerName,
  onCustomerNameChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
  isSubmitting,
}: CartPanelProps) {
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const getSetDetails = (item: CartItem) => {
    if (!item.setDetails) return null
    
    const pizza = getMenuItem(item.setDetails.pizza)
    const dessert = getMenuItem(item.setDetails.dessert)
    const drink = getMenuItem(item.setDetails.drink)

    return (
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <p>Pizza: {pizza?.name}</p>
        <p>Dessert: {dessert?.name}</p>
        <p>Drink: {drink?.name}</p>
        {item.setDetails.type === "grand-mix-box" && (
          <p>+ Wings & Fries</p>
        )}
      </div>
    )
  }

  return (
    <Card className="flex h-full flex-col bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart
          {totalItems > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {totalItems} items
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4 overflow-hidden pb-0">
        {/* Customer Name Input */}
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer Name</Label>
          <Input
            id="customer-name"
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="bg-input"
          />
        </div>

        <Separator />

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p className="mt-2 text-sm">Cart is empty</p>
            <p className="text-xs">Add items from the menu</p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100%-12rem)]">
            <div className="space-y-3 pr-4">
              {items.map((item) => (
                <div
                  key={item.cartId}
                  className="rounded-lg bg-secondary/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {item.name}
                        </span>
                        {item.size && (
                          <Badge variant="outline" className="text-xs shrink-0">
                            {item.size}
                          </Badge>
                        )}
                      </div>
                      {getSetDetails(item)}
                      <p className="mt-1 text-sm text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => onRemoveItem(item.cartId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onUpdateQuantity(item.cartId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        onUpdateQuantity(item.cartId, item.quantity + 1)
                      }
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-3 border-t border-border pt-4">
        {/* Total */}
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-medium">Total</span>
          <span className="text-2xl font-bold text-primary">
            ${totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClearCart}
            disabled={items.length === 0 || isSubmitting}
          >
            Clear
          </Button>
          <Button
            className="flex-1"
            onClick={onSubmitOrder}
            disabled={
              items.length === 0 || !customerName.trim() || isSubmitting
            }
          >
            {isSubmitting ? "Processing..." : "Place Order"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
