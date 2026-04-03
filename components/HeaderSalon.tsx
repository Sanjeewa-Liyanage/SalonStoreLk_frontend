"use client";

import React from "react";
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { useMuiTheme } from "@/context/MuiThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HeaderSalon({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean, setSidebarOpen: (open: boolean) => void }) {
  const { isDark, toggleTheme } = useMuiTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const handleProfileNavigation = () => {
    router.push('/salon_owner/profile');
  };

  const handleSettingsNavigation = () => {
    router.push('/salon_owner/settings');
  };

  const displayName = user?.name || user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : 'Salon Owner';
  const avatarSrc = user?.profilePictureUrl || user?.avatarUrl || undefined;

  const greeting = getGreeting();

  return (
    <header className="h-16 md:h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      {/* Hamburger Menu for Mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
        title="Toggle Menu"
      >
        <Menu size={24} />
      </button>

      {/* Search Bar */}
      <div className="hidden md:block relative grow max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search appointments, customers..."
          className="w-full bg-neutral-50 border border-neutral-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/20 focus:border-[#C8A84B] transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="hidden md:block h-8 w-px bg-neutral-200 mx-2"></div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 md:gap-3 hover:bg-neutral-50 p-1.5 rounded-lg transition-colors focus:outline-none">
            <Avatar className="h-8 md:h-9 w-8 md:w-9 border border-[#C8A84B]/30">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="bg-[#C8A84B]/10 text-[#C8A84B] text-xs font-bold">
                {displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'SO'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-xs md:text-sm font-semibold text-black leading-none">{displayName}</p>
              <p className="text-[10px] md:text-[11px] text-neutral-500 mt-1 uppercase tracking-tighter">{greeting}</p>
            </div>
            <ChevronDown size={14} className="text-neutral-400 hidden md:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 mt-2 bg-white text-black border border-neutral-200 shadow-xl"
          >
            <DropdownMenuLabel className="text-black">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-black focus:text-black focus:bg-neutral-100"
              onClick={handleProfileNavigation}
            >
              <User size={16} className="text-black" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-black focus:text-black focus:bg-neutral-100"
              onClick={handleSettingsNavigation}
            >
              <Settings size={16} className="text-black" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-black focus:text-black focus:bg-neutral-100"
              onClick={handleLogout}
            >
              <LogOut size={16} className="text-black" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}