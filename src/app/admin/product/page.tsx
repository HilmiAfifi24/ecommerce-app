"use client"

import { Product } from "@prisma/client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const router = useRouter()

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products")
      // if (!res.ok) throw new Error("Gagal mengambil data produk")
      const data = await res.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }, [searchTerm, products])

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return

    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      if (!res.ok) {
        const err = await res.json()
        console.error("Gagal hapus:", err.error)
        return
      }

      fetchProducts()
    } catch (err) {
      console.error("Delete error:", err)
    }
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center md:text-left">Daftar Produk</h1>
        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-5 py-3 border border-gray-300 rounded-xl w-full md:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => router.push("/admin/product/create")}
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition ease-in-out duration-200"
          >
            Tambah Produk
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 py-10">Memuat produk...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-10">Produk tidak ditemukan.</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentItems.map((product) => (
              <li key={product.id} className="border border-gray-200 rounded-3xl p-6 shadow-lg bg-white hover:shadow-2xl transition-transform transform hover:scale-105">
                <div className="mb-6 h-56 relative overflow-hidden rounded-xl">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out transform hover:scale-110"
                    />
                  ) : (
                    <div className="bg-gray-300 h-full flex items-center justify-center">
                      <p className="text-gray-600">Tidak ada gambar</p>
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                <p className="text-gray-600 mt-2 text-sm line-clamp-3">{product.description}</p>
                <p className="mt-3 text-gray-700 font-medium">Stok: {product.stock}</p>
                <p className="text-lg font-semibold mt-3 mb-6 text-gray-900">Rp {product.price.toLocaleString()}</p>
                <div className="flex gap-4">
                  <Link
                    href={`/admin/product/edit/${product.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <ul className="flex gap-3">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                        currentPage === idx + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
