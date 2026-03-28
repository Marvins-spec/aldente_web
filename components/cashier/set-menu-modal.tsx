"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { getPizzas, getDesserts, getDrinks } from "@/lib/data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import type { CartItem, SetMenuDetails } from "@/lib/types"

interface SetMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "pizza-combo" | "grand-mix-box"
  price: number
  onAddToCart: (item: CartItem) => void
}

export function SetMenuModal({
  open,
  onOpenChange,
  type,
  price,
  onAddToCart,
}: SetMenuModalProps) {
  const [selectedPizza, setSelectedPizza] = useState("")
  const [selectedDessert, setSelectedDessert] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")

  const pizzas = getPizzas()
  const desserts = getDesserts()
  const drinks = getDrinks()

  const handleConfirm = () => {
    if (!selectedPizza || !selectedDessert || !selectedDrink) return

    const setDetails: SetMenuDetails = {
      type,
      pizza: selectedPizza,
      dessert: selectedDessert,
      drink: selectedDrink,
    }

    const cartItem: CartItem = {
      cartId: `set-${type}-${Date.now()}`,
      id: type === "pizza-combo" ? "set-pizza-combo" : "set-grand-mix",
      name: type === "pizza-combo" ? "Pizza Combo" : "Grand Mix Box",
      category: "set",
      quantity: 1,
      price,
      setDetails,
    }

    onAddToCart(cartItem)
    onOpenChange(false)
    resetSelections()
  }

  const resetSelections = () => {
    setSelectedPizza("")
    setSelectedDessert("")
    setSelectedDrink("")
  }

  const isValid = selectedPizza && selectedDessert && selectedDrink

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {type === "pizza-combo" ? "Pizza Combo" : "Grand Mix Box"}
          </DialogTitle>
          <DialogDescription>
            Customize your set menu selection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Pizza Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your Pizza</Label>
            <RadioGroup
              value={selectedPizza}
              onValueChange={setSelectedPizza}
              className="grid grid-cols-2 gap-2"
            >
              {pizzas.map((pizza) => (
                <div key={pizza.id}>
                  <RadioGroupItem
                    value={pizza.id}
                    id={`pizza-${pizza.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`pizza-${pizza.id}`}
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-sm hover:bg-secondary hover:text-secondary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                  >
                    {pizza.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Dessert Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your Dessert</Label>
            <RadioGroup
              value={selectedDessert}
              onValueChange={setSelectedDessert}
              className="grid grid-cols-2 gap-2"
            >
              {desserts.map((dessert) => (
                <div key={dessert.id}>
                  <RadioGroupItem
                    value={dessert.id}
                    id={`dessert-${dessert.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`dessert-${dessert.id}`}
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-sm hover:bg-secondary hover:text-secondary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                  >
                    {dessert.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Drink Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose your Drink</Label>
            <RadioGroup
              value={selectedDrink}
              onValueChange={setSelectedDrink}
              className="grid grid-cols-2 gap-2"
            >
              {drinks.map((drink) => (
                <div key={drink.id}>
                  <RadioGroupItem
                    value={drink.id}
                    id={`drink-${drink.id}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`drink-${drink.id}`}
                    className="flex cursor-pointer items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-sm hover:bg-secondary hover:text-secondary-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10"
                  >
                    {drink.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Grand Mix Box extras */}
          {type === "grand-mix-box" && (
            <div className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="text-sm font-medium">Included in Grand Mix Box:</p>
              <div className="mt-2 flex gap-2">
                <Badge variant="secondary">Wings</Badge>
                <Badge variant="secondary">Fries</Badge>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!isValid}>
            Add to Cart - ${price}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
