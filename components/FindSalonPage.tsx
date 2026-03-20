'use client';

import { useState, useMemo } from 'react';
import { MOCK_SALONS } from '@/lib/mockData';
import SalonCard from './SalonCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FindSalonPageProps {
  onSalonSelect?: (salonId: string) => void;
}

export default function FindSalonPage({ onSalonSelect }: FindSalonPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('rating');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Filter and sort salons
  const filteredAndSortedSalons = useMemo(() => {
    let salons = [...MOCK_SALONS];

    // Filter by category
    if (filterCategory) {
      salons = salons.filter((s) => s.category === filterCategory);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        return salons.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'name':
        return salons.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return salons.reverse();
      default:
        return salons;
    }
  }, [sortBy, filterCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSalons.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedSalons = filteredAndSortedSalons.slice(
    startIdx,
    startIdx + itemsPerPage
  );

  // Get unique categories for filter
  const categories = Array.from(new Set(MOCK_SALONS.map((s) => s.category)));

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#d4a32b] py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            Find Your Perfect Salon
          </h1>
          <p className="text-black/80">
            Showing {startIdx + 1}-{Math.min(startIdx + itemsPerPage, filteredAndSortedSalons.length)} of{' '}
            {filteredAndSortedSalons.length} results
          </p>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Filter by Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory(null)}
                className={`px-4 py-2 rounded font-medium transition ${
                  filterCategory === null
                    ? 'bg-black text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  className={`px-4 py-2 rounded font-medium transition ${
                    filterCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full md:w-48 px-4 py-2 border-2 border-black rounded font-medium bg-white cursor-pointer hover:bg-gray-50"
            >
              <option value="rating">Average Rating</option>
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Salons Grid */}
        {paginatedSalons.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {paginatedSalons.map((salon) => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  onClick={() => onSalonSelect?.(salon.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border-2 border-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, currentPage - 2),
                    Math.min(totalPages, currentPage + 1)
                  )
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded font-semibold transition ${
                        currentPage === page
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                {currentPage < totalPages - 2 && (
                  <span className="text-gray-500">...</span>
                )}

                {currentPage < totalPages - 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-semibold transition"
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border-2 border-black rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No salons found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
