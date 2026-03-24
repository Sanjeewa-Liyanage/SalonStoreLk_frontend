"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Clock3, ImageOff, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import HeaderSalon from "@/components/HeaderSalon";
import SidebarSalon from "@/components/SidebarSalon";
import { fetchByOwner } from "@/lib/salonService";
import { adsBySalon } from "@/lib/adsService";
import { getStoredSalonId, setStoredSalonId } from "@/lib/salonSelection";
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

type FirestoreTimestamp = {
	_seconds?: number;
	_nanoseconds?: number;
};

type SalonAd = {
	id: string;
	title: string;
	description?: string;
	imageUrl?: string[];
	status?: string;
	startDate?: FirestoreTimestamp;
	endDate?: FirestoreTimestamp;
	approvalDate?: FirestoreTimestamp;
	rejectionReason?: string;
	paymentStatus?: string;
};

function formatTimestamp(value?: FirestoreTimestamp): string {
	if (!value?._seconds) return "-";
	return new Date(value._seconds * 1000).toLocaleDateString();
}

function getStatusClass(status?: string): string {
	switch (status) {
		case "APPROVED":
			return "bg-green-100 text-green-800";
		case "REJECTED":
			return "bg-red-100 text-red-800";
		case "PENDING":
			return "bg-yellow-100 text-yellow-800";
		default:
			return "bg-gray-100 text-gray-700";
	}
}

