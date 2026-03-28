"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { addIngredient, removeIngredient, resetOrderCounter, updateIngredientStock } from "@/lib/api"
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
import { Settings, RotateCcw, Package, UtensilsCrossed, Edit2, Plus, Trash2, LogOut } from "lucide-react"
import { getRecipe } from "@/lib/data"

const emptyNewIngredient = {
  id: "",
  name: "",
  stock: "0",
  unit: "",
  lowStockThreshold: "10",
}

export default function AdminPage() {
  const router = useRouter()
  const { orderCounter, menuItems, recipes, ingredients, orders } = useStore()
  const [editingStock, setEditingStock] = useState<{id: string, name: string, stock: number} | null>(null)
  const [newStockValue, setNewStockValue] = useState("")
  const [addIngredientOpen, setAddIngredientOpen] = useState(false)
  const [newIngredientForm, setNewIngredientForm] = useState(emptyNewIngredient)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

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

  const handleAddIngredientSubmit = async () => {
    const id = newIngredientForm.id.trim()
    const name = newIngredientForm.name.trim()
    const unit = newIngredientForm.unit.trim()
    const stock = parseFloat(newIngredientForm.stock)
    const lowStockThreshold = parseFloat(newIngredientForm.lowStockThreshold)

    if (!id || !/^[\w-]+$/.test(id)) {
      toast.error("ID must contain only letters, numbers, hyphens, underscores (e.g. ing-mushrooms)")
      return
    }
    if (!name || !unit) {
      toast.error("Name and unit are required")
      return
    }
    if (isNaN(stock) || stock < 0 || isNaN(lowStockThreshold) || lowStockThreshold < 0) {
      toast.error("Stock and threshold must be valid numbers (0 or greater)")
      return
    }

    try {
      await addIngredient({
        id,
        name,
        stock,
        unit,
        lowStockThreshold,
      })
      toast.success(`Added ingredient: ${name}`)
      setNewIngredientForm(emptyNewIngredient)
      setAddIngredientOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add ingredient")
    }
  }

  const handleDeleteIngredient = async () => {
    if (!deleteTarget) return
    const { id, name } = deleteTarget
    try {
      await removeIngredient(id)
      toast.success(`Removed ${name}`)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not remove ingredient")
    }
  }

  const getIngredientName = (id: string) => {
    return ingredients.find(i => i.id === id)?.name || id
  }

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch {
      toast.error("Could not sign out")
    }
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-4 py-2">
              <Settings className="mr-2 h-4 w-4" />
              Admin Mode
            </Badge>
            <Button type="button" variant="outline" size="sm" onClick={handleAdminLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
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
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ingredients &amp; stock
                  </CardTitle>
                  <CardDescription>
                    Add or remove ingredients, or edit quantities. Removing an ingredient does not change menu recipes in
                    code — update recipes in <code className="text-primary">data.tsx</code> if needed.
                  </CardDescription>
                </div>
                <Dialog open={addIngredientOpen} onOpenChange={setAddIngredientOpen}>
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => {
                      setNewIngredientForm({ ...emptyNewIngredient })
                      setAddIngredientOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add ingredient
                  </Button>
                  <DialogContent className="bg-card sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>New ingredient</DialogTitle>
                      <DialogDescription>
                        Use a unique ID (e.g. <code className="text-xs">ing-mushrooms</code>). This ID is used in
                        recipes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid gap-1.5">
                        <Label htmlFor="ing-id">ID</Label>
                        <Input
                          id="ing-id"
                          placeholder="ing-mushrooms"
                          value={newIngredientForm.id}
                          onChange={(e) =>
                            setNewIngredientForm((f) => ({ ...f, id: e.target.value }))
                          }
                          className="bg-input"
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="ing-name">Name</Label>
                        <Input
                          id="ing-name"
                          placeholder="Mushrooms"
                          value={newIngredientForm.name}
                          onChange={(e) =>
                            setNewIngredientForm((f) => ({ ...f, name: e.target.value }))
                          }
                          className="bg-input"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="ing-stock">Stock</Label>
                          <Input
                            id="ing-stock"
                            type="number"
                            min={0}
                            value={newIngredientForm.stock}
                            onChange={(e) =>
                              setNewIngredientForm((f) => ({ ...f, stock: e.target.value }))
                            }
                            className="bg-input"
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="ing-unit">Unit</Label>
                          <Input
                            id="ing-unit"
                            placeholder="portions"
                            value={newIngredientForm.unit}
                            onChange={(e) =>
                              setNewIngredientForm((f) => ({ ...f, unit: e.target.value }))
                            }
                            className="bg-input"
                          />
                        </div>
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor="ing-threshold">Low stock threshold</Label>
                        <Input
                          id="ing-threshold"
                          type="number"
                          min={0}
                          value={newIngredientForm.lowStockThreshold}
                          onChange={(e) =>
                            setNewIngredientForm((f) => ({ ...f, lowStockThreshold: e.target.value }))
                          }
                          className="bg-input"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddIngredientOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => void handleAddIngredientSubmit()}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px] text-muted-foreground">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Unit</TableHead>
                      <TableHead className="text-right">Low threshold</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ingredients.map((ingredient) => (
                      <TableRow key={ingredient.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{ingredient.id}</TableCell>
                        <TableCell className="font-medium">{ingredient.name}</TableCell>
                        <TableCell className="text-right">{ingredient.stock}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {ingredient.unit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {ingredient.lowStockThreshold}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
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
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteTarget({ id: ingredient.id, name: ingredient.name })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <AlertDialog
                  open={!!deleteTarget}
                  onOpenChange={(open) => !open && setDeleteTarget(null)}
                >
                  <AlertDialogContent className="bg-card">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove ingredient?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will delete{" "}
                        <strong>{deleteTarget?.name}</strong> ({deleteTarget?.id}) from inventory. Recipes in{" "}
                        <code className="text-xs">data.tsx</code> may still reference this ID until you update them.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => void handleDeleteIngredient()}
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
