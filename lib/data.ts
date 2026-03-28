import type { MenuItem, Ingredient, Recipe } from "./types"

// Menu Items
export const menuItems: MenuItem[] = [
  // Pizzas
  { id: "pizza-margherita", name: "Margherita", category: "pizza", price: 12, priceL: 16, description: "Classic tomato and mozzarella", available: true },
  { id: "pizza-pepperoni", name: "Pepperoni", category: "pizza", price: 14, priceL: 18, description: "Spicy pepperoni with mozzarella", available: true },
  { id: "pizza-quattro-formaggi", name: "Quattro Formaggi", category: "pizza", price: 15, priceL: 19, description: "Four cheese blend", available: true },
  { id: "pizza-diavola", name: "Diavola", category: "pizza", price: 14, priceL: 18, description: "Spicy salami with chili", available: true },
  { id: "pizza-vegetariana", name: "Vegetariana", category: "pizza", price: 13, priceL: 17, description: "Fresh seasonal vegetables", available: true },

  // Main Courses
  { id: "main-lasagna", name: "Lasagna", category: "main", price: 16, description: "Traditional beef lasagna", available: true },
  { id: "main-carbonara", name: "Spaghetti Carbonara", category: "main", price: 14, description: "Creamy egg and pancetta", available: true },
  { id: "main-bolognese", name: "Tagliatelle Bolognese", category: "main", price: 14, description: "Slow-cooked meat sauce", available: true },
  { id: "main-risotto", name: "Risotto ai Funghi", category: "main", price: 15, description: "Mushroom risotto", available: true },
  { id: "main-chicken-parm", name: "Chicken Parmigiana", category: "main", price: 18, description: "Breaded chicken with tomato and cheese", available: true },

  // Desserts
  { id: "dessert-tiramisu", name: "Tiramisu", category: "dessert", price: 8, description: "Classic coffee dessert", available: true },
  { id: "dessert-panna-cotta", name: "Panna Cotta", category: "dessert", price: 7, description: "Vanilla cream with berry sauce", available: true },
  { id: "dessert-gelato", name: "Gelato (3 scoops)", category: "dessert", price: 6, description: "Assorted Italian ice cream", available: true },
  { id: "dessert-cannoli", name: "Cannoli", category: "dessert", price: 7, description: "Sicilian pastry with ricotta", available: true },

  // Drinks
  { id: "drink-water", name: "Sparkling Water", category: "drink", price: 3, available: true },
  { id: "drink-soda", name: "Soda", category: "drink", price: 3, available: true },
  { id: "drink-lemonade", name: "Fresh Lemonade", category: "drink", price: 4, available: true },
  { id: "drink-espresso", name: "Espresso", category: "drink", price: 3, available: true },
  { id: "drink-cappuccino", name: "Cappuccino", category: "drink", price: 4, available: true },

  // Set Menus
  { id: "set-pizza-combo", name: "Pizza Combo", category: "set", price: 22, description: "Pizza + Dessert + Drink", available: true },
  { id: "set-grand-mix", name: "Grand Mix Box", category: "set", price: 28, description: "Pizza + Dessert + Drink + Wings & Fries", available: true },
]

// Ingredients
export const initialIngredients: Ingredient[] = [
  { id: "ing-carbonated-water", name: "Carbonated Water", stock: 50, unit: "cups", lowStockThreshold: 10 },
  { id: "ing-mint", name: "Mint", stock: 30, unit: "leaves", lowStockThreshold: 5 },
  { id: "ing-flour", name: "Flour", stock: 100, unit: "grams", lowStockThreshold: 20 },
  { id: "ing-ketchup", name: "Ketchup", stock: 40, unit: "cups", lowStockThreshold: 8 },
  { id: "ing-mozzarella", name: "Mozzarella", stock: 60, unit: "portions", lowStockThreshold: 12 },
  { id: "ing-basil", name: "Basil", stock: 30, unit: "leaves", lowStockThreshold: 5 },
  { id: "ing-olive-oil", name: "Olive Oil", stock: 50, unit: "ml", lowStockThreshold: 10 },
  { id: "ing-parmesan", name: "Parmesan", stock: 25, unit: "portions", lowStockThreshold: 5 },
  { id: "ing-cheddar-cheese", name: "Cheddar Cheese", stock: 40, unit: "portions", lowStockThreshold: 8 },
  { id: "ing-bell-pepper", name: "Bell Pepper", stock: 35, unit: "pieces", lowStockThreshold: 7 },
  { id: "ing-raw-chicken", name: "Raw Chicken", stock: 50, unit: "portions", lowStockThreshold: 10 },
  { id: "ing-potato", name: "Potato", stock: 60, unit: "pieces", lowStockThreshold: 12 },
  { id: "ing-salt", name: "Salt", stock: 100, unit: "grams", lowStockThreshold: 20 },
  { id: "ing-bbq-sauce", name: "BBQ Sauce", stock: 40, unit: "cups", lowStockThreshold: 8 },
  { id: "ing-milk", name: "Milk", stock: 50, unit: "ml", lowStockThreshold: 10 },
  { id: "ing-egg", name: "Egg", stock: 60, unit: "pieces", lowStockThreshold: 12 },
  { id: "ing-sugar", name: "Sugar", stock: 100, unit: "grams", lowStockThreshold: 20 },
  { id: "ing-coffee-powder", name: "Coffee Powder", stock: 30, unit: "grams", lowStockThreshold: 5 },
  { id: "ing-cocoa-powder", name: "Cocoa Powder", stock: 30, unit: "grams", lowStockThreshold: 5 },
  { id: "ing-heavy-cream", name: "Heavy Cream", stock: 40, unit: "ml", lowStockThreshold: 8 },
  { id: "ing-vanilla", name: "Vanilla", stock: 20, unit: "ml", lowStockThreshold: 4 },
  { id: "ing-blueberry", name: "Blueberry", stock: 30, unit: "portions", lowStockThreshold: 6 },
  { id: "ing-lemon", name: "Lemon", stock: 25, unit: "pieces", lowStockThreshold: 5 },
  { id: "ing-cilantro", name: "Cilantro", stock: 20, unit: "leaves", lowStockThreshold: 4 },
]

