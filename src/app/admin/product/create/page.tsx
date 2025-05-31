"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Category } from "@/types/Category" // Pastikan path ini benar
import Image from "next/image"

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [imageUrl, setImageUrl] = useState("") // State untuk URL gambar
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const router = useRouter()

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
    setImageUrl("") // Reset URL gambar
    setSelectedCategoryId("")
  }

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories") // Ganti dengan endpoint kategori Anda
        if (!res.ok) {
          throw new Error(`Failed to fetch categories: ${res.statusText}`)
        }
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error("Failed to fetch categories", error)
        // Anda bisa menambahkan notifikasi error di sini jika diperlukan
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validasi URL gambar
      if (!imageUrl.trim()) {
        alert("Please enter a product image URL")
        setLoading(false)
        return
      }
      // Validasi sederhana untuk URL (bisa diperketat jika perlu)
      try {
        new URL(imageUrl)
      } catch (error) {
        console.error("Invalid image URL format", error)
        alert("Invalid image URL format")
        setLoading(false)
        return
      }

      const productData = {
        name,
        description,
        price: parseFloat(price), // Pastikan konversi tipe data benar
        stock: parseInt(stock, 10), // Pastikan konversi tipe data benar
        category: selectedCategoryId, // Ini akan dikirim sebagai string ID
        image: imageUrl, // Kirim URL gambar
      }

      // Debug log
      console.log("Submitting product with data:", productData)

      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set header untuk JSON
        },
        body: JSON.stringify(productData), // Kirim data sebagai JSON
      })

      // Debug response
      const responseText = await res.text()
      console.log("Server response text:", responseText)

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        // Jika server mengembalikan HTML (misalnya halaman error), tampilkan pesan umum
        if (responseText.toLowerCase().includes("<html")) {
          throw new Error("Server returned an HTML error page. Check server logs.")
        }
        throw new Error(`Server returned invalid response format: ${responseText.substring(0,100)}`)
      }


      if (!res.ok) {
        // Jika ada properti 'error' di responseData, gunakan itu sebagai pesan
        // Jika tidak, gunakan pesan default atau statusText dari response
        const errorMessage = responseData?.error || responseData?.message || `Failed to create product (${res.status} ${res.statusText})`
        console.error("Server error response data:", responseData)
        throw new Error(errorMessage)
      }

      alert("Product created successfully!")
      resetForm()
      router.push("/admin/product")
      router.refresh()
    } catch (error) {
      console.error("Failed to create product", error)
      alert(`Failed to create product}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Add New Product (URL)</h1>
        <button
          onClick={() => router.push("/admin/product")} // Ganti dengan rute halaman produk Anda
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
            // step="0.01" // Hapus jika harga dalam Rupiah (bilangan bulat)
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

        {/* Product Image URL Input */}
        <div>
          <label htmlFor="imageUrl" className="text-lg font-semibold text-gray-700">Product Image URL</label>
          <input
            id="imageUrl"
            type="url" // Menggunakan type="url" untuk validasi browser dasar
            placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          {/* Image preview from URL */}
          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                <Image
                  src={imageUrl} // Gunakan imageUrl untuk src
                  alt="Image Preview"
                  fill
                  className="object-contain" // atau object-cover sesuai kebutuhan
                  onError={() => {
                    // Handle error jika URL gambar tidak valid atau tidak bisa dimuat
                    console.warn("Failed to load image preview from URL:", imageUrl)
                    // Anda bisa menampilkan placeholder atau pesan error di sini
                  }}
                />
                 <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => setImageUrl("")}
                  aria-label="Remove image URL"
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
              <option key={category.id} value={category.id.toString()}> {/* Pastikan value adalah string jika ID adalah number */}
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </div>
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}