import { initialIngredients } from "./data"
import type { Ingredient, Order, OrderItem, OrderStatus } from "./types"
import { getSupabaseBrowserClient } from "./supabase"

interface OrderRow {
  order_number: number
  customer_name: string
  items: OrderItem[]
  status: string
  chef_name: string | null
  server_name: string | null
  total_price: number
  created_at: string
  updated_at: string
}

interface IngredientRow {
  id: string
  name: string
  stock: number
  unit: string
  low_stock_threshold: number
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.order_number,
    customerName: row.customer_name,
    items: row.items,
    status: row.status as OrderStatus,
    chefName: row.chef_name ?? undefined,
    serverName: row.server_name ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    totalPrice: Number(row.total_price),
  }
}

function rowToIngredient(row: IngredientRow): Ingredient {
  return {
    id: row.id,
    name: row.name,
    stock: Number(row.stock),
    unit: row.unit,
    lowStockThreshold: Number(row.low_stock_threshold),
  }
}

export async function supabaseFetchOrders(): Promise<Order[]> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return []

  const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: true })
  if (error) {
    console.error("supabaseFetchOrders:", error)
    return []
  }
  return (data as OrderRow[]).map(rowToOrder)
}

export async function supabaseFetchIngredients(): Promise<Ingredient[]> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return []

  const { data, error } = await sb.from("ingredients").select("*").order("id", { ascending: true })
  if (error) {
    console.error("supabaseFetchIngredients:", error)
    return []
  }
  return (data as IngredientRow[]).map(rowToIngredient)
}

export async function supabaseFetchOrderCounter(): Promise<number> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return 1

  const { data, error } = await sb.from("pos_settings").select("order_counter").eq("id", 1).maybeSingle()
  if (error) {
    console.error("supabaseFetchOrderCounter:", error)
    return 1
  }
  const n = Number((data as { order_counter: number } | null)?.order_counter)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

export async function supabaseSeedIfEmpty(): Promise<void> {
  const sb = getSupabaseBrowserClient()
  if (!sb) return

  const { count, error: countError } = await sb.from("ingredients").select("*", { count: "exact", head: true })
  if (countError) {
    console.error("supabaseSeedIfEmpty count:", countError)
    return
  }

  if (count === 0) {
    const rows = initialIngredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      stock: ing.stock,
      unit: ing.unit,
      low_stock_threshold: ing.lowStockThreshold,
    }))
    const { error } = await sb.from("ingredients").insert(rows)
    if (error) console.error("supabaseSeedIfEmpty insert:", error)
  }

  const { error: settingsError } = await sb.from("pos_settings").upsert(
    { id: 1, order_counter: 1 },
    { onConflict: "id" }
  )
  if (settingsError) console.error("supabaseSeedIfEmpty settings:", settingsError)
}

function parseOrderFromRpc(raw: unknown): Order {
  const o = raw as Record<string, unknown>
  return {
    id: Number(o.id),
    customerName: String(o.customerName),
    items: o.items as OrderItem[],
    status: o.status as OrderStatus,
    chefName: (o.chefName as string) || undefined,
    serverName: (o.serverName as string) || undefined,
    createdAt: new Date(o.createdAt as string),
    updatedAt: new Date(o.updatedAt as string),
    totalPrice: Number(o.totalPrice),
  }
}

export async function supabaseCreateOrder(
  customerName: string,
  items: OrderItem[],
  totalPrice: number,
  ingredientUsage: { ingredientId: string; amount: number }[]
): Promise<Order> {
  const sb = getSupabaseBrowserClient()
  if (!sb) throw new Error("Supabase is not configured")

  const payload = ingredientUsage.map((u) => ({
    ingredient_id: u.ingredientId,
    amount: u.amount,
  }))

  const { data, error } = await sb.rpc("create_pos_order", {
    p_customer_name: customerName,
    p_items: items,
    p_total_price: totalPrice,
    p_ingredient_usage: payload,
  })

  if (error) throw new Error(error.message || "Failed to create order")
  return parseOrderFromRpc(data)
}

export async function supabasePatchOrder(
  orderId: number,
  patch: Partial<Pick<Order, "status" | "chefName" | "serverName">>
): Promise<void> {
  const sb = getSupabaseBrowserClient()
  if (!sb) throw new Error("Supabase is not configured")

  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (patch.status !== undefined) row.status = patch.status
  if (patch.chefName !== undefined) row.chef_name = patch.chefName
  if (patch.serverName !== undefined) row.server_name = patch.serverName

  const { error } = await sb.from("orders").update(row).eq("order_number", orderId)
  if (error) throw new Error(error.message)
}

export async function supabaseUpdateIngredientStock(ingredientId: string, newStock: number): Promise<void> {
  const sb = getSupabaseBrowserClient()
  if (!sb) throw new Error("Supabase is not configured")

  const { error } = await sb.from("ingredients").update({ stock: newStock }).eq("id", ingredientId)
  if (error) throw new Error(error.message)
}

export async function supabaseBulkSetIngredients(ingredients: Ingredient[]): Promise<void> {
  const sb = getSupabaseBrowserClient()
  if (!sb) throw new Error("Supabase is not configured")

  const rows = ingredients.map((ing) => ({
    id: ing.id,
    name: ing.name,
    stock: ing.stock,
    unit: ing.unit,
    low_stock_threshold: ing.lowStockThreshold,
  }))

  const { error } = await sb.from("ingredients").upsert(rows, { onConflict: "id" })
  if (error) throw new Error(error.message)
}

export async function supabaseResetPOS(): Promise<void> {
  const sb = getSupabaseBrowserClient()
  if (!sb) throw new Error("Supabase is not configured")

  const { error } = await sb.rpc("reset_pos")
  if (error) throw new Error(error.message)
}

export function subscribeSupabasePOS(onRefresh: () => void): () => void {
  const sb = getSupabaseBrowserClient()
  if (!sb) return () => {}

  let t: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    if (t) clearTimeout(t)
    t = setTimeout(() => {
      t = undefined
      onRefresh()
    }, 50)
  }

  const channel = sb
    .channel("pos-realtime")
    .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "ingredients" }, schedule)
    .on("postgres_changes", { event: "*", schema: "public", table: "pos_settings" }, schedule)
    .subscribe((status) => {
      if (status === "SUBSCRIBED") schedule()
    })

  return () => {
    if (t) clearTimeout(t)
    void sb.removeChannel(channel)
  }
}

export async function supabaseRefreshAllState(apply: (partial: {
  orders?: Order[]
  orderCounter?: number
  ingredients?: Ingredient[]
}) => void): Promise<void> {
  const [orders, ingredients, orderCounter] = await Promise.all([
    supabaseFetchOrders(),
    supabaseFetchIngredients(),
    supabaseFetchOrderCounter(),
  ])
  apply({ orders, ingredients, orderCounter })
}
