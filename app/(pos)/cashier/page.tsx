"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MenuGrid } from "@/components/cashier/menu-grid"
import { CartPanel } from "@/components/cashier/cart-panel"
import { SetMenuModal } from "@/components/cashier/set-menu-modal"
import { createOrder, validateStockForItems } from "@/lib/api"
import { useStore } from "@/lib/store"
import type { CartItem } from "@/lib/types"

export default function CashierPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setMenuModal, setSetMenuModal] = useState<{
    open: boolean
    type: "pizza-combo" | "grand-mix-box"
    price: number
  }>({
    open: false,
    type: "pizza-combo",
    price: 0,
  })

  const { ingredients } = useStore()

  const handleAddToCart = (item: CartItem) => {
    // Check if it's a set menu item
    if (item.category === "set") {
      setSetMenuModal({
        open: true,
        type: item.id === "set-pizza-combo" ? "pizza-combo" : "grand-mix-box",
        price: item.price,
      })
      return
    }

    // Check for existing item with same id and size
    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.size === item.size
    )

    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].quantity += 1
      setCart(newCart)
    } else {
      setCart([...cart, item])
    }

    toast.success(`Added ${item.name} to cart`)
  }

  const handleSetMenuAdd = (item: CartItem) => {
    const validation = validateStockForItems([...cart, item], ingredients)
    if (!validation.valid) {
      toast.error("Insufficient stock", {
        description: validation.missingIngredients.join(", "),
      })
      return
    }
    setCart([...cart, item])
    toast.success(`Added ${item.name} to cart`)
  }

  const handleUpdateQuantity = (cartId: string, quantity: number) => {
    if (quantity < 1) return
    setCart(
      cart.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      )
    )
  }

  const handleRemoveItem = (cartId: string) => {
    const item = cart.find((i) => i.cartId === cartId)
    setCart(cart.filter((item) => item.cartId !== cartId))
    if (item) {
      toast.info(`Removed ${item.name} from cart`)
    }
  }

  const handleClearCart = () => {
    setCart([])
    toast.info("Cart cleared")
  }

  const handleSubmitOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name")
      return
    }

    if (cart.length === 0) {
      toast.error("Cart is empty")
      return
    }

    // Validate stock before submitting
    const validation = validateStockForItems(cart, ingredients)
    if (!validation.valid) {
      toast.error("Insufficient stock", {
        description: validation.missingIngredients.join(", "),
      })
      return
    }

    setIsSubmitting(true)
    try {
      const totalPrice = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
      const order = await createOrder(customerName, cart, totalPrice)
      
      toast.success(`Order #${order.id} created!`, {
        description: `${customerName} - $${totalPrice.toFixed(2)}`,
      })

      // Reset state
      setCart([])
      setCustomerName("")
    } catch (error) {
      toast.error("Failed to create order", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-full">
      {/* Menu Section */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Order Taking</h1>
          <p className="text-muted-foreground">
            Select items from the menu to add to the order
          </p>
        </div>

        <MenuGrid onAddToCart={handleAddToCart} cart={cart} />
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l border-border bg-card/50 p-4">
        <CartPanel
          items={cart}
          customerName={customerName}
          onCustomerNameChange={setCustomerName}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Set Menu Modal */}
      <SetMenuModal
        open={setMenuModal.open}
        onOpenChange={(open) => setSetMenuModal((prev) => ({ ...prev, open }))}
        type={setMenuModal.type}
        price={setMenuModal.price}
        cart={cart}
        onAddToCart={handleSetMenuAdd}
      />
    </div>
  )
}
