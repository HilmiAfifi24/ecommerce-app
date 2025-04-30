"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: string
  stock: number
  image: string
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Our Products
      </h1>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={product.image}
                width={500}
                height={500}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-xl"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
                <p className="text-gray-600 text-sm mt-2">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-600">Rp {product.price}</span>
                  <span
                    className={`text-sm ${
                      product.stock > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <button
                  disabled={product.stock === 0}
                  className={`mt-4 w-full py-2 rounded-lg ${
                    product.stock > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-400 text-gray-800 cursor-not-allowed"
                  } transition-all`}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
