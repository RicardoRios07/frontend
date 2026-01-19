"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface CartItem {
  id: string | number  // Soportar tanto string (MongoDB _id) como number (fallback)
  title: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string | number) => void
  updateQuantity: (id: string | number, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Validar si un ID es un ObjectId válido de MongoDB (24 caracteres hexadecimales)
  const isValidMongoId = (id: string | number): boolean => {
    const idStr = String(id)
    return /^[a-fA-F0-9]{24}$/.test(idStr)
  }

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("cart-items")
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved) as CartItem[]
        // Filtrar solo items con IDs válidos de MongoDB
        const validItems = parsedItems.filter(item => isValidMongoId(item.id))
        
        if (validItems.length !== parsedItems.length) {
          console.warn(`Se eliminaron ${parsedItems.length - validItems.length} productos con IDs inválidos del carrito`)
        }
        
        setItems(validItems)
      } catch (e) {
        console.error("Error al cargar carrito:", e)
        setItems([])
      }
    }
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever items change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("cart-items", JSON.stringify(items))
    }
  }, [items, isHydrated])

  const addItem = (newItem: CartItem) => {
    // Validar que el ID sea un ObjectId válido de MongoDB
    if (!isValidMongoId(newItem.id)) {
      console.error(`ID inválido: "${newItem.id}". Solo se permiten ObjectIds de MongoDB.`)
      alert(`Error: Este producto tiene un ID inválido. Por favor, contacta al administrador.`)
      return
    }
    
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id)
      if (existing) {
        return prev.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...newItem, quantity: 1 }]
    })
  }

  const removeItem = (id: string | number) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
    } else {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
