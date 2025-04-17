import Link from "next/link"
import { ReactNode } from "react"

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-5 space-y-4">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <ul className="space-y-2">
          <li><Link href="/products" className="hover:text-gray-300">Products</Link></li>
        </ul>
      </aside>

      {/* Content */}
      <main className="flex-1 bg-gray-100 p-10">
        {children}
      </main>
    </div>
  )
}
