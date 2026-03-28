// Order Types
export type OrderStatus = "waiting" | "cooking" | "ready" | "served"

export type MenuCategory = "pizza" | "main" | "dessert" | "drink" | "set"

export type PizzaSize = "M" | "L"

export interface OrderItem {
  id: string
  name: string
  category: MenuCategory
  quantity: number
  size?: PizzaSize
  price: number
  setDetails?: SetMenuDetails
}

export interface SetMenuDetails {
  type: "pizza-combo" | "grand-mix-box"
  pizza: string
  dessert: string
  drink: string
}

export interface Order {
  id: number
  customerName: string
  items: OrderItem[]
  status: OrderStatus
  chefName?: string
  serverName?: string
  createdAt: Date
  updatedAt: Date
  totalPrice: number
}

// Stock & Recipe Types
export interface Ingredient {
  id: string
  name: string
  stock: number
  unit: string
  lowStockThreshold: number
}

export interface RecipeIngredient {
  ingredientId: string
  amount: number
}

export interface Recipe {
  menuItemId: string
  ingredients: RecipeIngredient[]
}

// Menu Types
export interface MenuItem {
  id: string
  name: string
  category: MenuCategory
  price: number
  priceL?: number // For pizza large size
  description?: string
  available: boolean
}

// Cart Types
export interface CartItem extends OrderItem {
  cartId: string
}
