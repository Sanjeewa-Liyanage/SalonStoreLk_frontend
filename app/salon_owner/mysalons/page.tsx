"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Save } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import HeaderSalon from "@/components/HeaderSalon";
import SidebarSalon from "@/components/SidebarSalon";
import { fetchByOwner, updateSalon } from "@/lib/salonService";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

type SalonServiceItem = {
	name?: string;
	price?: number;
	duration?: number;
};

type Salon = {
	id: string;
	salonName?: string;
	name?: string;
	description?: string;
	address?: string;
	city?: string;
	phoneNumber?: string;
	openingTime?: string;
	closingTime?: string;
	status?: string;
	services?: SalonServiceItem[];
	images?: string[];
};

type SalonFormValues = {
	salonName: string;
	overview: string;
	description: string;
	address: string;
	city: string;
	phoneNumber: string;
	whatsappNumber: string;
	openingTime: string;
	closingTime: string;
	socialMedia: {
		facebook?: string;
		instagram?: string;
		tiktok?: string;
		youtube?: string;
	};
};

const EMPTY_FORM: SalonFormValues = {
	salonName: "",
	overview: "",
	description: "",
	address: "",
	city: "",
	phoneNumber: "",
	whatsappNumber: "",
	openingTime: "",
	closingTime: "",
	socialMedia: {
		facebook: "",
		instagram: "",
		tiktok: "",
		youtube: "",
	},
};

const FORM_FIELD_CLASS = "bg-white text-gray-900 placeholder:text-gray-400 border-gray-300";

function getStatusClass(status?: string): string {
	switch (status) {
		case "ACTIVE":
			return "bg-green-100 text-green-800";
		case "PENDING":
		case "PENDING_VERIFICATION":
			return "bg-yellow-100 text-yellow-800";
		case "SUSPENDED":
			return "bg-orange-100 text-orange-800";
		case "REJECTED":
			return "bg-red-100 text-red-800";
		default:
			return "bg-gray-100 text-gray-700";
	}
}

function formatTime(value?: string): string {
	if (!value) return "-";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;

	return parsed.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	});
}

