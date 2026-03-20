'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
import FindSalonPage from '@/components/FindSalonPage';
import SalonDetailPage from '@/components/SalonDetailPage';
import PublishPage from '@/components/PublishPage';

type PageType = 'home' | 'find' | 'detail' | 'publish' | 'contact';

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSalonSelect = (salonId: string) => {
    setSelectedSalonId(salonId);
    setCurrentPage('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromDetail = () => {
    setCurrentPage('find');
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: currentPage === 'home' ? "url('/background.jpg')" : 'none',
      }}
    >
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      <div className="grow ">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'find' && (
          <FindSalonPage onSalonSelect={handleSalonSelect} />
        )}
        {currentPage === 'detail' && selectedSalonId && (
          <SalonDetailPage
            salonId={selectedSalonId}
            onBack={handleBackFromDetail}
            onSalonSelect={handleSalonSelect}
          />
        )}
        {currentPage === 'publish' && <PublishPage />}
      </div>

     <Footer />
    </div>
  );
}
