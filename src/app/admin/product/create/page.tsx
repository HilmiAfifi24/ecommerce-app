"use client"

import { useState, useEffect, FormEvent } from "react" // Impor FormEvent
import { useRouter } from "next/navigation"
import { Category } from "@/types/Category" // Pastikan path ini benar
import Image from "next/image"

export default function CreateProductPage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState("") // Ini akan berisi string ID kategori
  const [error, setError] = useState<string | null>(null); // State untuk menampilkan error form
  const router = useRouter()

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setStock("")
    setImageUrl("")
    setSelectedCategoryId("")
    setError(null); // Reset error juga
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("FRONTEND: Fetching categories from /api/categories...");
        const res = await fetch("/api/categories");
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: res.statusText }));
          console.error("FRONTEND: Failed to fetch categories - Status:", res.status, "Error:", errorData);
          throw new Error(`Failed to fetch categories: ${errorData.message || res.statusText}`);
        }
        const data: Category[] = await res.json();
        console.log("FRONTEND: Categories fetched successfully:", data);
        setCategories(data);
        if (data.length > 0 && !selectedCategoryId) {
             // Opsional: set kategori pertama sebagai default jika belum ada yang dipilih
             // setSelectedCategoryId(data[0].id.toString());
        }
      } catch (err) {
        console.error("FRONTEND: Exception while fetching categories:", err);
        setError(`Could not load categories:`);
      }
    }
    fetchCategories()
  },); // Dependency array kosong agar hanya fetch sekali

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => { // Tipe event yang benar
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error sebelum submit baru
    console.log("FRONTEND: handleSubmit triggered.");

    // Validasi frontend yang lebih eksplisit
    if (!name.trim()) {
        alert("Product name is required."); setLoading(false); return;
    }
    if (!description.trim()) {
        alert("Product description is required."); setLoading(false); return;
    }
    if (!price.trim() || parseFloat(price) < 0) {
        alert("Valid product price is required (must be 0 or greater)."); setLoading(false); return;
    }
    if (!stock.trim() || parseInt(stock, 10) < 0) {
        alert("Valid product stock is required (must be 0 or greater)."); setLoading(false); return;
    }
    if (!selectedCategoryId) { // Pastikan kategori dipilih
      alert("Please select a category."); setLoading(false); return;
    }
    if (!imageUrl.trim()) {
      alert("Please enter a product image URL."); setLoading(false); return;
    }
    try {
      new URL(imageUrl); // Validasi format URL
    } catch (urlError) {
      console.error("FRONTEND: Invalid image URL format", urlError);
      alert("Invalid image URL format. Please use a valid URL (e.g., https://example.com/image.jpg)");
      setLoading(false);
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category: selectedCategoryId, // Ini adalah string ID dari <select>
      image: imageUrl,
    };

    console.log("FRONTEND: Submitting product with data (to /api/products):", JSON.stringify(productData, null, 2));

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const responseText = await res.text(); // Selalu baca teks dulu untuk debug
      console.log("FRONTEND: Server Response Status:", res.status, res.statusText);
      console.log("FRONTEND: Server Response Text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("FRONTEND: Parsed Server Response Data:", responseData);
      } catch (parseError) {
        console.error("FRONTEND: Failed to parse server response as JSON:", parseError);
        if (responseText.toLowerCase().includes("<html")) { // Cek jika server mengembalikan HTML (error page)
            throw new Error("Server returned an HTML error page. Check server logs (terminal) for details.");
        }
        // Jika bukan HTML, mungkin teks error biasa atau format lain
        throw new Error(`Server returned an unparseable response (Status: ${res.status}): ${responseText.substring(0, 200)}...`);
      }

      if (!res.ok) { // res.ok adalah true jika status 200-299
        // Error dari server (misalnya, validasi gagal, error Prisma)
        const errorMessage = responseData?.error || responseData?.message || `Failed to create product. Server responded with status: ${res.status} ${res.statusText}`;
        console.error("FRONTEND: Server error response data (parsed):", responseData);
        throw new Error(errorMessage);
      }

      // Jika res.ok, responseData seharusnya produk yang baru dibuat
      console.log("FRONTEND: Product created successfully! Server Data:", responseData);
      alert("Product created successfully!");
      resetForm();
      router.push("/admin/product"); // Sesuaikan rute jika perlu
      router.refresh(); // Untuk memastikan data baru diambil jika halaman produk menampilkan daftar
    } catch (err) { // Menangkap semua error dari fetch, parsing, atau !res.ok
      console.error("FRONTEND: Error during product submission:", err);
      setError("An unexpected error occurred during submission."); // Tampilkan error di UI
      alert(`Failed to create product. Please check the console and try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-16 px-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Add New Product (URL)</h1>
        <button
          onClick={() => router.push("/admin/product")}
          className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
        >
          Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        {/* Error message display */}
        {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                <span className="font-medium">Error:</span> {error}
            </div>
        )}

        {/* Product Name */}
        <div>
          <label htmlFor="name" className="text-lg font-semibold text-gray-700">Product Name</label>
          <input
            id="name" type="text" placeholder="Enter product name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="description" className="text-lg font-semibold text-gray-700">Description</label>
          <textarea
            id="description" placeholder="Enter product description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4} required
          />
        </div>

        {/* Product Price */}
        <div>
          <label htmlFor="price" className="text-lg font-semibold text-gray-700">Price (Rp)</label>
          <input
            id="price" type="number" placeholder="Enter price" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0" required
          />
        </div>

        {/* Product Stock */}
        <div>
          <label htmlFor="stock" className="text-lg font-semibold text-gray-700">Stock</label>
          <input
            id="stock" type="number" placeholder="Enter stock quantity" value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0" required
          />
        </div>

        {/* Product Image URL Input */}
        <div>
          <label htmlFor="imageUrl" className="text-lg font-semibold text-gray-700">Product Image URL</label>
          <input
            id="imageUrl" type="url" placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
            value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          {imageUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                <Image
                  src={imageUrl} alt="Image Preview" fill className="object-contain"
                  onError={() => { console.warn("FRONTEND: Failed to load image preview from URL:", imageUrl) }}
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => setImageUrl("")} aria-label="Remove image URL"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
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
            id="category" value={selectedCategoryId}
            onChange={(e) => {
                console.log("FRONTEND: Category selected:", e.target.value, e.target.selectedOptions[0].text);
                setSelectedCategoryId(e.target.value);
            }}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.length === 0 && <option value="" disabled>Loading categories...</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit" disabled={loading}
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