export default function MySalonsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [salons, setSalons] = useState<Salon[]>([]);
	const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formValues, setFormValues] = useState<SalonFormValues>(EMPTY_FORM);

	const selectedSalon = useMemo(
		() => salons.find((salon) => salon.id === selectedSalonId) ?? null,
		[salons, selectedSalonId]
	);

	const loadOwnerSalons = async (preferredSalonId?: string) => {
		try {
			setLoading(true);
			setError(null);

			const accessToken = sessionStorage.getItem("accessToken");
			if (!accessToken) {
				setSalons([]);
				setSelectedSalonId(null);
				setFormValues(EMPTY_FORM);
				return;
			}

			const data = await fetchByOwner(accessToken);
			const salonList = Array.isArray(data) ? data : [];
			setSalons(salonList);

			if (salonList.length === 0) {
				setSelectedSalonId(null);
				setFormValues(EMPTY_FORM);
				return;
			}

			const storedSalonId = getStoredSalonId();
			const candidateId = preferredSalonId || storedSalonId;
			const validSalon = salonList.find((salon) => salon.id === candidateId);
			const nextSalonId = validSalon?.id || salonList[0].id;

			setSelectedSalonId(nextSalonId);
			setStoredSalonId(nextSalonId);
		} catch (loadError: any) {
			setError(loadError?.response?.data?.message || "Failed to load salons");
			setSalons([]);
			setSelectedSalonId(null);
			setFormValues(EMPTY_FORM);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadOwnerSalons();
	}, []);

	useEffect(() => {
		if (!selectedSalon) {
			setFormValues(EMPTY_FORM);
			return;
		}

		const contactInfo = (selectedSalon as any)?.contactInfo || {};
		const socialMediaLinks = (selectedSalon as any)?.socialMediaLinks || {};

		setFormValues({
			salonName: selectedSalon.salonName || selectedSalon.name || "",
			overview: (selectedSalon as any)?.overview || "",
			description: selectedSalon.description || "",
			address: selectedSalon.address || "",
			city: selectedSalon.city || "",
			phoneNumber: selectedSalon.phoneNumber || "",
			whatsappNumber: contactInfo?.whatsappNumber || "",
			openingTime: selectedSalon.openingTime || "",
			closingTime: selectedSalon.closingTime || "",
			socialMedia: {
				facebook: socialMediaLinks?.facebook || "",
				instagram: socialMediaLinks?.instagram || "",
				tiktok: socialMediaLinks?.tiktok || "",
				youtube: socialMediaLinks?.youtube || "",
			},
		});
	}, [selectedSalon]);

	const handleSalonChange = (salonId: string) => {
		setSelectedSalonId(salonId);
		setStoredSalonId(salonId);
	};

	const handleFieldChange = (field: keyof SalonFormValues, value: string) => {
		setFormValues((prev) => ({ ...prev, [field]: value }));
	};

	const handleUpdateSalon = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!selectedSalonId) {
			toast.error("Please select a salon first.");
			return;
		}

		const accessToken = sessionStorage.getItem("accessToken");
		if (!accessToken) {
			toast.error("You are not logged in. Please sign in again.");
			return;
		}

		try {
			setSaving(true);
			setError(null);

			const payload = {
				salonName: formValues.salonName.trim(),
				overview: formValues.overview.trim(),
				description: formValues.description.trim(),
				address: formValues.address.trim(),
				city: formValues.city.trim(),
				phoneNumber: formValues.phoneNumber.trim(),
				contactInfo: {
					phoneNumber: formValues.phoneNumber.trim(),
					whatsappNumber: formValues.whatsappNumber.trim(),
				},
				openingTime: formValues.openingTime,
				closingTime: formValues.closingTime,
				services: selectedSalon?.services || [],
				images: selectedSalon?.images || [],
				socialMediaLinks: {
					facebook: formValues.socialMedia.facebook?.trim() || undefined,
					instagram: formValues.socialMedia.instagram?.trim() || undefined,
					tiktok: formValues.socialMedia.tiktok?.trim() || undefined,
					youtube: formValues.socialMedia.youtube?.trim() || undefined,
				},
			};
			await updateSalon(selectedSalonId, payload, accessToken);
			toast.success("Salon details updated successfully.");
			await loadOwnerSalons(selectedSalonId);
		} catch (updateError: any) {
			const message = updateError?.response?.data?.message || "Failed to update salon details";
			setError(message);
			toast.error(message);
		} finally {
			setSaving(false);
		}
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
							<div className="mb-6 md:mb-8">
								<h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">My Salons</h1>
								<p className="text-gray-500 mt-1 text-sm md:text-base">
									Select a salon and update its details.
								</p>
							</div>

							<Card className="mb-6 md:mb-8 border-none shadow-sm">
								<CardHeader className="pb-3">
									<div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-0">
										<div>
											<CardTitle className="text-lg text-gray-900">CURRENT SALON</CardTitle>
											<CardDescription className="text-gray-600">
												The selected salon is shared across your owner pages
											</CardDescription>
										</div>

										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="outline"
													className="text-[#C8A84B] border-[#C8A84B] gap-2 w-full md:w-auto text-sm"
													disabled={loading || salons.length === 0}
												>
													Switch Salon
													<ChevronDown size={16} />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align="end"
												className="w-56 bg-white text-black border border-gray-200 shadow-lg"
											>
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
								<CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<h3 className="text-2xl font-playfair font-bold text-gray-900">
										{selectedSalon?.salonName || selectedSalon?.name || "No salon selected"}
									</h3>
									{selectedSalon?.status && (
										<Badge className={getStatusClass(selectedSalon.status)}>
											{selectedSalon.status}
										</Badge>
									)}
								</CardContent>
							</Card>

							{error && (
								<Card className="mb-6 border-red-200 bg-red-50">
									<CardContent className="py-4 text-sm text-red-700">{error}</CardContent>
								</Card>
							)}

							{loading ? (
								<Card className="border-none shadow-sm">
									<CardContent className="py-10 text-center text-gray-500">Loading salon details...</CardContent>
								</Card>
							) : !selectedSalon ? (
								<Card className="border-none shadow-sm">
									<CardContent className="py-10 text-center text-gray-500">
										No salons found. Register a salon from your dashboard.
									</CardContent>
								</Card>
							) : (
								<div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
									<Card className="xl:col-span-2 border-none shadow-sm">
										<CardHeader>
											<CardTitle className="text-lg text-gray-900">Update Salon Details</CardTitle>
											<CardDescription className="text-gray-600">
												Edit details for {selectedSalon.salonName || selectedSalon.name}
											</CardDescription>
										</CardHeader>
										<CardContent>
											<form onSubmit={handleUpdateSalon} className="space-y-5">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">Salon Name *</label>
														<Input
															value={formValues.salonName}
															onChange={(event) => handleFieldChange("salonName", event.target.value)}
															placeholder="Salon name"
															className={FORM_FIELD_CLASS}
															required
														/>
													</div>
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">City *</label>
														<Input
															value={formValues.city}
															onChange={(event) => handleFieldChange("city", event.target.value)}
															placeholder="City"
															className={FORM_FIELD_CLASS}
															required
														/>
													</div>
												</div>

												<div className="space-y-2">
													<label className="text-sm font-medium text-gray-700">Overview</label>
													<Input
														value={formValues.overview}
														onChange={(event) => handleFieldChange("overview", event.target.value)}
														placeholder="Premium beauty and wellness services..."
														className={FORM_FIELD_CLASS}
													/>
												</div>

												<div className="space-y-2">
													<label className="text-sm font-medium text-gray-700">Description</label>
													<Textarea
														value={formValues.description}
														onChange={(event) => handleFieldChange("description", event.target.value)}
														placeholder="Describe your salon services..."
														className={FORM_FIELD_CLASS}
														rows={4}
													/>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">Address</label>
														<Input
															value={formValues.address}
															onChange={(event) => handleFieldChange("address", event.target.value)}
															placeholder="Address"
															className={FORM_FIELD_CLASS}
															required
														/>
													</div>
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">Phone Number</label>
														<Input
															value={formValues.phoneNumber}
															onChange={(event) => handleFieldChange("phoneNumber", event.target.value)}
															placeholder="Phone number"
															className={FORM_FIELD_CLASS}
															required
														/>
													</div>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">Opening Time</label>
														<Input
															value={formValues.openingTime}
															onChange={(event) => handleFieldChange("openingTime", event.target.value)}
															placeholder="Opening time"
															className={FORM_FIELD_CLASS}
														/>
													</div>
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">Closing Time</label>
														<Input
															value={formValues.closingTime}
															onChange={(event) => handleFieldChange("closingTime", event.target.value)}
															placeholder="Closing time"
															className={FORM_FIELD_CLASS}
														/>
													</div>
												</div>

												{/* Contact Information Section */}
												<div className="bg-blue-50 p-4 rounded-lg">
													<h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
													<div className="space-y-2">
														<label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
														<Input
															value={formValues.whatsappNumber}
															onChange={(event) => {
																setFormValues(prev => ({...prev, whatsappNumber: event.target.value}));
															}}
															placeholder="+94775550011"
															className={FORM_FIELD_CLASS}
														/>
													</div>
												</div>

												{/* Social Media Links Section */}
												<div className="bg-purple-50 p-4 rounded-lg">
													<h4 className="text-sm font-semibold text-gray-900 mb-3">Social Media Links</h4>
													<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
														<div className="space-y-2">
															<label className="text-sm font-medium text-gray-700">Facebook</label>
															<Input
																value={formValues.socialMedia.facebook || ""}
																onChange={(event) => {
																	setFormValues(prev => ({
																		...prev,
																		socialMedia: {...prev.socialMedia, facebook: event.target.value}
																	}));
																}}
																placeholder="https://facebook.com/yourpage"
																className={FORM_FIELD_CLASS}
															/>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium text-gray-700">Instagram</label>
															<Input
																value={formValues.socialMedia.instagram || ""}
																onChange={(event) => {
																	setFormValues(prev => ({
																		...prev,
																		socialMedia: {...prev.socialMedia, instagram: event.target.value}
																	}));
																}}
																placeholder="https://instagram.com/yourprofile"
																className={FORM_FIELD_CLASS}
															/>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium text-gray-700">TikTok</label>
															<Input
																value={formValues.socialMedia.tiktok || ""}
																onChange={(event) => {
																	setFormValues(prev => ({
																		...prev,
																		socialMedia: {...prev.socialMedia, tiktok: event.target.value}
																	}));
																}}
																placeholder="https://tiktok.com/@yourprofile"
																className={FORM_FIELD_CLASS}
															/>
														</div>
														<div className="space-y-2">
															<label className="text-sm font-medium text-gray-700">YouTube</label>
															<Input
																value={formValues.socialMedia.youtube || ""}
																onChange={(event) => {
																	setFormValues(prev => ({
																		...prev,
																		socialMedia: {...prev.socialMedia, youtube: event.target.value}
																	}));
																}}
																placeholder="https://youtube.com/@yourchannel"
																className={FORM_FIELD_CLASS}
															/>
														</div>
													</div>
												</div>

												<Button
													type="submit"
													className="bg-[#C8A84B] hover:bg-[#B39740] text-black font-semibold w-full md:w-auto"
													disabled={saving}
												>
													<Save size={16} className="mr-2" />
													{saving ? "Updating..." : "Update Salon Details"}
												</Button>
											</form>
										</CardContent>
									</Card>

									<Card className="border-none shadow-sm">
										<CardHeader>
											<CardTitle className="text-lg text-gray-900">Selected Salon Overview</CardTitle>
											<CardDescription className="text-gray-600">
												Details currently selected from owner pages
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-4 text-sm">
											<div>
												<p className="text-gray-500">Name</p>
												<p className="font-medium text-gray-900">{selectedSalon.salonName || selectedSalon.name || "-"}</p>
											</div>
											<div>
												<p className="text-gray-500">City</p>
												<p className="font-medium text-gray-900">{selectedSalon.city || "-"}</p>
											</div>
											<div>
												<p className="text-gray-500">Phone</p>
												<p className="font-medium text-gray-900">{selectedSalon.phoneNumber || "-"}</p>
											</div>
											<div>
												<p className="text-gray-500">Address</p>
												<p className="font-medium text-gray-900">{selectedSalon.address || "-"}</p>
											</div>
											<div>
												<p className="text-gray-500">Opening</p>
												<p className="font-medium text-gray-900">{formatTime(selectedSalon.openingTime)}</p>
											</div>
											<div>
												<p className="text-gray-500">Closing</p>
												<p className="font-medium text-gray-900">{formatTime(selectedSalon.closingTime)}</p>
											</div>
										</CardContent>
									</Card>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
