"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { Product as ProductType } from "@prisma/client"; // Ganti nama impor agar tidak bentrok
import { Category } from "@/types/Category";
import Image from "next/image";

// Anda mungkin perlu membuat endpoint API spesifik untuk mengambil satu produk
// misalnya: app/api/products/[id]/route.ts
// async function GET(request: Request, { params }: { params: { id: string } }) {
//   const productId = parseInt(params.id, 10);
//   if (isNaN(productId)) return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
//   try {
//     const product = await prisma.product.findUnique({ where: { id: productId }, include: { category: true }});
//     if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
//     return NextResponse.json(product);
//   } catch (error) { ... }
// }

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
  const [categoryId, setCategoryId] = useState<string>("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    const fetchProductAndCategories = async () => {
      if (!productId) {
        setError("Product ID is missing.");
        setLoadingInitialData(false);
        setCategoriesLoading(false);
        return;
      }
      setLoadingInitialData(true);
      setCategoriesLoading(true);
      setError(null);
      try {
        // Fetch categories
        const catRes = await fetch("/api/categories");
        if (!catRes.ok) {
            const errData = await catRes.json().catch(() => ({}));
            throw new Error(errData.error || "Failed to fetch categories");
        }
        const catData: Category[] = await catRes.json();
        setCategories(catData);
        setCategoriesLoading(false);

        // Fetch product details
        // Pastikan Anda memiliki endpoint seperti /api/products/[id]
        const prodRes = await fetch(`/api/products/${productId}`); 
        if (!prodRes.ok) {
          const errData = await prodRes.json().catch(() => ({}));
          if (prodRes.status === 404) throw new Error(errData.error || "Product not found");
          throw new Error(errData.error || "Failed to fetch product details");
        }
        
        const product: ProductType = await prodRes.json();

        setName(product.name);
        setDescription(product.description || "");
        setPrice(product.price.toString());
        setStock(product.stock.toString());
        setCurrentImageUrl(product.image || "");
        setCategoryId(product.categoryId.toString());
        setRemoveCurrentImage(false);
        setNewImageFile(null);
        setNewImagePreviewUrl(null);

      } catch (err: any) {
        console.error("FRONTEND: Error fetching data for edit page:", err);
        setError(err.message || "Failed to load product data. Please try again.");
        // Jika kategori gagal dimuat, setCategoriesLoading tetap false
        if (categories.length === 0) setCategoriesLoading(false);
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchProductAndCategories();
  }, [productId]); // Jalankan ulang jika productId berubah (seharusnya tidak sering)

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
  
  // Cleanup FileReader result (Data URL) tidak diperlukan.

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    console.log("FRONTEND: handleSubmit triggered for Update Product.");

    if (!name.trim()) { setError("Product name is required."); setSubmitting(false); return; }
    if (!description.trim()) { setError("Product description is required."); setSubmitting(false); return; }
    if (!price.trim() || parseFloat(price) < 0) { setError("Valid product price is required."); setSubmitting(false); return; }
    if (!stock.trim() || parseInt(stock, 10) < 0) { setError("Valid product stock is required."); setSubmitting(false); return; }
    if (!categoryId) { setError("Please select a category."); setSubmitting(false); return; }

    const formData = new FormData();
    formData.append("id", productId);
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("category", categoryId);

    if (newImageFile) {
      formData.append("image", newImageFile); // Kirim file baru
      console.log("FRONTEND: Appending new image file to FormData:", newImageFile.name);
    } else if (removeCurrentImage && currentImageUrl) {
      // Sinyal ke backend untuk menghapus gambar yang ada dengan mengirimkan string kosong untuk image_url.
      // Ini sesuai dengan logika di backend PUT handler Anda (multipart/form-data).
      formData.append("image_url", ""); 
      console.log("FRONTEND: Signaling current image removal to backend (image_url: '')");
    }
    // Jika tidak ada newImageFile dan removeCurrentImage false,
    // maka tidak ada field 'image' atau 'image_url' (kosong) yang dikirim.
    // Backend Anda (bagian multipart/form-data di PUT) akan mengabaikan update gambar jika field ini tidak ada.

    console.log("FRONTEND: Submitting product update with FormData...");
    for (const [key, value] of formData.entries()) {
        console.log(`FRONTEND FormData (Update): ${key} = `, value instanceof File ? value.name : value);
    }
    
    try {
      const res = await fetch(`/api/products`, { // Endpoint PUT Anda adalah /api/products
        method: "PUT",
        body: formData,
      });

      const responseText = await res.text();
      console.log("FRONTEND: Server Response Status (Update):", res.status, res.statusText);
      console.log("FRONTEND: Server Response Text (Update):", responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("FRONTEND: Failed to parse server response as JSON (Update):", parseError);
        if (responseText.toLowerCase().includes("<html")) {
          setError("Server returned an HTML error page. Check server logs.");
        } else {
          setError(`Server returned unparseable response (Status: ${res.status}): ${responseText.substring(0, 200)}...`);
        }
        setSubmitting(false);
        return;
      }
      console.log("FRONTEND: Parsed Server Response Data (Update):", responseData);

      if (!res.ok) {
        const errorMessage = responseData?.error || responseData?.message || `Failed to update product. Status: ${res.status}`;
        console.error("FRONTEND: Server error after parsing JSON (Update):", errorMessage, "Full response data:", responseData);
        throw new Error(errorMessage);
      }

      alert("Product updated successfully!");
      router.push("/admin/product");
      router.refresh();
    } catch (err: any) {
      console.error("FRONTEND: Error during product update:", err);
      setError(err.message || "An unexpected error occurred during update. Please check console.");
    } finally {
      setSubmitting(false);
    }
  };

  // JSX (Struktur visual Anda sudah bagus)
  if (loadingInitialData) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading product data...</div>;
  }
  // Tampilkan error spesifik jika produk tidak ditemukan setelah loading selesai
  if (!loadingInitialData && error && (error.includes("Product not found") || error.includes("Product ID is missing"))) {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
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

      {error && ( // Tampilkan error umum lainnya di sini
           <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm" role="alert">
             <p className="font-bold">Error</p>
             <p>{error}</p>
           </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-xl">
        {/* Nama Produk */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        {/* Deskripsi Produk */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm h-32" />
        </div>
        {/* Harga */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (Rp)</label>
          <input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        {/* Stok */}
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
          <input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} required min="0" className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>

        {/* Bagian Edit Gambar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
          {/* Tampilkan gambar saat ini jika ada, belum ada preview baru, dan tidak ditandai untuk dihapus */}
          {currentImageUrl && !newImagePreviewUrl && !removeCurrentImage && (
            <div className="mt-2 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Current Image:</p>
              <div className="relative h-40 w-full sm:w-64 overflow-hidden rounded-md border border-gray-200">
                <Image src={currentImageUrl} alt="Current Product Image" fill className="object-contain" />
              </div>
            </div>
          )}

          {/* Tampilkan preview gambar baru jika ada */}
          {newImagePreviewUrl && (
            <div className="mt-2 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">New Image Preview:</p>
              <div className="relative h-40 w-full sm:w-64 overflow-hidden rounded-md border border-gray-200">
                <Image src={newImagePreviewUrl} alt="New Image Preview" fill className="object-contain" />
              </div>
            </div>
          )}
          
          {/* Pesan jika gambar akan dihapus */}
          {removeCurrentImage && (
             <p className="mt-2 mb-2 text-sm text-red-600">Current image will be removed upon update.</p>
          )}

          {/* Input untuk memilih file gambar baru */}
          <input
            id="newImageFile"
            type="file"
            accept="image/*"
            onChange={handleNewImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          <p className="mt-1 text-xs text-gray-500">
            {currentImageUrl && !removeCurrentImage ? "Select a new image to change the current one." : "Select an image."}
            {!removeCurrentImage && " Leave blank to keep the current image (if any)."}
          </p>

          {/* Tombol untuk menghapus/membatalkan penghapusan gambar saat ini */}
          {currentImageUrl && ( // Hanya tampilkan jika ada gambar saat ini
            <button
              type="button"
              onClick={() => {
                if (removeCurrentImage) { // Jika sedang ditandai hapus, batalkan
                    setRemoveCurrentImage(false);
                } else { // Jika tidak, tandai untuk dihapus
                    setRemoveCurrentImage(true);
                    setNewImageFile(null); 
                    setNewImagePreviewUrl(null);
                    const fileInput = document.getElementById('newImageFile') as HTMLInputElement;
                    if (fileInput) fileInput.value = ""; // Reset input file
                }
              }}
              className={`mt-2 text-sm ${removeCurrentImage ? "text-blue-600 hover:text-blue-800" : "text-red-600 hover:text-red-800"} disabled:opacity-50`}
              disabled={newImageFile !== null && !removeCurrentImage} // Disable "Remove" jika sedang memilih file baru, kecuali jika "Remove" sudah aktif
            >
              {removeCurrentImage ? "Cancel Image Removal" : "Remove Current Image"}
            </button>
          )}
        </div>

        {/* Pemilihan Kategori */}
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
            <option value="" disabled>{categoriesLoading ? "Loading categories..." : "Select a category"}</option>
            {!categoriesLoading && categories.length === 0 && <option value="" disabled>No categories available</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={submitting || loadingInitialData || categoriesLoading}
            className={`px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 ${
                (submitting || loadingInitialData || categoriesLoading) ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {submitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}