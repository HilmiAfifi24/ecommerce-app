"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Category } from "@/types/Category"
import Image from "next/image"

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const router = useRouter()

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
    setImageFile(null)
    setImagePreview(null)
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

  // Handle file selection and generate preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file (jpg, jpeg, png, etc.)')
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.')
      return
    }

    setImageFile(file)
    
    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi file gambar
      if (!imageFile) {
        alert("Please upload a product image")
        setLoading(false)
        return
      }

      // Create a FormData object to handle file uploads
      const formData = new FormData()
      formData.append("name", name)
      formData.append("description", description)
      formData.append("price", price)
      formData.append("stock", stock)
      formData.append("category", selectedCategoryId)
      formData.append("image", imageFile)

      // Debug log
      console.log("Submitting product with data:", {
        name, 
        description, 
        price, 
        stock, 
        category: selectedCategoryId,
        imageFileName: imageFile.name
      })

      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header - the browser will set it with the correct boundary for FormData
      })

      // Debug response
      const responseText = await res.text()
      console.log("Server response:", responseText)

      let response
      try {
        // Try to parse as JSON
        response = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", e)
        throw new Error("Server returned invalid response format")
      }

      if (!res.ok) {
        throw new Error(response.message || "Failed to create product")
      }

      alert("Product created successfully!")
      resetForm()

      // Redirect to products page after successful creation
      router.push("/admin/product")
      router.refresh()
    } catch (error) {
      console.error("Failed to create product", error)
      alert(`Failed to create product:  "Unknown error". Please try again.`)
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

        {/* Product Image Upload */}
        <div>
          <label htmlFor="image" className="text-lg font-semibold text-gray-700">Product Image</label>
          <div className="mt-2 space-y-4">
            {/* File upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <input
                id="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <label
                htmlFor="imageFile"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <div className="flex items-center justify-center w-full">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span className="ml-2 text-sm text-gray-600">
                    Click to upload an image
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </label>
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
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