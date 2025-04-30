"use client";

import { useEffect, useState } from "react";
import { Category } from "@/types/Category";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }   
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">All Categories</h2>
          <p className="text-gray-600 mt-2">Browse all available product categories</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-center group cursor-pointer"
              >
                <div className="text-4xl mb-4">📦</div> {/* Ganti dengan icon dari DB kalau ada */}
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
