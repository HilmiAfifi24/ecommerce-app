'use client'

import { Category } from "@/types/Category";
import { Product } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link"; // import Link untuk navigasi ke halaman produk

export default function UserPage() {
  const [searchTerm] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<Product[]>([]); // State untuk cart
  const productsPerPage = 4; // Batasi produk yang ditampilkan menjadi 4

  // Fetch all categories from API
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  // Fetch all products from API
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  // Get current products for pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle Add to Cart
  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => [...prevCart, product]); // Menambahkan produk ke cart
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
              <span className="inline-block px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4">
                NEW ARRIVAL
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Discover Exclusive Products for Your Lifestyle
              </h1>
              <p className="text-gray-600 text-lg mb-8">
                Explore our handpicked collection of premium products that
                elevate your everyday experience.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
                >
                  Shop Now
                </a>
                <a
                  href="#"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="relative w-full h-80 md:h-96 overflow-hidden rounded-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 z-10 rounded-xl"></div>
                <Image
                  src="/api/placeholder/800/600"
                  alt="Premium product showcase"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-yellow-400 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center">
                  <span className="block text-3xl font-bold">30%</span>
                  <span className="font-semibold text-sm">DISCOUNT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Categories
              </h2>
              <p className="text-gray-600 mt-2">
                Explore our most popular product categories
              </p>
            </div>
            <Link href="/users/categories">
              <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                View All Categories
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-center group cursor-pointer"
              >
                <div className="text-4xl mb-4">📦</div>
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products from Database */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Our Products</h2>
            <div className="text-indigo-600 font-medium">
              {filteredProducts.length} products found
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-medium text-gray-700">
                No products found
              </h3>
              <p className="text-gray-500 mt-2">
                Try changing your search criteria
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={product.image || "/api/placeholder/400/320"}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                        {product.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Rp {product.price.toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAddToCart(product)} // Menambahkan produk ke cart
                          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View All Button */}
              <div className="flex justify-center mt-8">
                <Link href="/users/products">
                  <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                    View All Products
                  </button>
                </Link>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`px-4 py-2 rounded-md ${
                          currentPage === index + 1
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Cart Section (Optional) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 lg:px-10">
          <h2 className="text-3xl font-bold text-gray-900">Your Cart</h2>
          {cart.length === 0 ? (
            <p className="text-gray-600 mt-4">Your cart is empty.</p>
          ) : (
            <div>
              {cart.map((product) => (
                <div key={product.id} className="flex justify-between py-4 border-b">
                  <span>{product.name}</span>
                  <span>Rp {product.price.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-end mt-6">
                <button className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
