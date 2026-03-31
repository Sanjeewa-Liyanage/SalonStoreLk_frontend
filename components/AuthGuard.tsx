"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SalonLoader from "./Loader";

export default function AuthGuard({ children, allowedRole }: { children: React.ReactNode, allowedRole: string }) {
  const [authorized, setAuthorized] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for AuthProvider to finish checking session
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Role-based protection
    if (user.role !== allowedRole) {
      router.push(user.role === "ADMIN" ? "/admin/dashboard" : "/salon_owner/dashboard");
    } else {
      setAuthorized(true);
    }
  }, [allowedRole, router, user, authLoading]);

  if (authLoading || !authorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <SalonLoader />
      </div>
    );
  }

  return <>{children}</>;
}
