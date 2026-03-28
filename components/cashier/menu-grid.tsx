"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { calculateMaxProducible } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { MenuItem, CartItem, PizzaSize } from "@/lib/types"
import { Pizza, UtensilsCrossed, IceCream, Coffee, Package } from "lucide-react"

interface MenuGridProps {
  onAddToCart: (item: CartItem) => void
}

const categoryIcons = {
  pizza: Pizza,
  main: UtensilsCrossed,
  dessert: IceCream,
  drink: Coffee,
  set: Package,
}

const categoryLabels = {
  set: "Set Menu",
  pizza: "Pizza",
  main: "Main Course",
  dessert: "Dessert",
  drink: "Drinks",
}

export function MenuGrid({ onAddToCart }: MenuGridProps) {
  const { menuItems, ingredients } = useStore()
  const [selectedSize, setSelectedSize] = useState<Record<string, PizzaSize>>({})

  const categories = ["set", "pizza", "main", "dessert", "drink"] as const

  const handleAddItem = (item: MenuItem) => {
    const size = item.category === "pizza" ? (selectedSize[item.id] || "M") : undefined
    const price = size === "L" && item.priceL ? item.priceL : item.price

    const cartItem: CartItem = {
      cartId: `${item.id}-${Date.now()}`,
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: 1,
      price,
      size,
    }

    onAddToCart(cartItem)
  }

  const getMaxProducible = (item: MenuItem) => {
    if (item.category === "set") return Infinity // Set menus: stock checked inside modal
    const size = item.category === "pizza" ? (selectedSize[item.id] || "M") : "M"
    return calculateMaxProducible(item.id, ingredients, size)
  }

  return (
    <Tabs defaultValue="set" className="w-full">
      <TabsList className="mb-4 grid w-full grid-cols-5 bg-secondary">
        {categories.map((category) => {
          const Icon = categoryIcons[category]
          return (
            <TabsTrigger
              key={category}
              value={category}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{categoryLabels[category]}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category} value={category} className="mt-0">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
            {menuItems
              .filter((item) => item.category === category)
              .map((item) => {
                const maxProducible = getMaxProducible(item)
                const isLowStock = maxProducible > 0 && maxProducible <= 5
                const isOutOfStock = maxProducible === 0 && item.category !== "set"
                const currentSize = selectedSize[item.id] || "M"
                const displayPrice =
                  item.category === "pizza" && currentSize === "L" && item.priceL
                    ? item.priceL
                    : item.price

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary hover:shadow-lg",
                      isOutOfStock && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !isOutOfStock && handleAddItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-card-foreground truncate">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary shrink-0"
                        >
                          ${displayPrice}
                        </Badge>
                      </div>

                      {/* Pizza size selector */}
                      {item.category === "pizza" && (
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            variant={currentSize === "M" ? "default" : "outline"}
                            className="flex-1 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSize((prev) => ({ ...prev, [item.id]: "M" }))
                            }}
                          >
                            M - ${item.price}
                          </Button>
                          <Button
                            size="sm"
                            variant={currentSize === "L" ? "default" : "outline"}
                            className="flex-1 h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedSize((prev) => ({ ...prev, [item.id]: "L" }))
                            }}
                          >
                            L - ${item.priceL}
                          </Button>
                        </div>
                      )}

                      {/* Stock indicator */}
                      {item.category !== "set" && (
                        <div className="mt-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-xs">
                              Out of Stock
                            </Badge>
                          ) : isLowStock ? (
                            <Badge
                              variant="outline"
                              className="text-xs border-warning text-warning"
                            >
                              Low Stock ({maxProducible} left)
                            </Badge>
                          ) : null}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
