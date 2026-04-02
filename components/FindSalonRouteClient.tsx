'use client';

import { useRouter } from 'next/navigation';
import FindSalonPage from '@/components/FindSalonPage';

export default function FindSalonRouteClient() {
  const router = useRouter();

  return (
    <FindSalonPage
      onSalonSelect={(salonId) => {
        const safeId = String(salonId || '').trim();
        if (!safeId || safeId === 'undefined' || safeId === 'null') return;
        router.push(`/find-salon/${encodeURIComponent(safeId)}`);
      }}
      onAdSelect={(adId) => {
        const safeId = String(adId || '').trim();
        if (!safeId || safeId === 'undefined' || safeId === 'null') return;
        router.push(`/find-salon/ad/${encodeURIComponent(safeId)}`);
      }}
    />
  );
}