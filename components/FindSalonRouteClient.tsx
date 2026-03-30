'use client';

import { useState } from 'react';
import FindSalonPage from '@/components/FindSalonPage';
import SalonDetailPage from '@/components/SalonDetailPage';

export default function FindSalonRouteClient() {
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);

  if (selectedSalonId) {
    return (
      <SalonDetailPage
        salonId={selectedSalonId}
        onBack={() => setSelectedSalonId(null)}
        onSalonSelect={setSelectedSalonId}
      />
    );
  }

  return <FindSalonPage onSalonSelect={setSelectedSalonId} />;
}