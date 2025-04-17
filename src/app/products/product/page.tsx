"use client"

import { Product } from "@prisma/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(6)
  const router = useRouter()

  // Fetch all products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      if (!res.ok) throw new Error("Failed to fetch products")

      const data = await res.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchTerm, products])

  // Delete product handler
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this product?")
    if (!confirmDelete) return

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchProducts()
      } else {
        const err = await res.json()
        console.error("Delete failed:", err.error)
      }
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-center md:text-left">Product List</h1>
        <div className="flex w-full md:w-auto gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-xl w-full md:w-64"
          />
          <button
            onClick={() => router.push("/products/create")}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            Add Product
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Loading products...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">No products found.</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((product) => (
              <li key={product.id} className="border rounded-2xl p-6 shadow-md hover:shadow-lg transition">
                {product.image ? (
                  <div className="mb-4 h-48 relative overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 h-48 bg-gray-200 flex items-center justify-center rounded-lg">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                <h2 className="text-xl font-semibold">{product.name}</h2>
                <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                <p className="mt-2">Stock: {product.stock}</p>
                <p className="text-lg font-bold mt-2 mb-6">Rp {product.price.toLocaleString()}</p>
                <div className="flex gap-3">
                  <Link
                    href={`/products/edit/${product.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav>
                <ul className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === index + 1
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  )
}
