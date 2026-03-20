'use client';

import { MOCK_PRICING_PACKAGES } from '@/lib/mockData';
import PricingCard from './PricingCard';
import { Check, TrendingUp, Users, Zap } from 'lucide-react';
import { useState } from 'react';

export default function PublishPage() {
  const [formData, setFormData] = useState({
    salonName: '',
    location: '',
    phone: '',
    email: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Thank you for your interest! We'll contact you at ${formData.phone} to complete your registration.`
    );
    setFormData({ salonName: '', location: '', phone: '', email: '' });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-black text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Promote Your Salon Island Wide
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            Reach thousands of local and foreign customers looking for professional salon services in Sri Lanka
          </p>
          <div className="inline-block px-6 py-3 bg-[#d4a32b] text-black font-bold rounded-lg">
            Starting from RS 55/Day
          </div>
        </div>
      </section>

      {/* Why Promote */}
      <section className="bg-[#f5f5f5] py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Why Promote Your Salon with Us?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 border-l-4 border-[#d4a32b]">
              <TrendingUp size={32} className="text-[#d4a32b] mb-4" />
              <h3 className="font-bold text-black mb-2 text-lg">Increase Visibility</h3>
              <p className="text-gray-700 text-sm">
                Get your salon in front of thousands of customers searching for professional beauty services.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-[#d4a32b]">
              <Users size={32} className="text-[#d4a32b] mb-4" />
              <h3 className="font-bold text-black mb-2 text-lg">Target Audience</h3>
              <p className="text-gray-700 text-sm">
                Reach both local and international customers actively looking for quality salon services.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-[#d4a32b]">
              <Zap size={32} className="text-[#d4a32b] mb-4" />
              <h3 className="font-bold text-black mb-2 text-lg">Affordable Marketing</h3>
              <p className="text-gray-700 text-sm">
                Promote your salon for a small daily fee without spending a fortune on traditional advertising.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-l-4 border-[#d4a32b]">
              <Check size={32} className="text-[#d4a32b] mb-4" />
              <h3 className="font-bold text-black mb-2 text-lg">Easy Management</h3>
              <p className="text-gray-700 text-sm">
                Manage your salon profile, photos, services, and contact information all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Affordable Pricing Packages
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {MOCK_PRICING_PACKAGES.map((pkg) => (
              <PricingCard key={pkg.id} package={pkg} />
            ))}
          </div>

          {/* Additional Info */}
          <div className="max-w-3xl mx-auto mt-12 bg-[#d4a32b]/10 border-l-4 border-[#d4a32b] p-6 rounded">
            <h3 className="font-bold text-black mb-3">All packages include:</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex gap-2">
                <Check size={18} className="text-[#d4a32b] flex-shrink-0" />
                <span>24/7 Customer Support</span>
              </div>
              <div className="flex gap-2">
                <Check size={18} className="text-[#d4a32b] flex-shrink-0" />
                <span>Unlimited Updates</span>
              </div>
              <div className="flex gap-2">
                <Check size={18} className="text-[#d4a32b] flex-shrink-0" />
                <span>Professional Profile</span>
              </div>
              <div className="flex gap-2">
                <Check size={18} className="text-[#d4a32b] flex-shrink-0" />
                <span>Direct Customer Contact</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="bg-black text-white py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-gray-300 text-center mb-8">
            Fill in the form below and our team will contact you to help set up your profile.
          </p>

          <form
            onSubmit={handleSubmit}
            className="bg-white text-black rounded-lg p-8 space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Salon Name *
                </label>
                <input
                  type="text"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#d4a32b] focus:outline-none"
                  placeholder="Enter your salon name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#d4a32b] focus:outline-none"
                  placeholder="City/District"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#d4a32b] focus:outline-none"
                  placeholder="+94 75 833 8180"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded focus:border-[#d4a32b] focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-black hover:bg-black/80 text-white font-bold py-4 px-6 rounded text-lg transition"
              >
                Submit Registration Request
              </button>
              <p className="text-xs text-gray-600 text-center mt-3">
                Our team will review your information and contact you within 24 hours.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-black text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="bg-[#f5f5f5] rounded-lg p-6 cursor-pointer">
              <summary className="font-bold text-black text-lg flex items-center gap-2">
                <span className="text-[#d4a32b]">+</span>
                What services can I showcase?
              </summary>
              <p className="text-gray-700 mt-4">
                You can showcase all your salon services including hair care, facial treatments, bridal services, nail care, body treatments, and more. Our platform supports unlimited service listings with detailed descriptions and product information.
              </p>
            </details>

            <details className="bg-[#f5f5f5] rounded-lg p-6 cursor-pointer">
              <summary className="font-bold text-black text-lg flex items-center gap-2">
                <span className="text-[#d4a32b]">+</span>
                How many photos and videos can I upload?
              </summary>
              <p className="text-gray-700 mt-4">
                With our 6-month package you can upload up to 30 service photos and 6 videos. With the 12-month package, you get up to 45 photos and 10 videos, with the option to update them monthly.
              </p>
            </details>

            <details className="bg-[#f5f5f5] rounded-lg p-6 cursor-pointer">
              <summary className="font-bold text-black text-lg flex items-center gap-2">
                <span className="text-[#d4a32b]">+</span>
                Do you offer customer support?
              </summary>
              <p className="text-gray-700 mt-4">
                Yes! All our packages include 24/7 customer support. Our team is available to help you manage your profile, answer customer inquiries, and resolve any technical issues.
              </p>
            </details>

            <details className="bg-[#f5f5f5] rounded-lg p-6 cursor-pointer">
              <summary className="font-bold text-black text-lg flex items-center gap-2">
                <span className="text-[#d4a32b]">+</span>
                Can I cancel my subscription?
              </summary>
              <p className="text-gray-700 mt-4">
                Yes, you can cancel your subscription at any time. However, we encourage long-term partnerships as they help build stronger customer relationships and visibility.
              </p>
            </details>

            <details className="bg-[#f5f5f5] rounded-lg p-6 cursor-pointer">
              <summary className="font-bold text-black text-lg flex items-center gap-2">
                <span className="text-[#d4a32b]">+</span>
                How do customers contact me?
              </summary>
              <p className="text-gray-700 mt-4">
                Customers can contact you directly through the phone number, WhatsApp, and email you provide in your profile. We never charge customers for this service.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#d4a32b] py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">
            Start Promoting Your Salon Today
          </h2>
          <p className="text-black/80 mb-6 text-lg">
            Reach thousands of customers and grow your salon business across Sri Lanka
          </p>
          <button className="bg-black hover:bg-black/80 text-white font-bold px-8 py-4 rounded-lg text-lg transition">
            Begin Registration
          </button>
        </div>
      </section>
    </main>
  );
}
