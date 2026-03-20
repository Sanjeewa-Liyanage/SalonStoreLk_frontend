'use client';

import { MOCK_SALONS } from '@/lib/mockData';
import SalonCard from './SalonCard';
import { Star, Phone, MessageCircle, MapPin, Award, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface SalonDetailPageProps {
  salonId: string;
  onBack?: () => void;
  onSalonSelect?: (salonId: string) => void;
}

export default function SalonDetailPage({
  salonId,
  onBack,
  onSalonSelect,
}: SalonDetailPageProps) {
  const salon = MOCK_SALONS.find((s) => s.id === salonId);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Salon not found</h1>
          <button
            onClick={onBack}
            className="bg-[#d4a32b] hover:bg-[#c49320] text-black font-bold px-6 py-3 rounded transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get related salons (same category, exclude current)
  const relatedSalons = MOCK_SALONS.filter(
    (s) => s.category === salon.category && s.id !== salon.id
  ).slice(0, 5);

  return (
    <main className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="text-[#1e40af] hover:text-[#1e3a8a] font-medium text-sm"
          >
            ← Back to Salons
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Info */}
          <div className="lg:col-span-2">
            {/* Main Image Gallery */}
            <div className="mb-8">
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden h-96">
                <img
                  src={salon.gallery[selectedImageIdx]}
                  alt="Salon image"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {salon.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIdx === idx
                        ? 'border-[#d4a32b]'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Gallery ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Salon Basic Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-3 py-1 bg-[#d4a32b] text-black text-xs font-semibold rounded-full mb-2">
                    {salon.category}
                  </span>
                  <h1 className="text-3xl font-bold text-black mb-2">
                    {salon.name}
                  </h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin size={18} />
                    {salon.district}
                  </p>
                </div>

                {/* Rating */}
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={20}
                        className={`${
                          i < Math.floor(salon.rating || 0)
                            ? 'fill-[#d4a32b] text-[#d4a32b]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    {salon.rating} ({salon.reviews} reviews)
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">
                {salon.description}
              </p>

              {/* Contact Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:${salon.contact.phone}`}
                  className="flex-1 bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-3 px-4 rounded text-center transition flex items-center justify-center gap-2"
                >
                  <Phone size={18} />
                  Call: {salon.contact.phone}
                </a>
                <a
                  href={`https://wa.me/${salon.contact.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded text-center transition flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Qualifications & Experience */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Qualifications */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Award size={20} />
                  Meet Our Highly Qualified Team
                </h3>
                <ul className="space-y-2">
                  {salon.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-700">
                      <span className="text-[#d4a32b] font-bold">•</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Experience */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <Briefcase size={20} />
                  Experience
                </h3>
                <ul className="space-y-2">
                  {salon.experience.map((exp, idx) => (
                    <li key={idx} className="flex gap-2 text-gray-700">
                      <span className="text-[#d4a32b] font-bold">•</span>
                      <span>{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-black mb-6">
                Our Comprehensive Services
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Hair Services */}
                <div>
                  <h3 className="font-bold text-black mb-3">Hair Services</h3>
                  <ul className="space-y-1">
                    {salon.services
                      .filter((s) => ['Hair', 'Hair Cutting', 'Hair Coloring'].some(c => s.name.includes(c) || s.category?.includes(c)))
                      .slice(0, 5)
                      .map((service, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">
                          • {service.name}
                          {service.products && ` (${service.products.join(', ')})`}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Facial Services */}
                <div>
                  <h3 className="font-bold text-black mb-3">Facial Treatments</h3>
                  <ul className="space-y-1">
                    {salon.services
                      .filter((s) => s.category?.includes('Facial'))
                      .slice(0, 5)
                      .map((service, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">
                          • {service.name}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Other Services */}
                <div>
                  <h3 className="font-bold text-black mb-3">Additional Services</h3>
                  <ul className="space-y-1">
                    {salon.services
                      .filter((s) => !s.category?.includes('Facial') && !['Hair', 'Hair Cutting', 'Hair Coloring'].some(c => s.name.includes(c)))
                      .slice(0, 5)
                      .map((service, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">
                          • {service.name}
                        </li>
                      ))}
                  </ul>
                </div>

                {/* Products Used */}
                <div>
                  <h3 className="font-bold text-black mb-3">Products Used</h3>
                  <div className="space-y-1">
                    {Array.from(
                      new Set(
                        salon.services
                          .flatMap((s) => s.products || [])
                          .slice(0, 5)
                      )
                    ).map((product, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-3 py-1 bg-[#d4a32b]/20 text-[#d4a32b] rounded-full text-sm mr-2 mb-2"
                      >
                        {product}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div>
            {/* Contact Card */}
            <div className="bg-[#d4a32b] rounded-lg p-6 mb-8 sticky top-24">
              <h3 className="text-xl font-bold text-black mb-6">
                Contact This Salon
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black/80 mb-1">
                    Call us
                  </label>
                  <a
                    href={`tel:${salon.contact.phone}`}
                    className="text-lg font-bold text-black hover:underline"
                  >
                    {salon.contact.phone}
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black/80 mb-1">
                    WhatsApp
                  </label>
                  <a
                    href={`https://wa.me/${salon.contact.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-black hover:underline"
                  >
                    {salon.contact.whatsapp}
                  </a>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black/80 mb-1">
                    Address
                  </label>
                  <p className="text-black">{salon.contact.address}</p>
                </div>

                {salon.socialMedia && (
                  <div>
                    <label className="block text-sm font-semibold text-black/80 mb-2">
                      Follow Us
                    </label>
                    <div className="flex gap-3">
                      {salon.socialMedia.facebook && (
                        <a
                          href={`https://facebook.com/${salon.socialMedia.facebook}`}
                          className="w-10 h-10 bg-black text-[#d4a32b] rounded-full flex items-center justify-center font-bold hover:bg-black/80 transition"
                        >
                          f
                        </a>
                      )}
                      {salon.socialMedia.instagram && (
                        <a
                          href={`https://instagram.com/${salon.socialMedia.instagram}`}
                          className="w-10 h-10 bg-black text-[#d4a32b] rounded-full flex items-center justify-center font-bold hover:bg-black/80 transition"
                        >
                          I
                        </a>
                      )}
                      {salon.socialMedia.tiktok && (
                        <a
                          href={`https://tiktok.com/@${salon.socialMedia.tiktok}`}
                          className="w-10 h-10 bg-black text-[#d4a32b] rounded-full flex items-center justify-center font-bold hover:bg-black/80 transition"
                        >
                          TT
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Salons */}
        {relatedSalons.length > 0 && (
          <section className="mt-16 pt-12 border-t-2 border-gray-200">
            <h2 className="text-2xl font-bold text-black mb-8">
              Related Salons in {salon.category}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {relatedSalons.map((relatedSalon) => (
                <SalonCard
                  key={relatedSalon.id}
                  salon={relatedSalon}
                  onClick={() => onSalonSelect?.(relatedSalon.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
