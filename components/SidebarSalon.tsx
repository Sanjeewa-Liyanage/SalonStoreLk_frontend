"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Scissors, 
  Users, 
  Settings, 
  Store,
  MessageSquare,
  LogOut 
} from "lucide-react";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/salon_owner/dashboard" },
  { name: "My Ads", icon: CalendarDays, href: "/salon_owner/dashboard/appointments" },
  { name: "My Salon", icon: Store, href: "/salon_owner/dashboard/my-salon" },
  { name: "Services", icon: Scissors, href: "/salon_owner/dashboard/services" },
  { name: "Staff", icon: Users, href: "/salon_owner/dashboard/staff" },
  { name: "Reviews", icon: MessageSquare, href: "/salon_owner/dashboard/reviews" },
  { name: "Settings", icon: Settings, href: "/salon_owner/dashboard/settings" },
];

export default function SidebarSalon() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen w-64 bg-black border-r border-neutral-800 text-white">
      {/* Brand */}
      <div className="p-4 md:p-6">
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <img src="/logo.png" alt="Logo" className="w-6 md:w-8 h-6 md:h-8 object-contain" />
          <span className="font-playfair text-base md:text-lg tracking-wide">
            Salon<span style={{ color: "#C8A84B" }}>Store</span>.lk
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 md:px-4 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm transition-all ${
                isActive 
                  ? "bg-[#C8A84B] text-black font-medium" 
                  : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout / User Info */}
      <div className="p-2 md:p-4 border-t border-neutral-800">
        <button 
          className="flex items-center gap-2 md:gap-3 w-full px-3 md:px-4 py-2 md:py-3 rounded-lg text-xs md:text-sm text-red-400 hover:bg-red-950/30 transition-all"
          onClick={() => {/* Add logout logic */}}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}