"use client";

import Link from "next/link";
import { ReactNode } from "react";

export default function UserLayout({ children }: { children: ReactNode }) {

  return (
    <>
      <div className="sticky top-0 z-10">
        {/* Enhanced top header */}
        <div className="bg-gradient-to-r from-blue-800 to-indigo-900 h-16 flex items-center justify-center">
          <div className="container mx-auto px-6 text-center text-white">
            <p className="font-medium">
              Special Promotion! <span className="font-bold">30% OFF</span> on
              all premium items - Limited time offer!
            </p>
          </div>
        </div>

        {/* Improved navigation bar */}
        <div className="bg-white shadow-lg">
          <div className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-10">
            {/* Logo/Title with more elegant animation */}
            <div className="flex items-center">
              <h1 className="text-black font-bold text-2xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center">
                Exclusive
                <span className="ml-1.5 h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
              </h1>
            </div>

            {/* Enhanced Navigation */}
            <nav className="hidden md:flex space-x-8 text-black">
              {["Home", "Products", "Categories", "About", "Contact"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/users/${item.toLowerCase()}`}
                    className="relative font-medium tracking-wide group py-2"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                )
              )}
            </nav>

            {/* User Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 transition-colors relative"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  3
                </span>
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </a>
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <main className="min-h-screen bg-gray-50">{children}</main>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white py-12">
        <div className="container mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">Exclusive</h3>
              <p className="text-gray-300 mb-4">
                Your premium shopping destination for exclusive products and
                unique finds.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Safety Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community Guidelines
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cookie Settings
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Install App</h4>
              <div className="flex flex-col space-y-3">
                <a
                  href="#"
                  className="border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.318 1.975c-.012-.05-.027-.1-.047-.149-.023-.055-.046-.107-.077-.157-.028-.045-.059-.087-.093-.126-.025-.03-.051-.058-.08-.085-.066-.067-.137-.125-.218-.172-.068-.039-.141-.069-.216-.092-.073-.022-.148-.035-.225-.042-.08-.007-.158-.006-.237.001-.073.007-.144.022-.213.044-.074.024-.143.056-.207.097-.064.041-.122.091-.174.15-.028.03-.054.062-.077.096-.034.042-.063.087-.087.135-.03.055-.052.11-.068.17-.016.06-.028.12-.032.183-.005.065-.002.129.008.194.01.064.026.126.05.186.022.05.048.097.081.14.03.039.063.074.1.105.042.034.087.063.137.086.052.024.108.04.166.049.03.005.061.009.092.01.03.001.061-.001.09-.005.032-.005.063-.012.094-.022.06-.02.115-.05.165-.087.05-.038.093-.084.128-.137.034-.053.06-.11.076-.173.016-.062.024-.125.024-.19 0-.058-.007-.116-.02-.172-.016-.057-.038-.11-.07-.158-.013-.02-.027-.038-.041-.057zm1.178 1.731c.073-.071.142-.146.207-.226.064-.079.124-.163.179-.249.053-.086.1-.175.141-.268.041-.094.075-.19.103-.289.027-.098.047-.2.059-.302.012-.103.017-.207.014-.312-.002-.104-.013-.208-.033-.31-.019-.102-.047-.201-.083-.297-.017-.049-.037-.096-.058-.143l-.44.035c-.036-.041-.078-.078-.124-.112-.023-.017-.048-.032-.072-.047l.042-.54c.034-.035-.071.071-.086.084l-.014-.013c-.125-.101-.269-.175-.425-.221-.156-.047-.32-.064-.483-.051-.163.012-.32.055-.465.126-.145.071-.276.169-.386.29-.11.12-.198.258-.26.408-.062.15-.097.31-.106.472-.008.162.01.323.053.478.044.155.114.3.208.429.046.063.096.121.153.175.056.054.117.102.183.144.066.042.136.077.21.105.074.029.15.051.23.065.078.014.158.021.238.021.08 0 .159-.007.237-.022.079-.015.156-.037.229-.067.072-.029.142-.065.207-.108.066-.043.126-.092.181-.147l-.034-.032.018-.019zm-.143-3.039c.103-.077.214-.141.333-.191.119-.05.243-.086.371-.108.127-.022.257-.03.386-.024.13.007.258.028.384.064.125.035.246.084.36.147.113.063.22.139.317.228l.028.027c.103.104.195.219.276.342.08.124.148.255.202.394.053.139.094.282.122.43.028.147.043.297.044.45v.01c.001.151-.012.301-.039.45-.027.148-.067.291-.119.43-.052.139-.119.27-.198.394-.079.123-.17.239-.272.343l-.008.008c-.097.097-.203.184-.317.259-.115.076-.238.139-.367.19-.129.05-.264.087-.402.11-.139.023-.28.033-.421.033-.142 0-.283-.01-.421-.033-.139-.022-.274-.059-.403-.11-.129-.05-.252-.114-.367-.19-.114-.076-.22-.162-.318-.26-.097-.097-.185-.204-.261-.32-.076-.116-.14-.241-.192-.372-.051-.13-.09-.266-.115-.406-.025-.14-.038-.283-.038-.426 0-.143.013-.286.038-.426.025-.14.064-.276.116-.406.052-.13.116-.255.192-.371.076-.117.164-.224.261-.321.122-.123.259-.231.407-.32zm-1.102.473c.144-.075.298-.132.459-.17.161-.039.326-.059.494-.06h.007c.168 0 .334.02.495.059.161.039.315.095.46.17.144.075.279.167.402.274.123.107.234.228.33.361l-.031-.039c.097.137.179.284.246.438.067.154.117.315.151.481.034.166.051.336.051.509 0 .172-.017.342-.05.508-.033.166-.084.327-.15.481-.066.154-.149.301-.246.438-.096.137-.208.26-.332.369-.123.108-.259.201-.403.276-.145.075-.299.132-.46.17-.161.039-.328.059-.496.059-.169 0-.335-.02-.496-.059-.161-.038-.316-.095-.46-.17-.144-.075-.28-.168-.403-.276-.124-.109-.236-.232-.332-.369-.097-.138-.18-.285-.246-.438-.066-.154-.117-.315-.15-.481-.034-.166-.05-.336-.05-.508 0-.173.016-.343.05-.509.033-.166.084-.327.15-.481.067-.154.149-.301.246-.438.096-.133.208-.254.331-.361.123-.107.258-.199.403-.274zm9.831-1.952c.07-.042.145-.077.223-.104.077-.026.158-.043.24-.051.081-.008.163-.007.244.003.082.01.161.03.238.059.076.029.149.067.216.113.067.047.128.101.182.162.053.062.099.13.137.203.038.074.067.152.089.234.021.08.034.164.039.248.005.085.002.169-.008.253-.11.083-.031.164-.06.241-.028.077-.066.15-.112.217-.047.068-.102.129-.165.184-.062.054-.131.1-.206.138-.075.038-.154.068-.236.089-.083.021-.168.034-.254.039-.087.004-.173.001-.258-.01-.085-.01-.167-.029-.246-.057-.079-.028-.153-.064-.221-.109-.069-.045-.132-.098-.188-.159-.056-.061-.105-.129-.145-.202-.04-.073-.071-.151-.094-.232-.022-.081-.036-.164-.041-.25-.005-.085-.003-.17.008-.253.011-.083.032-.165.061-.242.029-.077.066-.15.112-.217.046-.066.1-.126.161-.179.062-.053.13-.098.204-.136zm3.539 11.428v5.04h-.063l-9.854-5.036v5.036h-.959V5.075h.063l9.847 5.285V5.075h.966v5.581zm-9.854 5.853l9.854 5.036h.063v-5.04h.966v5.581h-.966v-5.285l-9.847-5.285h-.063v5.035h-.007v.959h.007v-.001z"></path>
                  </svg>
                  <span>App Store</span>
                </a>
                <a
                  href="#"
                  className="border border-gray-300 rounded-lg px-3 py-2 flex items-center space-x-2 hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5.52 20.589v.411h12.96v-.416l.044-.044-6.524-6.524-6.524 6.524.044.049zm12.96-17.159h-12.96v.416l-.044.044 6.524 6.524 6.524-6.524-.044-.049v-.411zm.963-.963v19.048c0 .531-.433.964-.964.964h-12.96c-.531 0-.963-.432-.963-.964v-19.048c0-.531.432-.963.963-.963h12.96c.531 0 .964.432.964.963z"></path>
                  </svg>
                  <span>Play Store</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center text-gray-300 text-sm">
            <p>© {new Date().getFullYear()} Exclusive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