// Recipes - ingredient mappings for each menu item
export const recipes: Recipe[] = [
  // Pizzas (M size - L uses 1.5x)
  { menuItemId: "pizza-margherita", ingredients: [
    { ingredientId: "ing-dough", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
  ]},
  { menuItemId: "pizza-pepperoni", ingredients: [
    { ingredientId: "ing-dough", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-pepperoni", amount: 1 },
  ]},
  { menuItemId: "pizza-quattro-formaggi", ingredients: [
    { ingredientId: "ing-dough", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 0.5 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-parmesan", amount: 1 },
    { ingredientId: "ing-gorgonzola", amount: 1 },
    { ingredientId: "ing-fontina", amount: 1 },
  ]},
  { menuItemId: "pizza-diavola", ingredients: [
    { ingredientId: "ing-dough", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-salami", amount: 1 },
  ]},
  { menuItemId: "pizza-vegetariana", ingredients: [
    { ingredientId: "ing-dough", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-vegetables", amount: 1 },
  ]},

  // Main Courses
  { menuItemId: "main-lasagna", ingredients: [
    { ingredientId: "ing-pasta", amount: 1 },
    { ingredientId: "ing-beef", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-parmesan", amount: 0.5 },
  ]},
  { menuItemId: "main-carbonara", ingredients: [
    { ingredientId: "ing-pasta", amount: 1 },
    { ingredientId: "ing-pancetta", amount: 1 },
    { ingredientId: "ing-eggs", amount: 2 },
    { ingredientId: "ing-parmesan", amount: 1 },
    { ingredientId: "ing-cream", amount: 0.5 },
  ]},
  { menuItemId: "main-bolognese", ingredients: [
    { ingredientId: "ing-pasta", amount: 1 },
    { ingredientId: "ing-beef", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-parmesan", amount: 0.5 },
  ]},
  { menuItemId: "main-risotto", ingredients: [
    { ingredientId: "ing-rice", amount: 1 },
    { ingredientId: "ing-mushrooms", amount: 1 },
    { ingredientId: "ing-parmesan", amount: 1 },
    { ingredientId: "ing-cream", amount: 0.5 },
  ]},
  { menuItemId: "main-chicken-parm", ingredients: [
    { ingredientId: "ing-chicken", amount: 1 },
    { ingredientId: "ing-tomato-sauce", amount: 1 },
    { ingredientId: "ing-mozzarella", amount: 1 },
    { ingredientId: "ing-parmesan", amount: 0.5 },
  ]},

  // Desserts
  { menuItemId: "dessert-tiramisu", ingredients: [
    { ingredientId: "ing-mascarpone", amount: 1 },
    { ingredientId: "ing-ladyfingers", amount: 1 },
    { ingredientId: "ing-coffee", amount: 1 },
    { ingredientId: "ing-eggs", amount: 1 },
  ]},
  { menuItemId: "dessert-panna-cotta", ingredients: [
    { ingredientId: "ing-cream", amount: 1 },
    { ingredientId: "ing-berries", amount: 1 },
  ]},
  { menuItemId: "dessert-gelato", ingredients: [
    { ingredientId: "ing-gelato", amount: 3 },
  ]},
  { menuItemId: "dessert-cannoli", ingredients: [
    { ingredientId: "ing-cannoli-shells", amount: 2 },
    { ingredientId: "ing-ricotta", amount: 1 },
  ]},

  // Set menus include wings & fries for grand mix
  { menuItemId: "set-grand-mix-extras", ingredients: [
    { ingredientId: "ing-wings", amount: 1 },
    { ingredientId: "ing-fries", amount: 1 },
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
