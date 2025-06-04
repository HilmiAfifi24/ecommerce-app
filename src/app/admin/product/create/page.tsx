// src/app/admin/product/create/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Category } from "@/types/Category"; // Pastikan path ini benar
import Image from "next/image"; // Pastikan Image diimpor

export default function CreateProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false); // Untuk proses submit
  const [categoriesLoading, setCategoriesLoading] = useState(true); // Untuk fetch kategori
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Defaultnya string kosong
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageFile(null);
    setImagePreviewUrl(null);
    // Set ke kategori pertama jika ada, atau string kosong jika tidak ada kategori
    setSelectedCategoryId(categories.length > 0 ? categories[0].id.toString() : "");
    setError(null);
    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Effect untuk mengambil kategori (hanya sekali saat komponen dimuat)
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
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
      } catch (err: any) {
        console.error("FRONTEND: Exception while fetching categories:", err);
        setError(err.message || "Could not load categories. Please try again.");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []); // Array dependensi kosong agar hanya fetch sekali

  // Effect untuk mengatur kategori default ketika kategori sudah dimuat atau selectedCategoryId belum di-set
  useEffect(() => {
    if (categories.length > 0 && selectedCategoryId === "") {
      setSelectedCategoryId(categories[0].id.toString());
    }
  }, [categories, selectedCategoryId]); // Perhatikan dependensi di sini

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Invalid file type. Please select an image.");
        e.target.value = "";
        setImageFile(null);
        setImagePreviewUrl(null);
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("FRONTEND: handleSubmit triggered for Create Product.");

    if (!name.trim()) { setError("Product name is required."); setLoading(false); return; }
    if (!description.trim()) { setError("Product description is required."); setLoading(false); return; }
    if (!price.trim() || parseFloat(price) <= 0) { setError("Valid positive product price is required."); setLoading(false); return; } // Harga harus positif
    if (!stock.trim() || parseInt(stock, 10) < 0) { setError("Valid non-negative product stock is required."); setLoading(false); return; } // Stok tidak boleh negatif
    if (!selectedCategoryId) { setError("Please select a category."); setLoading(false); return; }
    if (!imageFile) { setError("Product image is required."); setLoading(false); return; }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", selectedCategoryId);
    formData.append("image", imageFile);

    console.log("FRONTEND: Submitting new product with FormData (to /api/products)...");
    for (const [key, value] of formData.entries()) {
      console.log(`FRONTEND FormData: ${key} = `, value instanceof File ? value.name : value);
    }

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const responseText = await res.text();
      console.log("FRONTEND: Server Response Status:", res.status, res.statusText);
      console.log("FRONTEND: Server Response Text:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("FRONTEND: Failed to parse server response as JSON:", parseError);
        if (responseText.toLowerCase().includes("<html")) {
          setError("Server returned an HTML error page. Check server logs (terminal) for details.");
        } else {
          setError(`Server returned an unparseable response (Status: ${res.status}): ${responseText.substring(0, 200)}...`);
        }
        setLoading(false);
        return;
      }

      console.log("FRONTEND: Parsed Server Response Data:", responseData);

      if (!res.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to create product. Server responded with status: ${res.status}`;
        console.error("FRONTEND: Server error after parsing JSON:", errorMessage, "Full response data:", responseData);
        throw new Error(errorMessage);
      }

      console.log("FRONTEND: Product created successfully! Server Data:", responseData);
      alert("Product created successfully!");
      resetForm();
      router.push("/admin/product");
      router.refresh();
    } catch (err: any) {
      console.error("FRONTEND: Error during product submission:", err);
      setError(err.message || "An unexpected error occurred during submission. Please check console.");
    } finally {
      setLoading(false);
    }
  };

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
        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            <span className="font-medium">Error:</span> {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="text-lg font-semibold text-gray-700">Product Name</label>
          <input id="name" type="text" placeholder="Enter product name" value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="text-lg font-semibold text-gray-700">Description</label>
          <textarea id="description" placeholder="Enter product description" value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows={4} required
          />
        </div>
        
        <div>
          <label htmlFor="price" className="text-lg font-semibold text-gray-700">Price (Rp)</label>
          <input id="price" type="number" placeholder="Enter price" value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0.01" step="any" required // Harga harus lebih dari 0, bisa desimal
          />
        </div>

        <div>
          <label htmlFor="stock" className="text-lg font-semibold text-gray-700">Stock</label>
          <input id="stock" type="number" placeholder="Enter stock quantity" value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            min="0" required
          />
        </div>

        <div>
          <label htmlFor="imageFile" className="text-lg font-semibold text-gray-700">Product Image</label>
          <input
            id="imageFile"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-3 file:px-5 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
          {imagePreviewUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                <Image
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Tambahkan prop sizes
                  className="object-contain"
                  onError={() => { console.warn("FRONTEND: Failed to load image preview from local data URL") }}
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreviewUrl(null);
                    const fileInput = document.getElementById('imageFile') as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                  }}
                  aria-label="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="category" className="text-lg font-semibold text-gray-700">Category</label>
          <select id="category" value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="mt-2 w-full px-5 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={categoriesLoading}
          >
            <option value="" disabled>{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
            {!categoriesLoading && categories.length === 0 && <option value="" disabled>No categories available</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit" disabled={loading || categoriesLoading}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
              (loading || categoriesLoading) ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
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
  );
}