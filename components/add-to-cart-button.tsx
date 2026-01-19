"use client"

import { useCart } from "@/lib/cart-context"
import { useState } from "react"

interface AddToCartButtonProps {
  id: string | number  // Soportar MongoDB ObjectId (string) o número
  title: string
  price: number
  image: string
}

export default function AddToCartButton({ id, title, price, image }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({ id, title, price, image, quantity: 1 })
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAddToCart}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
        isAdded ? "bg-[#2ecc71] text-white" : "bg-[#2ecc71] hover:bg-[#27a85f] text-white"
      }`}
    >
      {isAdded ? "Añadido ✓" : "Agregar al carrito"}
    </button>
  )
}
