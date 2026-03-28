"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import {
  syncStockFromSheet,
  calculateMaxProducible,
  updateIngredientStock,
  pushIngredientsToSheetIfConfigured,
} from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Pizza,
  UtensilsCrossed,
  IceCream,
  Loader2,
  Plus,
} from "lucide-react"
import type { Ingredient } from "@/lib/types"
import { cn } from "@/lib/utils"

export default function StockPage() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const { ingredients, menuItems } = useStore()

  const mergedWith = (id: string, stock: number): Ingredient[] =>
    ingredients.map((i) => (i.id === id ? { ...i, stock } : i))

  const handleSetStock = async (ing: Ingredient) => {
    const raw = drafts[ing.id]?.trim() ?? String(ing.stock)
    const n = parseFloat(raw)
    if (isNaN(n) || n < 0) {
      toast.error("Enter a valid number (0 or greater)")
      return
    }
    setSaving((s) => ({ ...s, [ing.id]: true }))
    try {
      await updateIngredientStock(ing.id, n)
      await pushIngredientsToSheetIfConfigured(mergedWith(ing.id, n))
      toast.success(`Saved ${ing.name}: ${n} ${ing.unit}`)
      setDrafts((d) => {
        const next = { ...d }
        delete next[ing.id]
        return next
      })
    } catch {
      toast.error("Could not save stock")
    } finally {
      setSaving((s) => ({ ...s, [ing.id]: false }))
    }
  }

  const handleAddStock = async (ing: Ingredient, delta: number) => {
    const n = Math.max(0, ing.stock + delta)
    setSaving((s) => ({ ...s, [ing.id]: true }))
    try {
      await updateIngredientStock(ing.id, n)
      await pushIngredientsToSheetIfConfigured(mergedWith(ing.id, n))
      toast.success(
        delta >= 0
          ? `${ing.name}: +${delta} → ${n} ${ing.unit}`
          : `${ing.name} → ${n} ${ing.unit}`
      )
      setDrafts((d) => {
        const next = { ...d }
        delete next[ing.id]
        return next
      })
    } catch {
      toast.error("Could not save stock")
    } finally {
      setSaving((s) => ({ ...s, [ing.id]: false }))
    }
  }

  // Low stock items
  const lowStockItems = useMemo(
    () => ingredients.filter((i) => i.stock <= i.lowStockThreshold),
    [ingredients]
  )

  // Calculate producible quantities for all menu items
  const producibleCounts = useMemo(() => {
    const counts: Record<string, { M: number; L?: number }> = {}
    
    for (const item of menuItems) {
      if (item.category === "set") continue
      
      if (item.category === "pizza") {
        counts[item.id] = {
          M: calculateMaxProducible(item.id, ingredients, "M"),
          L: calculateMaxProducible(item.id, ingredients, "L"),
        }
      } else {
        counts[item.id] = {
          M: calculateMaxProducible(item.id, ingredients, "M"),
        }
      }
    }
    
    return counts
  }, [ingredients, menuItems])

  const handleSyncStock = async () => {
    setIsSyncing(true)
    try {
      await syncStockFromSheet()
      toast.success("Stock synced from Google Sheet")
    } catch (error) {
      toast.error("Failed to sync stock", {
        description: "Check your Google Sheet configuration",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const getStockStatus = (stock: number, threshold: number) => {
    const percentage = (stock / (threshold * 5)) * 100
    if (stock <= threshold) return { color: "text-destructive", label: "Low", variant: "destructive" as const }
    if (percentage <= 40) return { color: "text-warning", label: "Medium", variant: "outline" as const }
    return { color: "text-success", label: "Good", variant: "secondary" as const }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pizza": return Pizza
      case "main": return UtensilsCrossed
      case "dessert": return IceCream
      default: return Package
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock Management</h1>
            <p className="text-muted-foreground">
              กูว่าแล้วมึงต้องอ่าน
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <Badge variant="destructive" className="gap-1.5 px-3 py-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {lowStockItems.length} low stock items
              </Badge>
            )}

            {/* Sync Button */}
            <Button
              variant="outline"
              onClick={handleSyncStock}
              disabled={isSyncing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing..." : "Sync from Sheet"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs defaultValue="ingredients" className="h-full">
          <TabsList className="mb-4 bg-secondary">
            <TabsTrigger
              value="ingredients"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="production"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Production Capacity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients" className="mt-0">
            <div className="grid gap-6">
              {/* Low Stock Alert Card */}
              {lowStockItems.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Low Stock Alert
                    </CardTitle>
                    <CardDescription>
                      These ingredients need to be restocked soon
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {lowStockItems.map((item) => (
                        <Badge key={item.id} variant="destructive">
                          {item.name}: {item.stock} {item.unit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Ingredients Table */}
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    All Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="min-w-[280px]">Restock</TableHead>
                        <TableHead className="text-right">Threshold</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[200px]">Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ingredients.map((ingredient) => {
                        const status = getStockStatus(ingredient.stock, ingredient.lowStockThreshold)
                        const percentage = Math.min((ingredient.stock / (ingredient.lowStockThreshold * 5)) * 100, 100)
                        const isSaving = saving[ingredient.id]
                        const draftVal =
                          drafts[ingredient.id] ?? String(ingredient.stock)

                        return (
                          <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">
                              {ingredient.name}
                            </TableCell>
                            <TableCell className="text-right">
                              {ingredient.stock} {ingredient.unit}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <div className="flex gap-0.5">
                                  {[1, 5, 10].map((step) => (
                                    <Button
                                      key={step}
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="h-8 px-2 text-xs"
                                      disabled={isSaving}
                                      aria-label={`Add ${step} ${ingredient.unit}`}
                                      onClick={() => void handleAddStock(ingredient, step)}
                                    >
                                      <Plus className="mr-0.5 h-3 w-3" />
                                      {step}
                                    </Button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    min={0}
                                    step={1}
                                    inputMode="decimal"
                                    className="h-8 w-24 text-right tabular-nums"
                                    value={draftVal}
                                    disabled={isSaving}
                                    onChange={(e) =>
                                      setDrafts((d) => ({
                                        ...d,
                                        [ingredient.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="h-8"
                                    disabled={isSaving}
                                    onClick={() => void handleSetStock(ingredient)}
                                  >
                                    {isSaving ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {ingredient.lowStockThreshold} {ingredient.unit}
                            </TableCell>
                            <TableCell>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Progress
                                value={percentage}
                                className={cn(
                                  "h-2",
                                  percentage <= 20 && "[&>div]:bg-destructive",
                                  percentage > 20 && percentage <= 40 && "[&>div]:bg-warning",
                                  percentage > 40 && "[&>div]:bg-success"
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="production" className="mt-0">
            <div className="grid gap-6">
              {/* Production Capacity by Category */}
              {["pizza", "main", "dessert"].map((category) => {
                const categoryItems = menuItems.filter(
                  (item) => item.category === category && item.category !== "set"
                )
                const CategoryIcon = getCategoryIcon(category)

                return (
                  <Card key={category} className="bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 capitalize">
                        <CategoryIcon className="h-5 w-5" />
                        {category === "main" ? "Main Courses" : category + "s"}
                      </CardTitle>
                      <CardDescription>
                        Maximum items that can be produced with current stock
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {categoryItems.map((item) => {
                          const counts = producibleCounts[item.id]
                          if (!counts) return null

                          return (
                            <div
                              key={item.id}
                              className="rounded-lg border border-border bg-secondary/30 p-4"
                            >
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="mt-2 flex gap-4">
                                <div className="text-center">
                                  <span className={cn(
                                    "text-2xl font-bold",
                                    counts.M === 0 ? "text-destructive" : 
                                    counts.M <= 5 ? "text-warning" : "text-success"
                                  )}>
                                    {counts.M}
                                  </span>
                                  {item.category === "pizza" && (
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      (M)
                                    </span>
                                  )}
                                </div>
                                {counts.L !== undefined && (
                                  <div className="text-center">
                                    <span className={cn(
                                      "text-2xl font-bold",
                                      counts.L === 0 ? "text-destructive" : 
                                      counts.L <= 5 ? "text-warning" : "text-success"
                                    )}>
                                      {counts.L}
                                    </span>
                                    <span className="ml-1 text-xs text-muted-foreground">
                                      (L)
                                    </span>
                                  </div>
                                )}
                              </div>
                              {counts.M === 0 && (
                                <Badge variant="destructive" className="mt-2">
                                  Out of Stock
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
