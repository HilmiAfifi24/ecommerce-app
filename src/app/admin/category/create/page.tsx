"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateCategoryPage() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setName("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        throw new Error("Failed to create category")
      }

      await res.json()
      resetForm()

      // Redirect to categories page after successful creation
      router.push("/admin/category")
      router.refresh()
    } catch (error) {
      console.error("Failed to create category", error)
      alert("Failed to create category. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Add New Category</h1>
        <button
          onClick={() => router.push("/admin/category")}
          className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition duration-300"
        >
          Back to Categories
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Category Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-8 py-3 text-white rounded-xl transition duration-300 ease-in-out ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>
    </div>
  )
}
