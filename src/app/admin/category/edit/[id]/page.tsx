"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

// Define a Category interface
interface Category {
  id: number
  name: string
}

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()

  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const categoryId = params.id

  // Fetch category detail
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories`)
        if (!res.ok) throw new Error("Failed to fetch categories")

        const categories: Category[] = await res.json()
        // Find the specific category by ID
        const category = categories.find((cat: Category) => cat.id === Number(categoryId))
        
        if (category) {
          setName(category.name)
        } else {
          throw new Error("Category not found")
        }
      } catch (error) {
        console.error("Fetch error:", error)
        alert("Failed to fetch category data.")
      } finally {
        setFetching(false)
      }
    }

    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/categories`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          id: Number(categoryId), 
          name 
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to update category")
      }

      await res.json()

      router.push("/admin/category")
      router.refresh()
    } catch (error) {
      console.error("Update error:", error)
      alert("Failed to update category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <button
          onClick={() => router.push("/admin/category")}
          className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
        >
          Back to Categories
        </button>
      </div>

      {fetching ? (
        <div className="text-center text-gray-500 py-10">Loading category data...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-md">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-xl text-white transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}