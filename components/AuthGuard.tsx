import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, refreshAccessToken } from '@/lib/authService';
import { useAuth } from '@/context/AuthContext';
import SalonLoader from './Loader';

export default function AuthGuard({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const [authorized, setAuthorized] = useState(false);
  const { setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("accessToken");

      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const user = await getUserProfile();
        setUser(user); // Set user in context
        if (user.role !== allowedRole) {
          router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/salon_owner/dashboard');
        } else {
          setAuthorized(true);
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Token expired, try refreshing
          try {
            const newToken = await refreshAccessToken();
            const user = await getUserProfile();
            setUser(user); // Set user in context
            if (user.role !== allowedRole) {
              router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/salon_owner/dashboard');
            } else {
              setAuthorized(true);
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            router.push('/auth/login');
          }
        } else {
          console.error("Auth check failed:", error);
          router.push('/auth/login');
        }
      }
    };
    checkAuth();
  }, [allowedRole, router, setUser]);

  if (!authorized) return <div className="flex justify-center items-center min-h-screen"><SalonLoader /></div>; 
  return <>{children}</>;
}