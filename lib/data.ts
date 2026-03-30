import type { MenuItem, Ingredient, Recipe } from "./types"

// Menu Items
export const menuItems: MenuItem[] = [
  // Pizzas
  { id: "pizza-margherita", name: "Pizza Margherita", category: "pizza", price: 390, priceL: 440, available: true },
  { id: "pizza-prosciutto", name: "Pizza Parma Ham", category: "pizza", price: 390, priceL: 440, available: true },
  { id: "pizza-cheese", name: "Pizza Cheese", category: "pizza", price: 390, priceL: 440, available: true },
  { id: "pizza-veggie-delight", name: "Pizza Veggie Delight", category: "pizza", price: 390, priceL: 440, available: true },

  { id: "wings-fries-combo", name: "Wings & Fries Combo", category: "main", price: 390, available: true },

  { id: "tiramisu", name: "Tiramisu", category: "dessert", price: 350, available: true },
  { id: "panna-cotta", name: "Panna Cotta", category: "dessert", price: 350, available: true },

  { id: "sparkling-water", name: "Sparkling Water", category: "drink", price: 150, available: true },
  { id: "italian-soda", name: "Italian Soda", category: "drink", price: 260, available: true },
  { id: "cola", name: "Cola", category: "drink", price: 260, available: true },

  // Set Menus
  { id: "set-pizza-combo", name: "Pizza Combo", category: "set", price: 890, description: "Pizza + Dessert + Drink", available: true },
  { id: "set-grand-mix", name: "Grand Mix Box", category: "set", price: 1290, description: "Pizza + Dessert + Drink + Wings & Fries", available: true },
]

// Ingredients
export const initialIngredients: Ingredient[] = [
  { id: "ing-flour", name: "Flour", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-ketchup", name: "Ketchup", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-mozzarella", name: "Mozzarella", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-basil", name: "Basil", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-olive-oil", name: "Olive Oil", stock: 20, unit: "units", lowStockThreshold: 10 },
  
  { id: "ing-parmesan", name: "Parmesan", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-cheddar-cheese", name: "Cheddar Cheese", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-bell-pepper", name: "Bell Pepper", stock: 20, unit: "units", lowStockThreshold: 10 },
  
  { id: "ing-raw-chicken", name: "Raw Chicken", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-potato", name: "Potato", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-salt", name: "Salt", stock: 20, unit: "units", lowStockThreshold: 10 },
  
  { id: "ing-heavy-cream", name: "Heavy Cream", stock: 20, unit: "ml", lowStockThreshold: 10 },
  { id: "ing-sugar", name: "Sugar", stock: 20, unit: "units", lowStockThreshold: 10 },
  { id: "ing-vanilla", name: "Vanilla", stock: 20, unit: "ml", lowStockThreshold: 10 },
  { id: "ing-egg", name: "Egg", stock: 20, unit: "units", lowStockThreshold: 10 },
  
  { id: "ing-carbonated-water", name: "Carbonated Water", stock: 20, unit: "ml", lowStockThreshold: 10 },
  { id: "ing-lemon", name: "Lemon", stock: 25, unit: "pieces", lowStockThreshold: 10 },
]


// Recipes - ingredient mappings for each menu item
export const recipes: Recipe[] = [
  // Pizzas (M size - L uses 1.5x)
  { menuItemId: "pizza-margherita", ingredients: [
    { ingredientId: "ing-flour", amount: 1 },
    { ingredientId: "ing-ketchup", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-basil", amount: 1 },
    { ingredientId: "ing-olive-oil", amount: 1 },
  ]},
  
  { menuItemId: "pizza-prosciutto", ingredients: [
    { ingredientId: "ing-flour", amount: 1 },
    { ingredientId: "ing-ketchup", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-basil", amount: 1 },
    { ingredientId: "ing-olive-oil", amount: 1 },
  ]},
  
  { menuItemId: "pizza-cheese", ingredients: [
    { ingredientId: "ing-flour", amount: 1 },
    { ingredientId: "ing-ketchup", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-basil", amount: 1 },
    { ingredientId: "ing-olive-oil", amount: 1 },
  ]},
  
  { menuItemId: "pizza-veggie-delight", ingredients: [
    { ingredientId: "ing-flour", amount: 1 },
    { ingredientId: "ing-ketchup", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-basil", amount: 1 },
    { ingredientId: "ing-olive-oil", amount: 1 },
  ]},
  
  { menuItemId: "wings-fries-combo", ingredients: [
    { ingredientId: "ing-raw-chicken", amount: 1 },
    { ingredientId: "ing-ketchup", amount: 1 },
    { ingredientId: "ing-potato", amount: 1 },
    { ingredientId: "ing-salt", amount: 1 },
  ]},
  
  { menuItemId: "tiramisu", ingredients: [
    { ingredientId: "ing-heavy-cream", amount: 1 },
    { ingredientId: "ing-sugar", amount: 1 },
    { ingredientId: "ing-vanilla", amount: 1 },
    { ingredientId: "ing-egg", amount: 1 },
  ]},
  
  { menuItemId: "panna-cotta", ingredients: [
    { ingredientId: "ing-heavy-cream", amount: 1 },
    { ingredientId: "ing-sugar", amount: 1 },
    { ingredientId: "ing-vanilla", amount: 1 },
    { ingredientId: "ing-egg", amount: 1 },
  ]},
  
  { menuItemId: "sparkling-water", ingredients: [
    { ingredientId: "ing-carbonated-water", amount: 1 },
    { ingredientId: "ing-sugar", amount: 1 },
  ]},
  
  { menuItemId: "italian-soda", ingredients: [
    { ingredientId: "ing-carbonated-water", amount: 1 },
    { ingredientId: "ing-lemon", amount: 1 },
    { ingredientId: "ing-sugar", amount: 1 },
  ]},
  
  { menuItemId: "cola", ingredients: [
    { ingredientId: "ing-carbonated-water", amount: 1 },
    { ingredientId: "ing-lemon", amount: 1 },
    { ingredientId: "ing-sugar", amount: 1 },
  ]},

  // Set menus include wings & fries for grand mix
  { menuItemId: "set-grand-mix-extras", ingredients: [
    { ingredientId: "ing-raw-chicken", amount: 1 },
    { ingredientId: "ing-potato", amount: 1 },
    { ingredientId: "ing-salt", amount: 1 },
    { ingredientId: "ing-bbq-sauce", amount: 1 },
  ]},
]

// Helper to get recipe by menu item ID
export function getRecipe(menuItemId: string): Recipe | undefined {
  return recipes.find(r => r.menuItemId === menuItemId)
}

// Helper to get menu item by ID
export function getMenuItem(id: string): MenuItem | undefined {
  return menuItems.find(item => item.id === id)
}

// Helper to get pizzas for set menu selection
export function getPizzas(): MenuItem[] {
  return menuItems.filter(item => item.category === "pizza")
}

// Helper to get desserts for set menu selection
export function getDesserts(): MenuItem[] {
  return menuItems.filter(item => item.category === "dessert")
}

// Helper to get drinks for set menu selection
export function getDrinks(): MenuItem[] {
  return menuItems.filter(item => item.category === "drink")
}
