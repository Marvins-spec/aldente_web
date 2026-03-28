"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { resetOrderCounter, updateIngredientStock } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, RotateCcw, Package, UtensilsCrossed, Edit2 } from "lucide-react"
import { getRecipe } from "@/lib/data"

export default function AdminPage() {
  const { orderCounter, menuItems, recipes, ingredients, orders } = useStore()
  const [editingStock, setEditingStock] = useState<{id: string, name: string, stock: number} | null>(null)
  const [newStockValue, setNewStockValue] = useState("")

  const handleResetOrders = async () => {
    try {
      await resetOrderCounter()
      toast.success("Order counter reset", {
        description: "All orders cleared and counter reset to 1",
      })
    } catch (error) {
      toast.error("Failed to reset orders")
    }
  }

  const handleUpdateStock = async () => {
    if (!editingStock || newStockValue === "") return

    const value = parseInt(newStockValue)
    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid number")
      return
    }

    try {
      await updateIngredientStock(editingStock.id, value)
      toast.success(`Updated ${editingStock.name} stock to ${value}`)
      setEditingStock(null)
      setNewStockValue("")
    } catch (error) {
      toast.error("Failed to update stock")
    }
  }

  const getIngredientName = (id: string) => {
    return ingredients.find(i => i.id === id)?.name || id
  }

  const activeOrders = orders.filter(o => o.status !== "served").length
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0)

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground">
              System configuration and management
            </p>
          </div>
          <Badge variant="secondary" className="px-4 py-2">
            <Settings className="mr-2 h-4 w-4" />
            Admin Mode
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Stats Overview */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Order Number
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">#{orderCounter}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeOrders}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{orders.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="system" className="h-full">
          <TabsList className="mb-4 bg-secondary">
            <TabsTrigger
              value="system"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              System
            </TabsTrigger>
            <TabsTrigger
              value="menu"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Menu Items
            </TabsTrigger>
            <TabsTrigger
              value="recipes"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Recipes
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Edit Stock
            </TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Reset Orders */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Reset Order Counter
                  </CardTitle>
                  <CardDescription>
                    Clear all orders and reset the counter to 1. This action cannot be undone.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Reset All Orders</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will delete all orders and reset the order counter to 1.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetOrders}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, Reset Everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>

              {/* Google Sheets Config */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Google Sheets Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Google Sheets for stock synchronization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Set the <code className="text-primary">NEXT_PUBLIC_GOOGLE_SHEET_URL</code> environment
                      variable to enable stock sync with Google Sheets.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Example: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="mt-0">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  Menu Items
                </CardTitle>
                <CardDescription>
                  View all menu items (editing coming soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price (M)</TableHead>
                      <TableHead className="text-right">Price (L)</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {menuItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="capitalize">{item.category}</TableCell>
                        <TableCell className="text-right">${item.price}</TableCell>
                        <TableCell className="text-right">
                          {item.priceL ? `$${item.priceL}` : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.available ? "secondary" : "destructive"}>
                            {item.available ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recipes" className="mt-0">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle>Recipe Mappings</CardTitle>
                <CardDescription>
                  Ingredient requirements for each menu item
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {menuItems
                    .filter(item => item.category !== "set" && item.category !== "drink")
                    .map((item) => {
                      const recipe = getRecipe(item.id)
                      if (!recipe) return null

                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border bg-secondary/30 p-4"
                        >
                          <h4 className="font-medium">{item.name}</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {recipe.ingredients.map((ing) => (
                              <Badge key={ing.ingredientId} variant="outline">
                                {getIngredientName(ing.ingredientId)}: {ing.amount}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock" className="mt-0">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Edit Stock Levels
                </CardTitle>
                <CardDescription>
                  Manually adjust ingredient stock levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead className="text-right">Current Stock</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell className="text-right">{ingredient.stock}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {ingredient.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingStock({
                                    id: ingredient.id,
                                    name: ingredient.name,
                                    stock: ingredient.stock,
                                  })
                                  setNewStockValue(ingredient.stock.toString())
                                }}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card">
                              <DialogHeader>
                                <DialogTitle>Edit Stock</DialogTitle>
                                <DialogDescription>
                                  Update stock level for {editingStock?.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label htmlFor="stock-value">New Stock Value</Label>
                                <Input
                                  id="stock-value"
                                  type="number"
                                  min="0"
                                  value={newStockValue}
                                  onChange={(e) => setNewStockValue(e.target.value)}
                                  className="mt-2 bg-input"
                                />
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingStock(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateStock}>
                                  Update Stock
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
