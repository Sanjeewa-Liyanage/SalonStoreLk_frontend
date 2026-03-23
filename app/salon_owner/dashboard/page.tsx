"use client";

import React, { useState } from "react";
import SidebarSalon from "@/components/SidebarSalon";
import HeaderSalon from "@/components/HeaderSalon";
import { MoreVertical, Eye, Heart, MessageCircle, TrendingUp, ChevronDown, Menu, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthGuard from "@/components/AuthGuard";

export default function SalonDashboard() {
  // Dummy data for stats
  const stats = [
    {
      title: "TOTAL VIEWS",
      value: "2,847",
      change: "+12.5%",
      icon: Eye,
      color: "text-orange-500",
    },
    {
      title: "TOTAL LIKES",
      value: "543",
      change: "+8.2%",
      icon: Heart,
      color: "text-red-500",
    },
    {
      title: "MESSAGES",
      value: "28",
      change: "+3%",
      icon: MessageCircle,
      color: "text-blue-500",
    },
    {
      title: "ACTIVE ADS",
      value: "12",
      change: "2 due to expire",
      icon: TrendingUp,
      color: "text-green-500",
    },
  ];

  // Dummy data for recent ads
  const recentAds = [
    {
      id: 1,
      title: "Summer Hair Cut Special",
      category: "Hair Cutting",
      status: "Active",
      views: 234,
      likes: 45,
      messages: 8,
      postedAt: "Posted 2 days ago",
    },
    {
      id: 2,
      title: "Bridal Makeup Package",
      category: "Makeup",
      status: "Active",
      views: 567,
      likes: 123,
      messages: 15,
      postedAt: "Posted 5 days ago",
    },
    {
      id: 3,
      title: "Full Body Spa Treatment",
      category: "Spa & Wellness",
      status: "Expiring",
      views: 189,
      likes: 32,
      messages: 4,
      postedAt: "Posted 10 days ago",
    },
    {
      id: 4,
      title: "Nail Art Design Class",
      category: "Nails",
      status: "Draft",
      views: 0,
      likes: 0,
      messages: 0,
      postedAt: "Posted 1 day ago",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      id: 1,
      title: "Create New Ad",
      description: "Post a new service or offer",
      icon: "➕",
    },
    {
      id: 2,
      title: "View Analytics",
      description: "Check performance metrics",
      icon: "📊",
    },
    {
      id: 3,
      title: "Salon Settings",
      description: "Update salon information",
      icon: "⚙️",
    },
    {
      id: 4,
      title: "Get Help",
      description: "Contact support team",
      icon: "❓",
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Expiring":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AuthGuard allowedRole="SALON_OWNER">
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile, visible on md and above */}
      <div className="hidden md:block">
        <SidebarSalon />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 z-50">
            <SidebarSalon />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <HeaderSalon sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">
                  Welcome back, Amal
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Manage your salons and ads in one place
                </p>
              </div>
              <Button className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold text-sm md:text-base w-full md:w-auto">
                + Register New Salon
              </Button>
            </div>

            {/* Current Salon Card */}
            <Card className="mb-6 md:mb-8 border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
                  <div>
                    <CardTitle className="text-lg text-gray-900">CURRENT SALON</CardTitle>
                    <CardDescription className="text-gray-600">
                      Colombo, Sri Lanka
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="text-[#C8A84B] border-[#C8A84B] gap-2 w-full md:w-auto text-sm">
                        Switch Salon
                        <ChevronDown size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="cursor-pointer text-gray-900">
                        Elegant Hair Studio
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-gray-900">
                        Luxury Nails Salon
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-gray-900">
                        Spa & Wellness Center
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-playfair font-bold text-gray-900">
                  Elegant Hair Studio
                </h3>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="border-none shadow-sm">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {stat.title}
                        </CardTitle>
                        <Icon className={`${stat.color} w-5 h-5`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <p className="text-xs text-green-600 font-medium">
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Ads and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Your Recent Ads */}
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Your Recent Ads</CardTitle>
                    <CardDescription className="text-gray-600">
                      Manage and view performance of your ads
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAds.map((ad) => (
                        <div
                          key={ad.id}
                          className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors gap-3"
                        >
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm md:text-base">
                                {ad.title}
                              </h4>
                              <Badge
                                className={`text-xs font-medium ${getStatusColor(
                                  ad.status
                                )}`}
                                variant="secondary"
                              >
                                {ad.status}
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600">{ad.category}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {ad.postedAt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between md:gap-6 gap-3 md:mr-4">
                            <div className="text-center">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {ad.views}
                              </p>
                              <p className="text-xs text-gray-500">views</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {ad.likes}
                              </p>
                              <p className="text-xs text-gray-500">likes</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm md:text-base font-semibold text-gray-900">
                                {ad.messages}
                              </p>
                              <p className="text-xs text-gray-500">messages</p>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-gray-200 rounded-full md:ml-2">
                            <MoreVertical size={18} className="text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <Button variant="ghost" className="w-full mt-4 text-gray-600">
                      View All Ads
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="bg-orange-50 rounded-lg p-4 md:p-6">
                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="w-full h-auto justify-start p-4 border-gray-200 hover:border-[#C8A84B] hover:bg-white bg-white"
                    >
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Pro Tip */}
                <Card className="mt-6 border-orange-200 bg-orange-100 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                      💡 Pro Tip
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-orange-800">
                      Add with more detailed descriptions and high-quality images
                      get 3x more engagement. Update your salon gallery now!
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}
