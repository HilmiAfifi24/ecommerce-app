"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Product } from "@prisma/client";
import { Category } from "@/types/Category";
import Image from "next/image";

export default function EditProductPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState<File | string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");

  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products`);
        if (!res.ok) throw new Error("Failed to fetch products");

        const products: Product[] = await res.json();
        const product = products.find((p) => p.id.toString() === productId);

        if (product) {
          setName(product.name);
          setDescription(product.description);
          setPrice(product.price.toString());
          setStock(product.stock.toString());
          setImage(product.image || "");
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
      fetchProduct();
    }
  }, [productId]);

  // Add a function to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(""); // Clear previous error

    try {
      const formData = new FormData();
      formData.append("id", productId);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", categoryId);
      formData.append("image", image);

      if (image instanceof File) {
        formData.append("image", image);
      }

      const res = await fetch(`/api/products`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update product");

      router.push("/admin/product");
      router.refresh(); // Refresh data after update
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <p className="text-gray-500">Loading product data...</p>
      </div>
    );
  }

  if (error === "Product not found") {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Product Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          The product you are trying to edit does not exist.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <button
          onClick={() => router.push("/products")}
          className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
        >
          Back to Products
        </button>
      </div>

      {error && error !== "Product not found" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-xl shadow-md"
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
            className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="border w-full px-4 py-2 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.01"
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
            className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            required
          />
        </div>


        {/* Image Upload */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Upload Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
              }
            }}
            className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {typeof image === "string" ? (
            image && (
              <Image
              width={100}
              height={100}
                src={image}
                alt="Product Preview"
                className="mt-2 max-h-40 rounded"
              />
            )
          ) : (
            <Image
              width={100}
              height={100}
              src={URL.createObjectURL(image)}
              alt="Selected Preview"
              className="mt-2 max-h-40 rounded"
            />
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
            className="border w-full px-4 py-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
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
            className={`px-6 py-2 rounded-xl text-white transition ${
              submitting ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {submitting ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
