import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Order, OrderStatus, Ingredient, Recipe, MenuItem } from "./types"
import { initialIngredients, recipes, menuItems } from "./data"
import { isSupabaseConfigured } from "./supabase"

interface IngredientUsage {
  ingredientId: string
  amount: number
}

interface POSStore {
  // Orders
  orders: Order[]
  orderCounter: number
  
  // Inventory
  ingredients: Ingredient[]
  recipes: Recipe[]
  
  // Menu
  menuItems: MenuItem[]
  
  // Order Actions
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: number, status: OrderStatus) => void
  assignChef: (orderId: number, chefName: string) => void
  assignServer: (orderId: number, serverName: string) => void
  
  // Stock Actions
  deductStockFromOrder: (usage: IngredientUsage[]) => void
  syncStockFromSheet: (ingredients: Ingredient[]) => void
  updateIngredientStock: (ingredientId: string, newStock: number) => void
  
  // Admin Actions
  resetOrderCounter: () => void
  updateMenuItem: (menuItem: MenuItem) => void
  updateRecipe: (recipe: Recipe) => void

  /** Real-time sync from Supabase (when configured) */
  applyRemoteState: (partial: {
    orders?: Order[]
    orderCounter?: number
    ingredients?: Ingredient[]
  }) => void
}

export const useStore = create<POSStore>()(
  persist(
    (set, get) => ({
      // Initial State
      orders: [],
      orderCounter: 1,
      ingredients: initialIngredients,
      recipes: recipes,
      menuItems: menuItems,

      // Order Actions
      addOrder: (order) => set((state) => ({
        orders: [...state.orders, order],
        orderCounter: state.orderCounter + 1,
      })),

      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date() }
            : order
        ),
      })),

      assignChef: (orderId, chefName) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, chefName, updatedAt: new Date() }
            : order
        ),
      })),

      assignServer: (orderId, serverName) => set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, serverName, updatedAt: new Date() }
            : order
        ),
      })),

      // Stock Actions
      deductStockFromOrder: (usage) => set((state) => ({
        ingredients: state.ingredients.map((ingredient) => {
          const usedItem = usage.find((u) => u.ingredientId === ingredient.id)
          if (usedItem) {
            return {
              ...ingredient,
              stock: Math.max(0, ingredient.stock - usedItem.amount),
            }
          }
          return ingredient
        }),
      })),

      syncStockFromSheet: (ingredients) => set(() => ({
        ingredients,
      })),

      updateIngredientStock: (ingredientId, newStock) => set((state) => ({
        ingredients: state.ingredients.map((ingredient) =>
          ingredient.id === ingredientId
            ? { ...ingredient, stock: newStock }
            : ingredient
        ),
      })),

      // Admin Actions
      resetOrderCounter: () => set(() => ({
        orderCounter: 1,
        orders: [],
      })),

      updateMenuItem: (menuItem) => set((state) => ({
        menuItems: state.menuItems.map((item) =>
          item.id === menuItem.id ? menuItem : item
        ),
      })),

      updateRecipe: (recipe) => set((state) => ({
        recipes: state.recipes.map((r) =>
          r.menuItemId === recipe.menuItemId ? recipe : r
        ),
      })),

      applyRemoteState: (partial) =>
        set((state) => ({
          ...state,
          ...(partial.orders !== undefined ? { orders: partial.orders } : {}),
          ...(partial.orderCounter !== undefined ? { orderCounter: partial.orderCounter } : {}),
          ...(partial.ingredients !== undefined ? { ingredients: partial.ingredients } : {}),
        })),
    }),
    {
      name: "al-dentes-pos-storage",
      partialize: (state) =>
        isSupabaseConfigured()
          ? {}
          : {
              orders: state.orders,
              orderCounter: state.orderCounter,
              ingredients: state.ingredients,
            },
    }
  )
)
