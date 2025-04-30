"use client";


export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 z-10"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/api/placeholder/1920/400')" }}
        ></div>
        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">About Exclusive</h1>
          <p className="text-xl text-white max-w-2xl">
            Your premium shopping destination for exclusive products and unique finds
          </p>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="container mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Founded in 2018, Exclusive started with a simple mission: to provide customers with access to premium products that cant be found anywhere else. What began as a small curated collection has grown into a sophisticated marketplace offering thousands of exclusive items.
            </p>
            <p className="text-gray-600 mb-4">
              Our team scours the globe to find the most innovative, high-quality, and unique products from both established and emerging brands. We believe that exceptional products deserve exceptional attention, which is why we carefully vet every item that appears on our platform.
            </p>
            <p className="text-gray-600">
              Today, Exclusive serves customers in over 30 countries, but our commitment to quality, exclusivity, and customer satisfaction remains unchanged.
            </p>
          </div>
          <div className="md:w-1/2 relative h-[400px] overflow-hidden rounded-lg shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/api/placeholder/600/400')" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Values Section with Cards */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Exclusivity",
                description: "We source products you won't find elsewhere, giving you access to truly special items.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                ),
              },
              {
                title: "Quality",
                description: "Every product meets our rigorous standards for craftsmanship, materials, and design.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
              {
                title: "Innovation",
                description: "We continuously seek out the latest innovations and trends to bring you tomorrow's products today.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 transform transition-transform hover:scale-105">
                <div className="text-indigo-600 mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Meet Our Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              name: "Mohammad Hilmi Afifi",
              role: "Founder & CEO",
              bio: "With 15+ years in retail innovation, Sarah leads our vision for the future.",
            },
            {
              name: "Gumiwang Gede",
              role: "Head of Curation",
              bio: "Michael travels the world to discover unique products worth sharing.",
            },
            {
              name: "Selvia Riska",
              role: "CTO",
              bio: "Priya ensures our digital experience is as exceptional as our products.",
            },
            {
              name: "Taufiqurridwan",
              role: "Customer Experience Director",
              bio: "David's team ensures every interaction with Exclusive exceeds expectations.",
            },
          ].map((member, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl">
              <div className="h-64 bg-gray-200 relative">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('/api/placeholder/300/300')` }}
                ></div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="text-indigo-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Exclusive has completely changed how I shop for premium products. The curation is unmatched!",
                author: "Emma T., London",
                stars: 5,
              },
              {
                quote: "The quality of everything I've purchased has been exceptional. Worth every penny.",
                author: "James L., New York",
                stars: 5,
              },
              {
                quote: "Not only are the products amazing, but their customer service team is the best I've ever dealt with.",
                author: "Sofia R., Milan",
                stars: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-8 relative">
                <div className="text-yellow-400 flex mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic mb-6">{testimonial.quote}</p>
                <p className="text-gray-800 font-medium">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Want to Learn More?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-8">
          Were always happy to connect with our customers and share more about our story, products, and vision.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
            Contact Us
          </button>
          <button className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-6 rounded-lg transition-colors">
            Join Our Newsletter
          </button>
        </div>
      </div>
    </div>
  );
}