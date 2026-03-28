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
  { id: "ing-dough", name: "Pizza Dough", stock: 50, unit: "portions", lowStockThreshold: 10 },
  { id: "ing-tomato-sauce", name: "Tomato Sauce", stock: 40, unit: "cups", lowStockThreshold: 8 },
  { id: "ing-mozzarella", name: "Mozzarella", stock: 60, unit: "portions", lowStockThreshold: 12 },
  { id: "ing-pepperoni", name: "Pepperoni", stock: 30, unit: "portions", lowStockThreshold: 6 },
  { id: "ing-parmesan", name: "Parmesan", stock: 25, unit: "portions", lowStockThreshold: 5 },
  { id: "ing-gorgonzola", name: "Gorgonzola", stock: 20, unit: "portions", lowStockThreshold: 4 },
  { id: "ing-fontina", name: "Fontina", stock: 20, unit: "portions", lowStockThreshold: 4 },
  { id: "ing-salami", name: "Spicy Salami", stock: 25, unit: "portions", lowStockThreshold: 5 },
  { id: "ing-vegetables", name: "Mixed Vegetables", stock: 35, unit: "portions", lowStockThreshold: 7 },
  { id: "ing-pasta", name: "Pasta", stock: 40, unit: "portions", lowStockThreshold: 8 },
  { id: "ing-beef", name: "Ground Beef", stock: 30, unit: "portions", lowStockThreshold: 6 },
  { id: "ing-pancetta", name: "Pancetta", stock: 25, unit: "portions", lowStockThreshold: 5 },
  { id: "ing-eggs", name: "Eggs", stock: 50, unit: "pieces", lowStockThreshold: 10 },
  { id: "ing-cream", name: "Cream", stock: 30, unit: "cups", lowStockThreshold: 6 },
  { id: "ing-mushrooms", name: "Mushrooms", stock: 25, unit: "portions", lowStockThreshold: 5 },
  { id: "ing-rice", name: "Arborio Rice", stock: 20, unit: "portions", lowStockThreshold: 4 },
  { id: "ing-chicken", name: "Chicken Breast", stock: 20, unit: "pieces", lowStockThreshold: 4 },
  { id: "ing-mascarpone", name: "Mascarpone", stock: 15, unit: "portions", lowStockThreshold: 3 },
  { id: "ing-ladyfingers", name: "Ladyfingers", stock: 20, unit: "portions", lowStockThreshold: 4 },
  { id: "ing-coffee", name: "Espresso Coffee", stock: 40, unit: "shots", lowStockThreshold: 8 },
  { id: "ing-gelato", name: "Gelato", stock: 30, unit: "scoops", lowStockThreshold: 6 },
  { id: "ing-ricotta", name: "Ricotta", stock: 20, unit: "portions", lowStockThreshold: 4 },
  { id: "ing-cannoli-shells", name: "Cannoli Shells", stock: 25, unit: "pieces", lowStockThreshold: 5 },
  { id: "ing-wings", name: "Chicken Wings", stock: 30, unit: "portions", lowStockThreshold: 6 },
  { id: "ing-fries", name: "French Fries", stock: 40, unit: "portions", lowStockThreshold: 8 },
  { id: "ing-berries", name: "Mixed Berries", stock: 20, unit: "portions", lowStockThreshold: 4 },
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
