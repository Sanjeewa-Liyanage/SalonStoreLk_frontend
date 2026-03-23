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
  LogOut 
} from "lucide-react";
import { useMuiTheme } from "@/context/MuiThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function HeaderSalon() {
  const { isDark, toggleTheme } = useMuiTheme();

  return (
    <header className="h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="relative w-96">
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
      <div className="flex items-center gap-6">
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

        <div className="h-8 w-[1px] bg-neutral-200 mx-2"></div>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-neutral-50 p-1.5 rounded-lg transition-colors focus:outline-none">
            <Avatar className="h-9 w-9 border border-[#C8A84B]/30">
              <AvatarImage src="" alt="Owner" />
              <AvatarFallback className="bg-[#C8A84B]/10 text-[#C8A84B] text-xs font-bold">
                SO
              </AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-black leading-none">Salon Owner</p>
              <p className="text-[11px] text-neutral-500 mt-1 uppercase tracking-tighter">Premium Plan</p>
            </div>
            <ChevronDown size={14} className="text-neutral-400" />
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 mt-2">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2">
              <User size={16} /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-2">
              <Settings size={16} /> Subscription
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:text-red-500">
              <LogOut size={16} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}