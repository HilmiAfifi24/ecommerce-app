import Link from "next/link";
import { ReactNode } from "react";

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-6 space-y-8 shadow-lg flex flex-col">
        <h2 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h2>
        <ul className="space-y-4">
          <li>
            <Link
              href="/admin/product"
              className="text-lg font-semibold hover:text-gray-200 transition duration-200"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/admin/category"
              className="text-lg font-semibold hover:text-gray-200 transition duration-200"
            >
              Category
            </Link>
          </li>
        </ul>
        <div className="mt-auto text-sm text-gray-300">© 2025 Admin Dashboard</div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        <div className="bg-white p-8 rounded-lg shadow-xl">{children}</div>
      </main>
    </div>
  );
}
