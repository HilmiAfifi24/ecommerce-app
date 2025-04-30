"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Category } from "@/types/Category"

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [image, setImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const router = useRouter()

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
    setImage("")
    setSelectedCategoryId("")
  }

  // Fetch categories from the server to display in the select dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories") // Make sure to replace with actual endpoint
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories", error)
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price,
          stock,
          category: selectedCategoryId, // Send the selected category ID
          image,
        }),
      })

      const response = await res.json()
      console.log(response)

      if (!res.ok) {
        throw new Error("Failed to create product")
      }

      resetForm()

      // Redirect to products page after successful creation
      router.push("/admin/product")
      router.refresh()
    } catch (error) {
      console.error("Failed to create product", error)
      alert("Failed to create product. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Add New Product</h1>
        <button
          onClick={() => router.push("/admin/product")}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        {/* Product Name */}
        <div>
          <label htmlFor="name" className="text-lg font-semibold text-gray-700">Product Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="description" className="text-lg font-semibold text-gray-700">Description</label>
          <textarea
            id="description"
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
            required
          />
        </div>

        {/* Product Price */}
        <div>
          <label htmlFor="price" className="text-lg font-semibold text-gray-700">Price (Rp)</label>
          <input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Product Stock */}
        <div>
          <label htmlFor="stock" className="text-lg font-semibold text-gray-700">Stock</label>
          <input
            id="stock"
            type="number"
            placeholder="Enter stock quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0"
            required
          />
        </div>

        {/* Product Image URL */}
        <div>
          <label htmlFor="image" className="text-lg font-semibold text-gray-700">Image URL</label>
          <input
            id="image"
            type="text"
            placeholder="Enter image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p className="text-sm text-gray-500 mt-1">Optional: Provide a URL to an image of the product</p>
        </div>

        {/* Category Selection */}
        <div>
          <label htmlFor="category" className="text-lg font-semibold text-gray-700">Category</label>
          <select
            id="category"
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white transition ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  )
}
