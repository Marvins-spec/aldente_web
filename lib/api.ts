import type { Order, OrderItem, Ingredient, Recipe, CartItem, PizzaSize } from "./types"
import { useStore } from "./store"
import { getRecipe } from "./data"
import { isSupabaseConfigured } from "./supabase"
import {
  supabaseBulkSetIngredients,
  supabaseCreateOrder,
  supabaseDeleteIngredient,
  supabaseInsertIngredient,
  supabasePatchOrder,
  supabaseResetPOS,
  supabaseUpdateIngredientStock,
} from "./supabase-db"

// ==================== ORDER API ====================

export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    // fallback: ideally you should fetch from Supabase table
    return useStore.getState().orders
  }
  return useStore.getState().orders
}

export async function createOrder(
  customerName: string,
  items: CartItem[],
  totalPrice: number
): Promise<Order> {
  const store = useStore.getState()

  const stockValidation = validateStockForItems(items, store.ingredients)
  if (!stockValidation.valid) {
    throw new Error(`Insufficient stock: ${stockValidation.missingIngredients.join(", ")}`)
  }

  const ingredientUsage = calculateIngredientUsage(items)
  const orderItems = items.map(({ cartId, ...item }) => item)

  if (isSupabaseConfigured()) {
    return await supabaseCreateOrder(
      customerName,
      orderItems,
      totalPrice,
      ingredientUsage
    )
  }

  const order: Order = {
    id: store.orderCounter,
    customerName,
    items: orderItems,
    status: "waiting",
    createdAt: new Date(),
    updatedAt: new Date(),
    totalPrice,
  }

  store.addOrder(order)
  store.deductStockFromOrder(ingredientUsage)

  return order
}

export async function acceptOrder(orderId: number, chefName: string): Promise<Order> {
  if (isSupabaseConfigured()) {
    const prev = useStore.getState().orders.find((o) => o.id === orderId)
    if (!prev) throw new Error("Order not found")

    await supabasePatchOrder(orderId, {
      chefName,
      status: "cooking",
    })

    return {
      ...prev,
      chefName,
      status: "cooking",
      updatedAt: new Date(),
    }
  }

  const store = useStore.getState()
  store.assignChef(orderId, chefName)
  store.updateOrderStatus(orderId, "cooking")

  const order = store.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  return order
}

export async function markReady(orderId: number): Promise<Order> {
  if (isSupabaseConfigured()) {
    const prev = useStore.getState().orders.find((o) => o.id === orderId)
    if (!prev) throw new Error("Order not found")

    await supabasePatchOrder(orderId, { status: "ready" })

    return {
      ...prev,
      status: "ready",
      updatedAt: new Date(),
    }
  }

  const store = useStore.getState()
  store.updateOrderStatus(orderId, "ready")

  const order = store.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  return order
}

export async function takeServing(orderId: number, serverName: string): Promise<Order> {
  if (isSupabaseConfigured()) {
    const prev = useStore.getState().orders.find((o) => o.id === orderId)
    if (!prev) throw new Error("Order not found")

    await supabasePatchOrder(orderId, { serverName })

    return {
      ...prev,
      serverName,
      updatedAt: new Date(),
    }
  }

  const store = useStore.getState()
  store.assignServer(orderId, serverName)

  const order = store.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  return order
}

export async function markServed(orderId: number): Promise<Order> {
  if (isSupabaseConfigured()) {
    const prev = useStore.getState().orders.find((o) => o.id === orderId)
    if (!prev) throw new Error("Order not found")

    await supabasePatchOrder(orderId, { status: "served" })

    return {
      ...prev,
      status: "served",
      updatedAt: new Date(),
    }
  }

  const store = useStore.getState()
  store.updateOrderStatus(orderId, "served")

  const order = store.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  return order
}

// ==================== STOCK SYNC (SUPABASE) ====================

export async function syncStockFromSupabase(ingredients: Ingredient[]): Promise<void> {
  if (!isSupabaseConfigured()) return

  await supabaseBulkSetIngredients(ingredients)
}

// ==================== STOCK CALCULATION ====================

interface IngredientUsage {
  ingredientId: string
  amount: number
}

