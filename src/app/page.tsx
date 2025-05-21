  import { ArrowRight, ShoppingCart, User, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              <span className="text-3xl font-bold">ShopNow</span>
            </div>
          </div>
          
          {/* Intro Text */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            Selamat Datang di ShopNow
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Platform e-commerce terlengkap dengan ribuan produk berkualitas untuk memenuhi kebutuhan Anda.
          </p>
          
          {/* App Description */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-12">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <ShoppingCart className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Beragam Produk</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ribuan produk berkualitas dari berbagai kategori
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <User className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Pengalaman Pengguna</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interface yang intuitif dan mudah digunakan
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <Shield className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Transaksi Aman</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Jaminan keamanan dalam setiap transaksi
                </p>
              </div>
            </div>
          </div>
          
          {/* Access Buttons */}
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a 
              href="/admin" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md dark:bg-blue-500 dark:hover:bg-blue-600 w-full md:w-64"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Akses Admin
              <ArrowRight className="w-5 h-5" />
            </a>
            
            <a 
              href="/users/home" 
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-md dark:bg-gray-700 dark:hover:bg-gray-600 w-full md:w-64"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-5 h-5"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Akses User
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-bold">ShopNow</span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm text-center md:text-right">
            © 2025 ShopNow. Hak Cipta Dilindungi. <br className="md:hidden" />
            <span className="hidden md:inline">|</span> Versi 1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}