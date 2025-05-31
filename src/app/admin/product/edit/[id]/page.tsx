"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Product } from "@prisma/client"; // Pastikan tipe Product diimpor dengan benar
import { Category } from "@/types/Category"; // Pastikan path ini benar
import Image from "next/image";

export default function EditProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // State untuk URL gambar (selalu string)
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Bisa null untuk error awal
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch categories
        const catRes = await fetch("/api/categories"); // Ganti dengan endpoint kategori Anda
        if (!catRes.ok) throw new Error("Failed to fetch categories");
        const catData = await catRes.json();
        setCategories(catData);

        // Fetch product details
        // Anda mungkin perlu endpoint spesifik untuk GET /api/products/[id]
        // atau filter di client-side seperti yang Anda lakukan (kurang efisien jika banyak produk)
        // Untuk contoh ini, kita asumsikan endpoint /api/products mengembalikan semua, lalu kita filter
        const prodRes = await fetch(`/api/products`);
        if (!prodRes.ok) throw new Error("Failed to fetch products");

        const products: Product[] = await prodRes.json();
        const product = products.find((p) => p.id.toString() === productId);

        if (product) {
          setName(product.name);
          setDescription(product.description || ""); // Handle jika description bisa null
          setPrice(product.price.toString());
          setStock(product.stock.toString());
          setImageUrl(product.image || ""); // product.image harusnya sudah URL string
          setCategoryId(product.categoryId.toString());
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductAndCategories();
    } else {
      setError("Product ID is missing."); // Handle jika tidak ada productId
      setLoading(false);
    }
  }, [productId]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Validasi URL gambar jika diisi
    if (imageUrl.trim() !== "") {
        try {
            new URL(imageUrl);
        } catch (err) {
            console.error("Invalid image URL:", imageUrl, err);
            setError("Invalid image URL format.");
            setSubmitting(false);
            return;
        }
    } else {
        // Jika URL gambar dikosongkan, Anda mungkin ingin validasi atau biarkan backend yang menghandle
        // Untuk saat ini, kita izinkan URL kosong (backend akan menggunakan yang lama jika tidak ada gambar baru)
    }


    const productData = {
      id: productId, // Sertakan ID untuk update
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category: categoryId, // Backend akan mengambil categoryId dari sini
      image: imageUrl, // Kirim URL gambar (bisa string kosong jika tidak diubah/dihapus)
    };

    try {
      console.log("Submitting product update with data:", productData)

      const res = await fetch(`/api/products`, { // Endpoint PUT Anda
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const responseText = await res.text();
      console.log("Server response text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
        if (responseText.toLowerCase().includes("<html")) {
          throw new Error("Server returned an HTML error page. Check server logs.");
        }
        throw new Error(`Server returned invalid response format: ${responseText.substring(0,100)}`);
      }


      if (!res.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to update product (${res.status} ${res.statusText})`
        console.error("Server error response data:", responseData);
        throw new Error(errorMessage);
      }

      alert("Product updated successfully!");
      router.push("/admin/product"); // Ganti dengan rute halaman produk Anda
      router.refresh(); // Refresh data setelah update
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-lg shadow-xl">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-semibold text-gray-700">Loading product data...</p>
        </div>
      </div>
    );
  }

  if (error && error.includes("Product not found")) { // Lebih spesifik dalam mengecek error
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            Product Not Found
          </h1>
          <p className="text-gray-700 mb-6 text-lg">
            The product you are trying to edit (ID: {productId}) does not exist or could not be loaded.
          </p>
          <button
            onClick={() => router.push("/admin/product")} // Ganti dengan rute halaman produk Anda
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <button
          onClick={() => router.push("/admin/product")} // Ganti dengan rute halaman produk Anda
          className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors"
        >
          Back to Products
        </button>
      </div>

      {error && !error.includes("Product not found") && ( // Tampilkan error umum di sini
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-xl shadow-xl"
      >
        {/* Product Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="Enter product description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price (Rp)
          </label>
          <input
            id="price"
            type="number"
            placeholder="Enter price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            min="0"
            // step="0.01" // Hapus jika harga Rupiah
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stock
          </label>
          <input
            id="stock"
            type="number"
            placeholder="Enter stock quantity"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            min="0"
            required
          />
        </div>


        {/* Image URL Input */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Image URL
          </label>
          <input
            id="imageUrl"
            type="url"
            placeholder="Enter new image URL (leave blank to keep current)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            // 'required' dihapus, karena pengguna mungkin tidak ingin mengubah gambar
          />
          {imageUrl && ( // Hanya tampilkan preview jika ada URL
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Preview:</p>
              <div className="relative h-40 w-full sm:w-64 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={imageUrl}
                  alt="Product Preview"
                  fill
                  className="object-contain"
                  onError={() => {
                     console.warn("Failed to load image preview from URL:", imageUrl);
                     // Di sini Anda bisa setImageUrl ke string error atau placeholder jika URL tidak valid
                  }}
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition-colors"
                  onClick={() => setImageUrl("")} // Mengosongkan URL akan berarti tidak ada gambar baru
                  aria-label="Remove image URL"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className={`px-8 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </div>
            ) : (
              "Update Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}