export default function MyAdsPage() {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [salons, setSalons] = useState<any[]>([]);
	const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
	const [ads, setAds] = useState<SalonAd[]>([]);
	const [salonLoading, setSalonLoading] = useState(true);
	const [adsLoading, setAdsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const selectedSalon = useMemo(
		() => salons.find((salon) => salon.id === selectedSalonId),
		[salons, selectedSalonId]
	);

	useEffect(() => {
		const loadOwnerSalons = async () => {
			try {
				const accessToken = sessionStorage.getItem("accessToken");
				if (!accessToken) {
					setSalons([]);
					return;
				}

				const data = await fetchByOwner(accessToken);
				const salonList = Array.isArray(data) ? data : [];
				setSalons(salonList);

				if (salonList.length > 0) {
					const storedSalonId = getStoredSalonId();
					const validSalon = salonList.find((salon: any) => salon.id === storedSalonId);
					const nextSalonId = validSalon?.id || salonList[0].id;
					setSelectedSalonId(nextSalonId);
					setStoredSalonId(nextSalonId);
				}
			} catch (loadError: any) {
				setError(loadError?.response?.data?.message || "Failed to load salons");
			} finally {
				setSalonLoading(false);
			}
		};

		loadOwnerSalons();
	}, []);

	useEffect(() => {
		const loadAds = async () => {
			if (!selectedSalonId) {
				setAds([]);
				return;
			}

			try {
				setAdsLoading(true);
				setError(null);

				const accessToken = sessionStorage.getItem("accessToken") || "";
				const result = await adsBySalon(selectedSalonId, accessToken);
				const adList = Array.isArray(result) ? result : result?.data || [];
				setAds(adList);
			} catch (adsError: any) {
				setError(adsError?.response?.data?.message || "Failed to load ads");
				setAds([]);
			} finally {
				setAdsLoading(false);
			}
		};

		loadAds();
	}, [selectedSalonId]);

	const handleSalonChange = (salonId: string) => {
		setSelectedSalonId(salonId);
		setStoredSalonId(salonId);
	};

	return (
		<AuthGuard allowedRole="SALON_OWNER">
			<div className="flex h-screen bg-gray-50">
				<div className="hidden md:block">
					<SidebarSalon />
				</div>

				{sidebarOpen && (
					<div className="fixed inset-0 z-40 md:hidden">
						<div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
						<div className="absolute inset-y-0 left-0 w-64 z-50">
							<SidebarSalon />
						</div>
					</div>
				)}

				<div className="flex-1 flex flex-col overflow-hidden">
					<HeaderSalon sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

					<div className="flex-1 overflow-auto">
						<div className="p-4 md:p-8">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
								<div>
									<h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">My Ads</h1>
									<p className="text-gray-500 mt-1 text-sm md:text-base">
										Track your ad approvals, durations, and current status
									</p>
								</div>
								<Button
									className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold text-sm md:text-base w-full md:w-auto"
									onClick={() => router.push("/salon_owner/myads/create")}
								>
									<Plus size={16} className="mr-2" />
									Create Ad
								</Button>
							</div>

							<Card className="mb-6 md:mb-8 border-none shadow-sm">
								<CardHeader className="pb-3">
									<div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
										<div>
											<CardTitle className="text-lg text-gray-900">CURRENT SALON</CardTitle>
											<CardDescription className="text-gray-600">
												Choose a salon to view only its ads
											</CardDescription>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="text-[#C8A84B] border-[#C8A84B] gap-2 w-full md:w-auto text-sm"
													disabled={salonLoading || salons.length === 0}
												>
													Switch Salon
													<ChevronDown size={16} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-56 bg-white text-black border border-gray-200 shadow-lg">
												{salons.length > 0 ? (
													salons.map((salon) => (
														<DropdownMenuItem
															key={salon.id}
															className="cursor-pointer text-gray-900"
															onClick={() => handleSalonChange(salon.id)}
														>
															{salon.salonName || salon.name}
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
										{selectedSalon?.salonName || selectedSalon?.name || "No salon selected"}
									</h3>
								</CardContent>
							</Card>

							{error && (
								<Card className="mb-6 border-red-200 bg-red-50">
									<CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
								</Card>
							)}

							{adsLoading ? (
								<Card className="border-none shadow-sm">
									<CardContent className="py-10 text-center text-gray-500">Loading ads...</CardContent>
								</Card>
							) : ads.length === 0 ? (
								<Card className="border-none shadow-sm">
									<CardContent className="py-10 text-center text-gray-500">
										No ads found for this salon.
									</CardContent>
								</Card>
							) : (
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
									{ads.map((ad) => {
										const image = ad.imageUrl?.[0];

										return (
											<Card key={ad.id} className="border-none shadow-sm overflow-hidden">
												<div className="relative h-44 w-full bg-gray-100">
													{image ? (
														<img src={image} alt={ad.title} className="h-full w-full object-cover" />
													) : (
														<div className="h-full w-full flex items-center justify-center text-gray-400">
															<ImageOff size={24} />
														</div>
													)}
													<div className="absolute top-3 right-3">
														<Badge className={getStatusClass(ad.status)}>{ad.status || "UNKNOWN"}</Badge>
													</div>
												</div>

												<CardContent className="p-4 md:p-5">
													<h3 className="font-semibold text-gray-900 text-base md:text-lg line-clamp-2">
														{ad.title}
													</h3>

													<p className="text-sm text-gray-600 mt-2 line-clamp-3">
														{ad.description || "No description provided"}
													</p>

													<div className="mt-4 grid grid-cols-2 gap-3 text-xs md:text-sm text-gray-600">
														<div className="flex items-center gap-2">
															<CalendarDays size={14} className="text-[#C8A84B]" />
															<span>Start: {formatTimestamp(ad.startDate)}</span>
														</div>
														<div className="flex items-center gap-2">
															<Clock3 size={14} className="text-[#C8A84B]" />
															<span>End: {formatTimestamp(ad.endDate)}</span>
														</div>
													</div>

													<div className="mt-3 flex flex-wrap items-center gap-2">
														<Badge variant="secondary" className="bg-blue-100 text-blue-800">
															Payment: {ad.paymentStatus || "UNKNOWN"}
														</Badge>
														{ad.approvalDate && (
															<Badge variant="secondary" className="bg-gray-100 text-gray-700">
																Approved: {formatTimestamp(ad.approvalDate)}
															</Badge>
														)}
													</div>

													{ad.status === "REJECTED" && ad.rejectionReason && (
														<div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
															Rejection reason: {ad.rejectionReason}
														</div>
													)}
												</CardContent>
											</Card>
										);
									})}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
