// src/app/admin/product/edit/[id]/page.tsx
"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Product as ProductType } from "@prisma/client"; // Ganti nama impor agar tidak bentrok
import { Category } from "@/types/Category"; // Pastikan path ini benar
import Image from "next/image"; // Pastikan Image diimpor

export default function EditProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(""); 
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState<boolean>(false);

  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>(""); // Awalnya string kosong
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const productId = params.id as string; // Ambil ID dari params

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      if (!productId || isNaN(parseInt(productId, 10))) { // Validasi productId
        setError("Invalid or missing Product ID.");
        setLoadingInitialData(false);
        setCategoriesLoading(false);
        return;
      }
      setLoadingInitialData(true);
      setCategoriesLoading(true);
      setError(null);
      try {
        // Fetch categories
        console.log("FRONTEND (Edit): Fetching categories...");
        const catRes = await fetch("/api/categories");
        if (!catRes.ok) {
            const errData = await catRes.json().catch(() => ({}));
            console.error("FRONTEND (Edit): Failed to fetch categories - Status:", catRes.status, "Error:", errData);
            throw new Error(errData.error || "Failed to fetch categories");
        }
        const catData: Category[] = await catRes.json();
        console.log("FRONTEND (Edit): Categories fetched:", catData);
        setCategories(catData);
        setCategoriesLoading(false); // Langsung set false setelah berhasil

        // Fetch product details
        console.log(`FRONTEND (Edit): Fetching product with ID: ${productId}...`);
        const prodRes = await fetch(`/api/products/${productId}`); 
        if (!prodRes.ok) {
          const errData = await prodRes.json().catch(() => ({}));
          console.error("FRONTEND (Edit): Failed to fetch product - Status:", prodRes.status, "Error:", errData);
          if (prodRes.status === 404) throw new Error(errData.error || "Product not found");
          throw new Error(errData.error || "Failed to fetch product details");
        }
        const product: ProductType = await prodRes.json();
        console.log("FRONTEND (Edit): Product fetched:", product);

        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCurrentImageUrl(product.image || "");
        setCategoryId(product.categoryId.toString()); // Pastikan product.categoryId ada dan valid
        setRemoveCurrentImage(false);
        setNewImageFile(null);
        setNewImagePreviewUrl(null);

      } catch (err: any) {
        console.error("FRONTEND (Edit): Error fetching data for edit page:", err);
        setError(err.message || "Failed to load product data. Please try again.");
        setCategoriesLoading(false); // Pastikan categoriesLoading di-set false jika ada error
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchProductAndCategories();
  }, [productId]); // Jalankan ulang hanya jika productId berubah

  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Invalid file type. Please select an image.");
        e.target.value = "";
        setNewImageFile(null);
        setNewImagePreviewUrl(null);
        return;
      }
      setNewImageFile(file);
      setRemoveCurrentImage(false); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setNewImageFile(null);
      setNewImagePreviewUrl(null);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    console.log("FRONTEND (Edit): handleSubmit triggered for Update Product.");

    if (!name.trim()) { setError("Product name is required."); setSubmitting(false); return; }
    if (!description.trim()) { setError("Product description is required."); setSubmitting(false); return; }
    if (!price.trim() || parseFloat(price) <= 0) { setError("Valid positive product price is required."); setSubmitting(false); return; }
    if (!stock.trim() || parseInt(stock, 10) < 0) { setError("Valid non-negative product stock is required."); setSubmitting(false); return; }
    if (!categoryId) { setError("Please select a category."); setSubmitting(false); return; }

    const formData = new FormData();
    formData.append("id", productId); // Pastikan ID produk dikirim untuk operasi PUT
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", categoryId);

    if (newImageFile) {
      formData.append("image", newImageFile);
      console.log("FRONTEND (Edit): Appending new image file to FormData:", newImageFile.name);
    } else if (removeCurrentImage && currentImageUrl) {
      formData.append("image_url", ""); // Sinyal hapus gambar (sesuaikan dengan logika backend Anda)
      console.log("FRONTEND (Edit): Signaling current image removal to backend (image_url: '')");
    }
    // Jika tidak ada newImageFile dan removeCurrentImage false, backend Anda seharusnya tidak mengubah gambar.

    console.log("FRONTEND (Edit): Submitting product update with FormData...");
    for (const [key, value] of formData.entries()) {
        console.log(`FRONTEND FormData (Update): ${key} = `, value instanceof File ? value.name : value);
    }
    
    try {
      const res = await fetch(`/api/products`, { // Endpoint PUT Anda adalah /api/products
        method: "PUT",
        body: formData,
      });

      const responseText = await res.text();
      console.log("FRONTEND (Edit): Server Response Status (Update):", res.status, res.statusText);
      console.log("FRONTEND (Edit): Server Response Text (Update):", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("FRONTEND (Edit): Failed to parse server response as JSON (Update):", parseError);
        if (responseText.toLowerCase().includes("<html")) {
          setError("Server returned an HTML error page. Check server logs.");
        } else {
          setError(`Server returned unparseable response (Status: ${res.status}): ${responseText.substring(0, 200)}...`);
        }
        setSubmitting(false);
        return;
      }
      console.log("FRONTEND (Edit): Parsed Server Response Data (Update):", responseData);

      if (!res.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to update product. Status: ${res.status}`;
        console.error("FRONTEND (Edit): Server error after parsing JSON (Update):", errorMessage, "Full response data:", responseData);
        throw new Error(errorMessage);
      }

      alert("Product updated successfully!");
      router.push("/admin/product");
      router.refresh();
    } catch (err: any) {
      console.error("FRONTEND (Edit): Error during product update:", err);
      setError(err.message || "An unexpected error occurred during update. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitialData) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="ml-4 text-xl text-gray-700">Loading product data...</p>
        </div>
    );
  }
  
  if (!loadingInitialData && error && (error.includes("Product not found") || error.includes("Product ID is missing") || error.includes("Invalid or missing Product ID"))) {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error Loading Product</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
                onClick={() => router.push("/admin/product")}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
            >
                Back to Products
            </button>
        </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <button 
            onClick={() => router.push("/admin/product")}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition"
        >
            Back to Products
        </button>
      </div>

      {error && !error.includes("Product not found") && !error.includes("Product ID is missing") && !error.includes("Invalid or missing Product ID") && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32" />
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0.01" step="any" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          {currentImageUrl && !newImagePreviewUrl && !removeCurrentImage && (
            <div className="mt-2 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Current Image:</p>
              <div className="relative h-40 w-full sm:w-64 overflow-hidden rounded-md border border-gray-200">
                <Image src={currentImageUrl} alt="Current Product Image" fill sizes="(max-width: 640px) 100vw, 256px" className="object-contain" />
              </div>
            </div>
          )}

          {newImagePreviewUrl && (
            <div className="mt-2 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">New Image Preview:</p>
              <div className="relative h-40 w-full sm:w-64 overflow-hidden rounded-md border border-gray-200">
                <Image src={newImagePreviewUrl} alt="New Image Preview" fill sizes="(max-width: 640px) 100vw, 256px" className="object-contain" />
              </div>
            </div>
          )}
          
          {removeCurrentImage && (
             <p className="mt-2 mb-2 text-sm text-red-600">Current image will be removed upon update.</p>
          )}

          <input
            id="newImageFile"
            type="file"
            accept="image/*"
            onChange={handleNewImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            {currentImageUrl && !removeCurrentImage ? "Select a new image to change the current one." : "Select an image."}
            {!newImageFile && !removeCurrentImage && currentImageUrl && " Leave blank to keep the current image."}
          </p>

          {currentImageUrl && (
            <button
              type="button"
              onClick={() => {
                if (removeCurrentImage) {
                    setRemoveCurrentImage(false);
                } else {
                    setRemoveCurrentImage(true);
                    setNewImageFile(null); 
                    setNewImagePreviewUrl(null);
                    const fileInput = document.getElementById('newImageFile') as HTMLInputElement;
                    if (fileInput) fileInput.value = "";
                }
              }}
              className={`mt-2 text-sm font-medium ${removeCurrentImage ? "text-blue-600 hover:text-blue-700" : "text-red-600 hover:text-red-700"} disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={newImageFile !== null && !removeCurrentImage}
            >
              {removeCurrentImage ? "Cancel Image Removal" : "Remove Current Image"}
            </button>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select 
            id="category" 
            value={categoryId} 
            onChange={(e) => setCategoryId(e.target.value)} 
            required 
            disabled={categoriesLoading || loadingInitialData}
            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>{categoriesLoading ? "Loading categories..." : (categories.length === 0 ? "No categories available" : "Select a category")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={submitting || loadingInitialData || categoriesLoading}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
                (submitting || loadingInitialData || categoriesLoading) ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? (
                <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                </div>
            ) : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}