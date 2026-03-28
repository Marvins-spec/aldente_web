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

// Google Sheets API Configuration
const GOOGLE_SHEET_URL = process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || ""

// ==================== ORDER API ====================

export async function getOrders(): Promise<Order[]> {
  // In production, this would fetch from a real API
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
    return supabaseCreateOrder(customerName, orderItems, totalPrice, ingredientUsage)
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
    await supabasePatchOrder(orderId, { chefName, status: "cooking" })
    return { ...prev, chefName, status: "cooking", updatedAt: new Date() }
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
    return { ...prev, status: "ready", updatedAt: new Date() }
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
    return { ...prev, serverName, updatedAt: new Date() }
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
    return { ...prev, status: "served", updatedAt: new Date() }
  }

  const store = useStore.getState()
  store.updateOrderStatus(orderId, "served")

  const order = store.orders.find((o) => o.id === orderId)
  if (!order) throw new Error("Order not found")
  return order
}

// ==================== STOCK API ====================

export async function getStockFromSheet(): Promise<Ingredient[]> {
  if (!GOOGLE_SHEET_URL) {
    console.warn("Google Sheet URL not configured, using local data")
    return useStore.getState().ingredients
  }

  try {
    const response = await fetch(`${GOOGLE_SHEET_URL}?action=getStock`)
    if (!response.ok) throw new Error("Failed to fetch stock from Google Sheet")
    
    const data = await response.json()
    return data.ingredients as Ingredient[]
  } catch (error) {
    console.error("Error fetching stock from Google Sheet:", error)
    return useStore.getState().ingredients
  }
}

export async function updateStockToSheet(ingredients: Ingredient[]): Promise<boolean> {
  if (!GOOGLE_SHEET_URL) {
    console.warn("Google Sheet URL not configured, skipping sync")
    return false
  }

  try {
    const response = await fetch(`${GOOGLE_SHEET_URL}?action=updateStock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients }),
    })
    
    return response.ok
  } catch (error) {
    console.error("Error updating stock to Google Sheet:", error)
    return false
  }
}

/** After local/Supabase stock change, push full list to Sheet when URL is set */
export async function pushIngredientsToSheetIfConfigured(
  ingredients: Ingredient[]
): Promise<void> {
  if (!GOOGLE_SHEET_URL) return
  await updateStockToSheet(ingredients)
}

export async function syncStockFromSheet(): Promise<void> {
  const ingredients = await getStockFromSheet()
  useStore.getState().syncStockFromSheet(ingredients)
  if (isSupabaseConfigured()) {
    await supabaseBulkSetIngredients(ingredients)
  }
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

    // Handle set menus
    if (item.category === "set" && item.setDetails) {
      // Pizza from set
      const pizzaRecipe = getRecipe(item.setDetails.pizza)
      if (pizzaRecipe) {
        for (const ing of pizzaRecipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(ing.ingredientId, current + ing.amount * item.quantity)
        }
      }

      // Dessert from set
      const dessertRecipe = getRecipe(item.setDetails.dessert)
      if (dessertRecipe) {
        for (const ing of dessertRecipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(ing.ingredientId, current + ing.amount * item.quantity)
        }
      }

      // Grand Mix Box extras (wings & fries)
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
      // Regular menu item
      const recipe = getRecipe(item.id)
      if (recipe) {
        for (const ing of recipe.ingredients) {
          const current = usageMap.get(ing.ingredientId) || 0
          usageMap.set(ing.ingredientId, current + ing.amount * item.quantity * sizeMultiplier)
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
    const ingredient = currentStock.find(i => i.id === ingredientId)
    if (!ingredient || ingredient.stock < amount) {
      const name = ingredient?.name || ingredientId
      missingIngredients.push(`${name} (need ${amount}, have ${ingredient?.stock || 0})`)
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
    const ingredient = ingredients.find(i => i.id === recipeIng.ingredientId)
    if (!ingredient) return 0

    const possibleCount = Math.floor(ingredient.stock / (recipeIng.amount * sizeMultiplier))
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
    await pushIngredientsToSheetIfConfigured([...state.ingredients, ingredient])
    return
  }
  state.addIngredient(ingredient)
  await pushIngredientsToSheetIfConfigured(useStore.getState().ingredients)
}

export async function removeIngredient(ingredientId: string): Promise<void> {
  const state = useStore.getState()
  const next = state.ingredients.filter((i) => i.id !== ingredientId)
  if (next.length === state.ingredients.length) {
    throw new Error("Ingredient not found")
  }
  if (isSupabaseConfigured()) {
    await supabaseDeleteIngredient(ingredientId)
    await pushIngredientsToSheetIfConfigured(next)
    return
  }
  state.removeIngredient(ingredientId)
  await pushIngredientsToSheetIfConfigured(useStore.getState().ingredients)
}
