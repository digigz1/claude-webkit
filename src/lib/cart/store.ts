'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── TYPES ───────────────────────────────────────────────────────────────────

export type CartItem = {
  variantId: string
  productId: string
  productSlug: string
  name: string
  variantLabel: string
  priceCents: number
  quantity: number
  imageUrl: string | null
  sku: string
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
}

type CartActions = {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  totalItems: () => number
  subtotalCents: () => number
  shippingCents: () => number
  totalCents: () => number
  remainingForFreeShippingCents: () => number
  freeShippingProgress: () => number
}

type CartStore = CartState & CartActions

const FREE_SHIPPING_THRESHOLD = 6000 // €60.00 in cents
const STANDARD_SHIPPING = 499        // €4.99 in cents

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // ── State
      items: [],
      isOpen: false,

      // ── Actions

      addItem(newItem) {
        const quantity = newItem.quantity ?? 1
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === newItem.variantId,
          )

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === newItem.variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
              isOpen: true,
            }
          }

          return {
            items: [...state.items, { ...newItem, quantity }],
            isOpen: true,
          }
        })
      },

      removeItem(variantId) {
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        }))
      },

      updateQuantity(variantId, quantity) {
        if (quantity <= 0) {
          get().removeItem(variantId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId ? { ...item, quantity } : item,
          ),
        }))
      },

      clearCart() {
        set({ items: [], isOpen: false })
      },

      openCart() {
        set({ isOpen: true })
      },

      closeCart() {
        set({ isOpen: false })
      },

      toggleCart() {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      // ── Computed

      totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      subtotalCents() {
        return get().items.reduce(
          (sum, item) => sum + item.priceCents * item.quantity,
          0,
        )
      },

      shippingCents() {
        if (get().items.length === 0) return 0
        const subtotal = get().subtotalCents()
        return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
      },

      totalCents() {
        return get().subtotalCents() + get().shippingCents()
      },

      remainingForFreeShippingCents() {
        const subtotal = get().subtotalCents()
        return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
      },

      freeShippingProgress() {
        const subtotal = get().subtotalCents()
        return Math.min(1, subtotal / FREE_SHIPPING_THRESHOLD)
      },
    }),
    {
      name: 'killerclo-cart',
      storage: createJSONStorage(() => {
        // Guard against SSR
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          }
        }
        return localStorage
      }),
      // Persist only items, not UI state
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

// ─── SELECTORS (stable references for components) ────────────────────────────

export const selectCartItems = (s: CartStore) => s.items
export const selectCartIsOpen = (s: CartStore) => s.isOpen
export const selectTotalItems = (s: CartStore) => s.totalItems()
export const selectSubtotalCents = (s: CartStore) => s.subtotalCents()
export const selectShippingCents = (s: CartStore) => s.shippingCents()
export const selectTotalCents = (s: CartStore) => s.totalCents()
export const selectRemainingForFreeShipping = (s: CartStore) =>
  s.remainingForFreeShippingCents()
export const selectFreeShippingProgress = (s: CartStore) => s.freeShippingProgress()
