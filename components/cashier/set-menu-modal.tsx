"use client"

import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { validateStockForItems } from "@/lib/api"
import { getPizzas, getDesserts, getDrinks } from "@/lib/data"
import { cn } from "@/lib/utils"
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
import type { CartItem, SetMenuDetails, Ingredient } from "@/lib/types"

function makeSetCartProbe(
  pizza: string,
  dessert: string,
  drink: string,
  type: "pizza-combo" | "grand-mix-box",
  price: number
): CartItem {
  const setDetails: SetMenuDetails = { type, pizza, dessert, drink }
  return {
    cartId: `probe-${pizza}-${dessert}-${drink}`,
    id: type === "pizza-combo" ? "set-pizza-combo" : "set-grand-mix",
    name: "probe",
    category: "set",
    quantity: 1,
    price,
    setDetails,
  }
}

function isComboValid(
  cart: CartItem[],
  ingredients: Ingredient[],
  pizza: string,
  dessert: string,
  drink: string,
  type: "pizza-combo" | "grand-mix-box",
  price: number
): boolean {
  const item = makeSetCartProbe(pizza, dessert, drink, type, price)
  return validateStockForItems([...cart, item], ingredients).valid
}

interface SetMenuModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "pizza-combo" | "grand-mix-box"
  price: number
  cart: CartItem[]
  onAddToCart: (item: CartItem) => void
}

