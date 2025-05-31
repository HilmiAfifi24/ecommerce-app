"use client";

import { useState, ChangeEvent, FormEvent } from "react"; // Import specific event types

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [submitted, setSubmitted] = useState(false);

  // Add type for 'e'
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add type for 'e'
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would typically handle the form submission with API call
    console.log("Form submitted:", formData);
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 3000);
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-70 z-10"></div>
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/api/placeholder/1920/400')" }}
        ></div>
        <div className="container mx-auto px-6 relative z-20 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-white max-w-2xl">
            Wed love to hear from you. Heres how you can reach us.
          </p>
        </div>
      </div>

      {/* Contact Information Cards */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: "Customer Support",
              description: "Have questions about your order or our products? Our support team is here to help.",
              contact: "support@exclusive.com",
              phone: "+1 (800) 123-4567",
              hours: "24/7 Support",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
            },
            {
              title: "Business Inquiries",
              description: "Interested in partnering with us or carrying our products? Let's talk business.",
              contact: "business@exclusive.com",
              phone: "+1 (888) 456-7890",
              hours: "Mon-Fri, 9AM-5PM EST",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              ),
            },
            {
              title: "Media Relations",
              description: "For press inquiries or media opportunities, please contact our PR team.",
              contact: "media@exclusive.com",
              phone: "+1 (877) 789-0123",
              hours: "Mon-Fri, 9AM-6PM EST",
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              ),
            },
          ].map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg p-8 transform transition-all hover:shadow-xl">
              <div className="text-indigo-600 mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Email:</span> {card.contact}
                </p>
                <p className="text-gray-700 mb-1">
                  <span className="font-medium">Phone:</span> {card.phone}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Hours:</span> {card.hours}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form and Map Section */}
        <div className="flex flex-col md:flex-row gap-12">
          {/* Contact Form */}
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
            <p className="text-gray-600 mb-8">
              Have a question or feedback? Fill out the form below and well get back to you as soon as possible.
            </p>

            {submitted ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
                <p className="font-medium">Thank you for your message!</p>
                <p>Weve received your inquiry and will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="How can we help you?"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your message here..."
                    required
                  ></textarea>
                </div>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Map and Office Locations */}
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Visit Our Offices</h2>
            <div className="bg-gray-200 rounded-lg h-64 mb-6 overflow-hidden">
              {/* Placeholder for map - in a real application, you would embed a Google Map or similar here */}
              <div className="w-full h-full bg-cover bg-center relative">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/api/placeholder/800/300')" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-lg font-medium text-gray-800 bg-white bg-opacity-75 px-4 py-2 rounded">
                    Interactive Map Would Be Displayed Here
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="text-indigo-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">New York (Headquarters)</h3>
                  <p className="text-gray-600">123 Fifth Avenue, Suite 1500<br />New York, NY 10010</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-indigo-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">London</h3>
                  <p className="text-gray-600">456 Oxford Street<br />London, W1C 1AP</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="text-indigo-600 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Tokyo</h3>
                  <p className="text-gray-600">789 Shibuya Street<br />Tokyo, 150-0002</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                question: "How long does shipping take?",
                answer: "For domestic orders, standard shipping typically takes 3-5 business days. International shipping can take 7-14 business days depending on the destination country. Express shipping options are available at checkout."
              },
              {
                question: "What is your return policy?",
                answer: "We offer a 30-day return policy for items in their original condition with tags attached. Certain products like personalized items or intimate goods may not be eligible for return due to hygiene reasons."
              },
              {
                question: "Do you ship internationally?",
                answer: "Yes! We ship to over 30 countries worldwide. International shipping costs and delivery times vary by location. You can see specific details during checkout."
              },
              {
                question: "How can I track my order?",
                answer: "Once your order ships, you'll receive a tracking number via email. You can use this number to track your package on our website or directly with the shipping carrier."
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Cant find the answer youre looking for?</p>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors">
              Browse Full FAQ
            </button>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-900 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Connected</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter to receive updates on new products, special offers, and exclusive content.
          </p>

          <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            />
            <button type="submit" className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </form>

          <div className="flex justify-center mt-8 space-x-6">
            {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
              <a key={platform} href="#" className="text-white hover:text-yellow-400 transition-colors">
                <span className="sr-only">{platform}</span>
                <div className="w-8 h-8 border border-white/30 rounded-full flex items-center justify-center hover:border-yellow-400">
                  {/* Simple representation of social icons */}
                  {platform === 'facebook' && <span className="text-lg">f</span>}
                  {platform === 'twitter' && <span className="text-lg">t</span>}
                  {platform === 'instagram' && <span className="text-lg">i</span>}
                  {platform === 'linkedin' && <span className="text-lg">in</span>}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}