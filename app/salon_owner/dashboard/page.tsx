"use client";

import React, { useState, useEffect } from "react";
import SidebarSalon from "@/components/SidebarSalon";
import HeaderSalon from "@/components/HeaderSalon";
import Link from "next/link";
import {
  Building2,
  ChevronDown,
  Clock3,
  Megaphone,
  Receipt,
  Store,
} from "lucide-react";
import { fetchByOwner } from "@/lib/salonService";
import { salonOwnerDashboardRequest } from "@/lib/dashboardService";
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
import { useAppSelector } from "@/lib/store/hooks";
import AddSalonDialog from "@/components/AddSalonDialog";
import { getStoredSalonId, setStoredSalonId } from "@/lib/salonSelection";

type ActivityTab = "salons" | "ads" | "payments";

export default function SalonDashboard() {
  const [salons, setSalons] = useState<any[]>([]);
  const [currentSalonId, setCurrentSalonId] = useState<string | null>(null);
  const [salonsLoading, setSalonsLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [activityTab, setActivityTab] = useState<ActivityTab>("salons");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const parseSalonList = (payload: any) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.salons)) return payload.salons;
    if (Array.isArray(payload?.data?.salons)) return payload.data.salons;
    return [];
  };

  const loadSalons = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setSalons([]);
        return;
      }

      if (accessToken) {
        const data = await fetchByOwner(accessToken);
        const list = parseSalonList(data);
        setSalons(list);

        if (list.length > 0) {
          const storedSalonId = getStoredSalonId();
          const selectedSalon = list.find((salon: any) => salon.id === storedSalonId) || list[0];
          setCurrentSalonId(selectedSalon.id);
          setStoredSalonId(selectedSalon.id);
        } else {
          setCurrentSalonId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
    } finally {
      setSalonsLoading(false);
    }
  };

  const loadOverview = async () => {
    try {
      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setOverview(null);
        return;
      }

      const response = await salonOwnerDashboardRequest(accessToken);
      if (response?.success && response?.data) {
        const normalizedData = response.data.data ? response.data.data : response.data;
        setOverview(normalizedData);
      } else {
        setOverview(null);
      }
    } catch (error: any) {
      console.error("Error fetching salon owner dashboard overview:", error);
      setOverviewError(error?.message || "Failed to load dashboard overview");
    } finally {
      setOverviewLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
    loadOverview();
  }, []);

  const currentSalon = salons.find((salon) => salon.id === currentSalonId);
  const currentSalonName =
    currentSalon?.salonName || currentSalon?.name || (salonsLoading ? "Loading salon..." : "No salon selected");
  const currentSalonLocation =
    currentSalon?.city ||
    currentSalon?.location ||
    currentSalon?.district ||
    (salonsLoading ? "Loading location..." : salons.length > 0 ? "Location not available" : "No salons available");

  const kpis = overview?.kpis;
  const adsBySalon = overview?.charts?.adsBySalon || [];
  const recentActivity = overview?.recentActivity || {};

  const stats = [
    {
      title: "TOTAL SALONS",
      value: kpis?.salons?.total ?? 0,
      helper: `${kpis?.salons?.active ?? 0} active`,
      icon: Store,
      color: "text-amber-600",
    },
    {
      title: "ACTIVE ADS",
      value: kpis?.ads?.activeApproved ?? 0,
      helper: `${kpis?.ads?.total ?? 0} total ads`,
      icon: Megaphone,
      color: "text-emerald-600",
    },
    {
      title: "PENDING AD APPROVALS",
      value: kpis?.ads?.pendingApproval ?? 0,
      helper: `${kpis?.ads?.rejected ?? 0} rejected`,
      icon: Clock3,
      color: "text-blue-600",
    },
    {
      title: "PENDING PAYMENTS",
      value: kpis?.payments?.pendingVerification ?? 0,
      helper: `${kpis?.payments?.rejected ?? 0} rejected payments`,
      icon: Receipt,
      color: "text-purple-600",
    },
  ];

  const quickActions = [
    {
      id: 1,
      title: "Register New Salon",
      description: "Create a new salon profile",
      type: "dialog" as const,
    },
    {
      id: 2,
      title: "Create New Ad",
      description: "Post a new ad for your salon",
      href: "/salon_owner/myads",
      type: "link" as const,
    },
    {
      id: 3,
      title: "View My Ads",
      description: "Manage active and pending ads",
      href: "/salon_owner/myads",
      type: "link" as const,
    },
    {
      id: 4,
      title: "Salon Settings",
      description: "Update your salon information",
      href: "/salon_owner/mysalons",
      type: "link" as const,
    },
    {
      id: 5,
      title: "Help & Support",
      description: "Get assistance when needed",
      href: "/salon_owner/dashboard",
      type: "link" as const,
    },
  ];

  const handleSalonChange = (salonId: string) => {
    setCurrentSalonId(salonId);
    setStoredSalonId(salonId);
  };

  const getStatusColor = (status?: string) => {
    switch ((status || "").toUpperCase()) {
      case "ACTIVE":
      case "APPROVED":
      case "VERIFIED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "DRAFT":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getReadableDateTime = (dateValue?: string) => {
    if (!dateValue) return "N/A";
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return "N/A";
    return parsed.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getReadableMethod = (method?: string) => {
    if (!method) return "Payment";
    return method
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const maxAdsCount = Math.max(...adsBySalon.map((item: any) => item.count || 0), 1);

  const activityItems =
    activityTab === "salons"
      ? recentActivity?.salons || []
      : activityTab === "ads"
      ? recentActivity?.ads || []
      : recentActivity?.payments || [];

  const isPageLoading = salonsLoading || overviewLoading;

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
                  Welcome back, {user?.firstName || user?.name || "User"}
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">
                  Manage your salons and ads in one place
                </p>
              </div>
              <Button
                onClick={() => setDialogOpen(true)}
                className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold text-sm md:text-base w-full md:w-auto"
              >
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
                      {currentSalonLocation}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={salonsLoading || salons.length === 0}
                        className="text-[#C8A84B] border-[#C8A84B] gap-2 w-full md:w-auto text-sm"
                      >
                        Switch Salon
                        <ChevronDown size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white text-black border border-gray-200 shadow-lg">
                      {salonsLoading ? (
                        <DropdownMenuItem disabled className="text-gray-500">
                          Loading salons...
                        </DropdownMenuItem>
                      ) : salons.length > 0 ? (
                        salons.map((salon) => (
                          <DropdownMenuItem
                            key={salon.id}
                            className="cursor-pointer text-gray-900"
                            onClick={() => handleSalonChange(salon.id)}
                          >
                            {salon.salonName}
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <DropdownMenuItem disabled className="text-gray-500">
                          No salons available
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="text-2xl font-playfair font-bold text-gray-900">
                  {currentSalonName}
                </h3>
              </CardContent>
            </Card>

            {overviewError && (
              <Card className="mb-6 md:mb-8 border border-red-200 bg-red-50 shadow-none">
                <CardContent className="pt-6">
                  <p className="text-sm text-red-700">{overviewError}</p>
                </CardContent>
              </Card>
            )}

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
                        {isPageLoading ? "..." : stat.value}
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {stat.helper}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Business Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Ads by Salon</CardTitle>
                    <CardDescription className="text-gray-600">
                      Simple distribution of your ads across salons
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overviewLoading ? (
                      <p className="text-sm text-gray-500">Loading ad distribution...</p>
                    ) : adsBySalon.length === 0 ? (
                      <p className="text-sm text-gray-500">No ad distribution data available yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {adsBySalon
                          .slice()
                          .sort((a: any, b: any) => (b.count || 0) - (a.count || 0))
                          .map((item: any, index: number) => {
                            const percent = ((item.count || 0) / maxAdsCount) * 100;
                            const isSelectedSalon = currentSalonName !== "No salon selected" && item.salonName === currentSalonName;

                            return (
                              <div key={`${item.salonName}-${index}`} className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-800 flex items-center gap-2">
                                    <span>{item.salonName}</span>
                                    {isSelectedSalon && (
                                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-[10px] uppercase tracking-wide">
                                        Selected
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">{item.count || 0} ads</p>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                                  <div
                                    className="h-full bg-[#C8A84B] rounded-full"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900">Status Summary</CardTitle>
                  <CardDescription className="text-gray-600">
                    Quick health snapshot for salons, ads, and payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Salons</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active {kpis?.salons?.active ?? 0}</Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending {kpis?.salons?.pendingVerification ?? 0}</Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Suspended {kpis?.salons?.suspended ?? 0}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ads</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Active {kpis?.ads?.activeApproved ?? 0}</Badge>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending {kpis?.ads?.pendingApproval ?? 0}</Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected {kpis?.ads?.rejected ?? 0}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payments</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending {kpis?.payments?.pendingVerification ?? 0}</Badge>
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Rejected {kpis?.payments?.rejected ?? 0}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900">Recent Activity</CardTitle>
                    <CardDescription className="text-gray-600">
                      Latest updates from your salons, ads, and payments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {([
                        { key: "salons", label: "Salons" },
                        { key: "ads", label: "Ads" },
                        { key: "payments", label: "Payments" },
                      ] as { key: ActivityTab; label: string }[]).map((tab) => (
                        <Button
                          key={tab.key}
                          variant={activityTab === tab.key ? "default" : "outline"}
                          size="sm"
                          className={
                            activityTab === tab.key
                              ? "bg-[#C8A84B] hover:bg-[#B39740] text-black"
                              : "text-gray-700"
                          }
                          onClick={() => setActivityTab(tab.key)}
                        >
                          {tab.label}
                        </Button>
                      ))}
                    </div>

                    {overviewLoading ? (
                      <p className="text-sm text-gray-500">Loading recent activity...</p>
                    ) : activityItems.length === 0 ? (
                      <p className="text-sm text-gray-500">No recent {activityTab} activity yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {activityItems.map((item: any) => {
                          const title =
                            activityTab === "salons"
                              ? item.salonName || "Salon"
                              : activityTab === "ads"
                              ? item.title || item.salonName || "Ad"
                              : getReadableMethod(item.method);
                          const subtitle =
                            activityTab === "salons"
                              ? "Salon update"
                              : activityTab === "ads"
                              ? `Salon: ${item.salonName || "N/A"}`
                              : "Payment update";

                          return (
                            <div
                              key={item.id}
                              className="flex items-start justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors gap-3"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900 text-sm md:text-base">{title}</p>
                                  <Badge
                                    className={`text-xs font-medium ${getStatusColor(item.status)}`}
                                    variant="secondary"
                                  >
                                    {item.status || "UPDATED"}
                                  </Badge>
                                </div>
                                <p className="text-xs md:text-sm text-gray-600">{subtitle}</p>
                              </div>
                              <p className="text-xs text-gray-500 whitespace-nowrap">
                                {getReadableDateTime(item.createdAt)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                    action.type === "dialog" ? (
                      <Button
                        key={action.id}
                        variant="outline"
                        onClick={() => setDialogOpen(true)}
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
                    ) : (
                      <Button
                        key={action.id}
                        variant="outline"
                        asChild
                        className="w-full h-auto justify-start p-4 border-gray-200 hover:border-[#C8A84B] hover:bg-white bg-white"
                      >
                        <Link href={action.href || "/salon_owner/dashboard"}>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900 text-sm">
                              {action.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {action.description}
                            </p>
                          </div>
                        </Link>
                      </Button>
                    )
                  ))}
                </div>

                <Card className="mt-6 border-orange-200 bg-orange-100 shadow-none">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-orange-900">
                      <Building2 className="w-4 h-4" /> Owner Insight
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-orange-800">
                      {kpis?.ads?.pendingApproval || kpis?.payments?.pendingVerification
                        ? `You have ${(kpis?.ads?.pendingApproval || 0) + (kpis?.payments?.pendingVerification || 0)} pending ad/payment checks. Keep them up to date for smoother operations.`
                        : "No pending approvals right now. Keep your salon and ads refreshed to maintain visibility."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <AddSalonDialog 
      open={dialogOpen} 
      onOpenChange={setDialogOpen} 
      onSuccess={() => loadSalons()} 
    />
    </AuthGuard>
  );
}
