import { Salon } from '@/lib/types';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface SalonCardProps {
  salon: Salon;
  onClick?: () => void;
}

export default function SalonCard({ salon, onClick }: SalonCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer border border-gray-200"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={salon.image}
          alt={salon.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category badge */}
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-[#d4a32b] text-black text-xs font-semibold rounded-full">
            {salon.category}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-bold text-lg text-black mb-1 line-clamp-2">
          {salon.name}
        </h3>

        {/* Location */}
        <p className="text-gray-600 text-sm mb-3">{salon.district}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${
                  i < Math.floor(salon.rating || 0)
                    ? 'fill-[#d4a32b] text-[#d4a32b]'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({salon.reviews} {salon.reviews === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm line-clamp-2 mb-4">
          {salon.description}
        </p>

        {/* Services count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">
            {salon.services.length} services available
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-4 py-2 rounded font-semibold text-sm transition"
          >
            Read more
          </button>
        </div>
      </div>
    </div>
  );
}
