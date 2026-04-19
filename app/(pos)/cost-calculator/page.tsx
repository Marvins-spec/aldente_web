"use client"

import { useState, useMemo } from "react"
import { useStore } from "@/lib/store"
import { getRecipe } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Calculator,
  Settings2,
  ShoppingCart,
  Pizza,
  UtensilsCrossed,
  IceCream,
  GlassWater,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem } from "@/lib/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCategoryIcon(category: string) {
  switch (category) {
    case "pizza":   return Pizza
    case "main":    return UtensilsCrossed
    case "dessert": return IceCream
    case "drink":   return GlassWater
    default:        return Package
  }
}

function getCategoryLabel(category: string) {
  switch (category) {
    case "pizza":   return "Pizzas"
    case "main":    return "Main Courses"
    case "dessert": return "Desserts"
    case "drink":   return "Drinks"
    default:        return category
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface RestockItem {
  ingredientId: string
  name: string
  unit: string
  currentStock: number
  required: number
  toRestock: number
  costPerUnit: number
  totalCost: number
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CostCalculatorPage() {
  const { ingredients, menuItems } = useStore()

  // ingredient cost config: ingredientId → cost per unit (฿)
  const [ingredientCosts, setIngredientCosts] = useState<Record<string, number>>(
    () => {
      const init: Record<string, number> = {}
      ingredients.forEach((ing) => { init[ing.id] = 0 })
      return init
    }
  )

  // menu order quantities: key = `${menuItemId}:${size}` for pizza, else menuItemId
  const [orderQty, setOrderQty] = useState<Record<string, number>>({})

  // collapse state for config section
  const [configOpen, setConfigOpen] = useState(true)

  // ── helpers ──────────────────────────────────────────────────────────────
  const orderKey = (item: MenuItem, size?: "M" | "L") =>
    item.category === "pizza" ? `${item.id}:${size ?? "M"}` : item.id

  const getQty = (item: MenuItem, size?: "M" | "L") =>
    orderQty[orderKey(item, size)] ?? 0

  const setQty = (item: MenuItem, size: "M" | "L" | undefined, val: number) => {
    const key = orderKey(item, size)
    setOrderQty((prev) => ({ ...prev, [key]: Math.max(0, val) }))
  }

  // ── calculate required ingredients for all ordered items ─────────────────
  const restockItems = useMemo<RestockItem[]>(() => {
    const required = new Map<string, number>()

    for (const item of menuItems) {
      if (item.category === "set") continue

      const sizes: Array<"M" | "L" | undefined> =
        item.category === "pizza" ? ["M", "L"] : [undefined]

      for (const size of sizes) {
        const qty = getQty(item, size)
        if (qty <= 0) continue

        const recipe = getRecipe(item.id)
        if (!recipe) continue

        const multiplier = size === "L" ? 1.5 : 1

        for (const ri of recipe.ingredients) {
          const prev = required.get(ri.ingredientId) ?? 0
          required.set(ri.ingredientId, prev + ri.amount * multiplier * qty)
        }
      }
    }

    const result: RestockItem[] = []
    for (const [ingId, totalRequired] of required.entries()) {
      const ing = ingredients.find((i) => i.id === ingId)
      if (!ing) continue

      const toRestock = Math.max(0, totalRequired - ing.stock)
      const costPerUnit = ingredientCosts[ingId] ?? 0
      const totalCost = toRestock * costPerUnit

      result.push({
        ingredientId: ingId,
        name: ing.name,
        unit: ing.unit,
        currentStock: ing.stock,
        required: totalRequired,
        toRestock,
        costPerUnit,
        totalCost,
      })
    }

    return result.sort((a, b) => a.name.localeCompare(b.name))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderQty, ingredients, menuItems, ingredientCosts])

  const totalRestockCost = useMemo(
    () => restockItems.reduce((sum, r) => sum + r.totalCost, 0),
    [restockItems]
  )

  const hasAnyOrder = useMemo(
    () => Object.values(orderQty).some((v) => v > 0),
    [orderQty]
  )

  const categoriesWithItems = useMemo(() => {
    const cats = ["pizza", "main", "dessert", "drink"] as const
    return cats.filter((cat) => menuItems.some((m) => m.category === cat))
  }, [menuItems])

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Cost Calculator
            </h1>
            <p className="text-muted-foreground">
              คำนวณต้นทุนวัตถุดิบที่ต้องซื้อเพิ่มตามจำนวนเมนูที่ต้องการ
            </p>
          </div>
          {hasAnyOrder && (
            <Badge
              variant="secondary"
              className="gap-1.5 px-4 py-2 text-base font-semibold"
            >
              <ShoppingCart className="h-4 w-4" />
              ต้นทุนรวม: ฿{totalRestockCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* ── Section 1: Ingredient Cost Config ── */}
        <Card className="bg-card">
          <CardHeader
            className="cursor-pointer select-none"
            onClick={() => setConfigOpen((o) => !o)}
          >
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                ตั้งค่าราคาต้นทุนวัตถุดิบ (ต่อหน่วย)
              </span>
              {configOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription>
              ใส่ราคาต้นทุนของแต่ละวัตถุดิบต่อหน่วย เพื่อใช้คำนวณต้นทุนรวม (คลิกเพื่อย่อ/ขยาย)
            </CardDescription>
          </CardHeader>

          {configOpen && (
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {ingredients.map((ing) => (
                  <div key={ing.id} className="flex flex-col gap-1">
                    <Label className="text-xs text-muted-foreground truncate" title={ing.name}>
                      {ing.name}
                      <span className="ml-1 text-muted-foreground/60">/ {ing.unit}</span>
                    </Label>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">฿</span>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        inputMode="decimal"
                        className="h-8 text-right tabular-nums"
                        value={ingredientCosts[ing.id] ?? 0}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setIngredientCosts((prev) => ({
                            ...prev,
                            [ing.id]: isNaN(val) ? 0 : Math.max(0, val),
                          }))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* ── Section 2: Menu Order Quantities ── */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              จำนวนเมนูที่ต้องการผลิต
            </CardTitle>
            <CardDescription>
              ใส่จำนวนของแต่ละเมนูที่ต้องการ ระบบจะคำนวณวัตถุดิบที่ต้องซื้อเพิ่มโดยหักจากสต็อกที่มีอยู่
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={categoriesWithItems[0]} className="w-full">
              <TabsList className="mb-4 bg-secondary flex-wrap h-auto gap-1">
                {categoriesWithItems.map((cat) => {
                  const Icon = getCategoryIcon(cat)
                  return (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      <Icon className="h-4 w-4" />
                      {getCategoryLabel(cat)}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {categoriesWithItems.map((cat) => {
                const catItems = menuItems.filter((m) => m.category === cat)
                return (
                  <TabsContent key={cat} value={cat} className="mt-0">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {catItems.map((item) => {
                        if (item.category === "pizza") {
                          return (
                            <div
                              key={item.id}
                              className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3"
                            >
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="flex gap-4">
                                {(["M", "L"] as const).map((size) => (
                                  <div key={size} className="flex-1 space-y-1">
                                    <Label className="text-xs text-muted-foreground">
                                      Size {size}
                                    </Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      step={1}
                                      inputMode="numeric"
                                      className="h-9 text-center tabular-nums"
                                      value={getQty(item, size) || ""}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const v = parseInt(e.target.value)
                                        setQty(item, size, isNaN(v) ? 0 : v)
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <div
                            key={item.id}
                            className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2"
                          >
                            <h4 className="font-medium">{item.name}</h4>
                            <Input
                              type="number"
                              min={0}
                              step={1}
                              inputMode="numeric"
                              className="h-9 text-center tabular-nums"
                              value={getQty(item, undefined) || ""}
                              placeholder="0"
                              onChange={(e) => {
                                const v = parseInt(e.target.value)
                                setQty(item, undefined, isNaN(v) ? 0 : v)
                              }}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>
                )
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* ── Section 3: Restock Summary ── */}
        {hasAnyOrder && (
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                สรุปวัตถุดิบที่ต้องซื้อเพิ่ม
              </CardTitle>
              <CardDescription>
                คำนวณจากสต็อกที่มีอยู่ หักออกจากจำนวนที่ต้องการ
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restockItems.every((r) => r.toRestock === 0) ? (
                <p className="text-center text-muted-foreground py-8">
                  สต็อกที่มีอยู่เพียงพอสำหรับจำนวนที่ต้องการทั้งหมด 🎉
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วัตถุดิบ</TableHead>
                          <TableHead className="text-right">สต็อกปัจจุบัน</TableHead>
                          <TableHead className="text-right">ต้องการทั้งหมด</TableHead>
                          <TableHead className="text-right">ต้องซื้อเพิ่ม</TableHead>
                          <TableHead className="text-right">ราคา/หน่วย (฿)</TableHead>
                          <TableHead className="text-right">ต้นทุนรวม (฿)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {restockItems.map((r) => (
                          <TableRow key={r.ingredientId}>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.currentStock} {r.unit}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.required} {r.unit}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.toRestock > 0 ? (
                                <Badge variant="destructive">
                                  +{r.toRestock} {r.unit}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">เพียงพอ</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {r.costPerUnit > 0
                                ? r.costPerUnit.toLocaleString("th-TH", { minimumFractionDigits: 2 })
                                : <span className="text-muted-foreground text-xs">ยังไม่ได้ตั้งค่า</span>
                              }
                            </TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">
                              {r.toRestock > 0 && r.costPerUnit > 0
                                ? `฿${r.totalCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
                                : r.toRestock === 0
                                  ? <span className="text-muted-foreground text-sm">—</span>
                                  : <span className="text-muted-foreground text-xs">—</span>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Total Cost Summary */}
                  <div className="mt-6 flex justify-end">
                    <div className="rounded-xl border border-border bg-secondary/40 px-6 py-4 text-right space-y-1 min-w-[260px]">
                      <p className="text-sm text-muted-foreground">ต้นทุนรวมที่ต้องใช้ซื้อวัตถุดิบ</p>
                      <p className="text-3xl font-bold text-foreground">
                        ฿{totalRestockCost.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </p>
                      {restockItems.some((r) => r.toRestock > 0 && r.costPerUnit === 0) && (
                        <p className="text-xs text-muted-foreground">
                          * บางรายการยังไม่ได้ตั้งราคาต้นทุน
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!hasAnyOrder && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Calculator className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium">ยังไม่ได้ใส่จำนวนเมนู</p>
            <p className="text-sm mt-1">ใส่จำนวนเมนูที่ต้องการด้านบนเพื่อเริ่มคำนวณ</p>
          </div>
        )}
      </div>
    </div>
  )
}