export function calculateIngredientUsage(items: CartItem[]): IngredientUsage[] {
  const usageMap = new Map<string, number>()

  for (const item of items) {
    const sizeMultiplier = item.size === "L" ? 1.5 : 1

    // Set menu
    if (item.category === "set" && item.setDetails) {
      const pizzaRecipe = getRecipe(item.setDetails.pizza)
      if (pizzaRecipe) {
        for (const ing of pizzaRecipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(ing.ingredientId, current + ing.amount * item.quantity)
        }
      }

      const dessertRecipe = getRecipe(item.setDetails.dessert)
      if (dessertRecipe) {
        for (const ing of dessertRecipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(ing.ingredientId, current + ing.amount * item.quantity)
        }
      }

      if (item.setDetails.type === "grand-mix-box") {
        const extrasRecipe = getRecipe("set-grand-mix-extras")
        if (extrasRecipe) {
          for (const ing of extrasRecipe.ingredients) {
            const current = usageMap.get(ing.ingredientId) || 0
            usageMap.set(ing.ingredientId, current + ing.amount * item.quantity)
          }
        }
      }
    } else {
      const recipe = getRecipe(item.id)
      if (recipe) {
        for (const ing of recipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(
            ing.ingredientId,
            current + ing.amount * item.quantity * sizeMultiplier
          )
        }
      }
    }
  }

  return Array.from(usageMap.entries()).map(([ingredientId, amount]) => ({
    ingredientId,
    amount,
  }))
}

interface StockValidation {
  valid: boolean
  missingIngredients: string[]
}

export function validateStockForItems(
  items: CartItem[],
  currentStock: Ingredient[]
): StockValidation {
  const usage = calculateIngredientUsage(items)
  const missingIngredients: string[] = []

  for (const { ingredientId, amount } of usage) {
    const ingredient = currentStock.find((i) => i.id === ingredientId)

    if (!ingredient || ingredient.stock < amount) {
      const name = ingredient?.name || ingredientId
      missingIngredients.push(
        `${name} (need ${amount}, have ${ingredient?.stock || 0})`
      )
    }
  }

  return {
    valid: missingIngredients.length === 0,
    missingIngredients,
  }
}

export function calculateMaxProducible(
  menuItemId: string,
  ingredients: Ingredient[],
  size: PizzaSize = "M"
): number {
  const recipe = getRecipe(menuItemId)
  if (!recipe) return 0

  const sizeMultiplier = size === "L" ? 1.5 : 1
  let maxCount = Infinity

  for (const recipeIng of recipe.ingredients) {
    const ingredient = ingredients.find((i) => i.id === recipeIng.ingredientId)
    if (!ingredient) return 0

    const possibleCount = Math.floor(
      ingredient.stock / (recipeIng.amount * sizeMultiplier)
    )

    maxCount = Math.min(maxCount, possibleCount)
  }

  return maxCount === Infinity ? 0 : maxCount
}

// ==================== ADMIN API ====================

export async function resetOrderCounter(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseResetPOS()
    return
  }

  useStore.getState().resetOrderCounter()
}

export async function updateIngredientStock(
  ingredientId: string,
  newStock: number
): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseUpdateIngredientStock(ingredientId, newStock)
    return
  }

  useStore.getState().updateIngredientStock(ingredientId, newStock)
}

export async function addIngredient(ingredient: Ingredient): Promise<void> {
  const state = useStore.getState()

  if (state.ingredients.some((i) => i.id === ingredient.id)) {
    throw new Error("An ingredient with this ID already exists")
  }

  if (isSupabaseConfigured()) {
    await supabaseInsertIngredient(ingredient)
    return
  }

  state.addIngredient(ingredient)
}

export async function removeIngredient(ingredientId: string): Promise<void> {
  const state = useStore.getState()
  const next = state.ingredients.filter((i) => i.id !== ingredientId)

  if (next.length === state.ingredients.length) {
    throw new Error("Ingredient not found")
  }

  if (isSupabaseConfigured()) {
    await supabaseDeleteIngredient(ingredientId)
    return
  }

  state.removeIngredient(ingredientId)
}