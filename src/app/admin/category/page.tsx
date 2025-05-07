"use client"

import { Category } from "@prisma/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage] = useState<number>(6)
  const router = useRouter()

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories")

      const data = await res.json()
      if(!Array.isArray(data)) {
        console.error("Api tidak termasuk array", data);
        setCategories([])
        setFilteredCategories([])
        return
      }
      setCategories(data)
      setFilteredCategories(data)
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredCategories(filtered)
    setCurrentPage(1)
  }, [searchTerm, categories])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = Array.isArray(filteredCategories) 
  ? filteredCategories.slice(indexOfFirstItem, indexOfLastItem) 
  : []
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)

  // Delete category handler
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this category?")
    if (!confirmDelete) return

    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchCategories()
      } else {
        const err = await res.json()
        console.error("Delete failed:", err.error)
      }
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white">Category List</h1>
        <div className="flex w-full md:w-auto gap-4">
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-6 py-3 border rounded-lg shadow-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => router.push("/admin/category/create")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 transition"
          >
            Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-12">Loading categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center text-gray-500 py-12">No categories found.</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((category) => (
              <li key={category.id} className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transition">
                <h2 className="text-2xl font-semibold text-gray-800">{category.name}</h2>
                <div className="flex gap-4 mt-6">
                  <Link
                    href={`/admin/category/edit/${category.id}`}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="px-5 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition"
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
                <ul className="flex gap-3">
                  {Array.from({ length: totalPages }, (_, index) => (
                    <li key={index}>
                      <button
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-5 py-2 rounded-full text-lg ${
                          currentPage === index + 1
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } transition`}
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
