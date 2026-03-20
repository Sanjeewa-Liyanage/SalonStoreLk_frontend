import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/94758338180"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 bg-green-500 hover:bg-green-600 transition text-white rounded-full p-4 shadow-lg z-40 flex items-center justify-center"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle size={24} />
      </a>

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-[#d4a32b] hover:bg-[#c49320] transition text-black rounded-full p-4 shadow-lg z-40 flex items-center justify-center font-bold"
        aria-label="Scroll to top"
      >
        ↑
      </button>

      <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: About */}
            <div>
              <h3 className="text-[#d4a32b] font-bold text-lg mb-4">About Salon Store</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Bringing together every top salon in Sri Lanka in one place and providing customers all over Sri Lanka the opportunity to receive the best service from one of the top salons.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-[#d4a32b] font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#d4a32b] transition">
                    Find Salons
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#d4a32b] transition">
                    Publish Your Salon
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#d4a32b] transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#d4a32b] transition">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="text-[#d4a32b] font-bold text-lg mb-4">Contact Us</h3>
              <p className="text-gray-300 text-sm mb-2">
                <strong>Phone:</strong> +94 75 833 8180
              </p>
              <p className="text-gray-300 text-sm mb-2">
                <strong>WhatsApp:</strong> +94 75 833 8180
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Email:</strong> info@salonstore.lk
              </p>
            </div>
          </div>
        </div>

        {/* Copyright bar with gold background */}
        <div className="bg-[#d4a32b] py-3">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-center text-black text-sm">
              Copyright © 2026 Salon Store Lanka | Powered by <a href="#" className="text-blue-600 hover:underline">Iani Distributor</a>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
