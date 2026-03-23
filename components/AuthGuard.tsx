'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '@/lib/authService';
import SalonLoader from './Loader';

export default function AuthGuard({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // FIX: Change localStorage to sessionStorage
      const token = sessionStorage.getItem("accessToken"); 
      
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const user = await getUserProfile(token);
        if (user.role !== allowedRole) {
          router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/salon_owner/dashboard');
        } else {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push('/auth/login');
      }
    };
    checkAuth();
  }, [allowedRole, router]);

  if (!authorized) return <div className="flex justify-center items-center min-h-screen"><SalonLoader /></div>; 
  return <>{children}</>;
}