export function SetMenuModal({
  open,
  onOpenChange,
  type,
  price,
  cart,
  onAddToCart,
}: SetMenuModalProps) {
  const [selectedPizza, setSelectedPizza] = useState("")
  const [selectedDessert, setSelectedDessert] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")

  const { ingredients } = useStore()

  const pendingCartItem = useMemo((): CartItem | null => {
    if (!selectedPizza || !selectedDessert || !selectedDrink) return null
    const setDetails: SetMenuDetails = {
      type,
      pizza: selectedPizza,
      dessert: selectedDessert,
      drink: selectedDrink,
    }
    return {
      cartId: `set-${type}-pending`,
      id: type === "pizza-combo" ? "set-pizza-combo" : "set-grand-mix",
      name: type === "pizza-combo" ? "Pizza Combo" : "Grand Mix Box",
      category: "set",
      quantity: 1,
      price,
      setDetails,
    }
  }, [selectedPizza, selectedDessert, selectedDrink, type, price])

  const stockCheck = useMemo(() => {
    if (!pendingCartItem) {
      return { valid: true as const, missingIngredients: [] as string[] }
    }
    return validateStockForItems([...cart, pendingCartItem], ingredients)
  }, [pendingCartItem, cart, ingredients])

  const pizzas = getPizzas()
  const desserts = getDesserts()
  const drinks = getDrinks()

  const { pizzaMap, dessertMap, drinkMap } = useMemo(() => {
    const pizzasInner = getPizzas()
    const dessertsInner = getDesserts()
    const drinksInner = getDrinks()

    const pizzaMap: Record<string, boolean> = {}
    for (const p of pizzasInner) {
      pizzaMap[p.id] = dessertsInner.some((d) =>
        drinksInner.some((dr) =>
          isComboValid(cart, ingredients, p.id, d.id, dr.id, type, price)
        )
      )
    }
    const dessertMap: Record<string, boolean> = {}
    for (const d of dessertsInner) {
      if (selectedPizza) {
        dessertMap[d.id] = drinksInner.some((dr) =>
          isComboValid(cart, ingredients, selectedPizza, d.id, dr.id, type, price)
        )
      } else {
        dessertMap[d.id] = pizzasInner.some((p) =>
          drinksInner.some((dr) =>
            isComboValid(cart, ingredients, p.id, d.id, dr.id, type, price)
          )
        )
      }
    }
    const drinkMap: Record<string, boolean> = {}
    for (const dr of drinksInner) {
      if (selectedPizza && selectedDessert) {
        drinkMap[dr.id] = isComboValid(
          cart,
          ingredients,
          selectedPizza,
          selectedDessert,
          dr.id,
          type,
          price
        )
      } else if (selectedPizza) {
        drinkMap[dr.id] = dessertsInner.some((d) =>
          isComboValid(cart, ingredients, selectedPizza, d.id, dr.id, type, price)
        )
      } else if (selectedDessert) {
        drinkMap[dr.id] = pizzasInner.some((p) =>
          isComboValid(cart, ingredients, p.id, selectedDessert, dr.id, type, price)
        )
      } else {
        drinkMap[dr.id] = pizzasInner.some((p) =>
          dessertsInner.some((d) =>
            isComboValid(cart, ingredients, p.id, d.id, dr.id, type, price)
          )
        )
      }
    }
    return { pizzaMap, dessertMap, drinkMap }
  }, [cart, ingredients, type, price, selectedPizza, selectedDessert])

  useEffect(() => {
    if (selectedPizza && !pizzaMap[selectedPizza]) {
      setSelectedPizza("")
    }
  }, [pizzaMap, selectedPizza])

  useEffect(() => {
    if (selectedDessert && !dessertMap[selectedDessert]) {
      setSelectedDessert("")
    }
  }, [dessertMap, selectedDessert])

  useEffect(() => {
    if (selectedDrink && !drinkMap[selectedDrink]) {
      setSelectedDrink("")
    }
  }, [drinkMap, selectedDrink])

  const handleConfirm = () => {
    if (!selectedPizza || !selectedDessert || !selectedDrink) return

    if (!stockCheck.valid) {
      toast.error("Insufficient stock", {
        description: stockCheck.missingIngredients.join(", "),
      })
      return
    }

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
  const canAdd = isValid && stockCheck.valid

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
              {pizzas.map((pizza) => {
                const viable = pizzaMap[pizza.id]
                return (
                  <div key={pizza.id}>
                    <RadioGroupItem
                      value={pizza.id}
                      id={`pizza-${pizza.id}`}
                      disabled={!viable}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`pizza-${pizza.id}`}
                      className={cn(
                        "flex min-h-[3.25rem] flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-center text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                        viable
                          ? "cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
                          : "cursor-not-allowed border-dashed bg-muted/40 text-muted-foreground opacity-60"
                      )}
                    >
                      <span>{pizza.name}</span>
                      {!viable && (
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Out of stock
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
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
              {desserts.map((dessert) => {
                const viable = dessertMap[dessert.id]
                return (
                  <div key={dessert.id}>
                    <RadioGroupItem
                      value={dessert.id}
                      id={`dessert-${dessert.id}`}
                      disabled={!viable}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`dessert-${dessert.id}`}
                      className={cn(
                        "flex min-h-[3.25rem] flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-center text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                        viable
                          ? "cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
                          : "cursor-not-allowed border-dashed bg-muted/40 text-muted-foreground opacity-60"
                      )}
                    >
                      <span>{dessert.name}</span>
                      {!viable && (
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Out of stock
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
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
              {drinks.map((drink) => {
                const viable = drinkMap[drink.id]
                return (
                  <div key={drink.id}>
                    <RadioGroupItem
                      value={drink.id}
                      id={`drink-${drink.id}`}
                      disabled={!viable}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`drink-${drink.id}`}
                      className={cn(
                        "flex min-h-[3.25rem] flex-col items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 text-center text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10",
                        viable
                          ? "cursor-pointer hover:bg-secondary hover:text-secondary-foreground"
                          : "cursor-not-allowed border-dashed bg-muted/40 text-muted-foreground opacity-60"
                      )}
                    >
                      <span>{drink.name}</span>
                      {!viable && (
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          Out of stock
                        </span>
                      )}
                    </Label>
                  </div>
                )
              })}
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

        {isValid && !stockCheck.valid && (
          <p className="text-sm text-destructive">
            Not enough ingredients for this combination (and current cart):{" "}
            {stockCheck.missingIngredients.join(", ")}
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canAdd}>
            Add to Cart - ${price}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
