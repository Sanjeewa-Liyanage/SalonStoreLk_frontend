'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FindSalonPage from '@/components/FindSalonPage';
import SalonDetailPage from '@/components/SalonDetailPage';

export default function LandingFindSalonsPage() {
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    if (page === 'home') {
      window.location.href = '/';
      return;
    }

    if (page === 'publish') {
      window.location.href = '/';
      return;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3]">
      <Header onNavigate={handleNavigate} currentPage="find" />

      <div className="grow">
        {selectedSalonId ? (
          <SalonDetailPage
            salonId={selectedSalonId}
            onBack={() => setSelectedSalonId(null)}
            onSalonSelect={setSelectedSalonId}
          />
        ) : (
          <FindSalonPage onSalonSelect={setSelectedSalonId} />
        )}
      </div>

      <Footer />
    </div>
  );
}
