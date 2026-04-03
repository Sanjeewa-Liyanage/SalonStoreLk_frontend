'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, CalendarDays, BadgeCheck, UserCircle2 } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import SidebarSalon from '@/components/SidebarSalon';
import HeaderSalon from '@/components/HeaderSalon';
import EditProfileDialogSalon, { SalonProfileFormValues } from '@/components/EditProfileDialogSalon';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/authService';

type TimestampLike =
	| string
	| number
	| Date
	| {
			_seconds?: number;
			_nanoseconds?: number;
		}
	| undefined;

interface SalonOwnerProfile {
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	role?: string;
	profilePictureUrl?: string;
	phoneNumber?: string;
	createdAt?: TimestampLike;
	updatedAt?: TimestampLike;
}

function parseProfile(payload: any): SalonOwnerProfile {
	if (!payload || typeof payload !== 'object') return {};
	if (payload.user && typeof payload.user === 'object') return payload.user as SalonOwnerProfile;
	if (payload.data && typeof payload.data === 'object') {
		if (payload.data.user && typeof payload.data.user === 'object') {
			return payload.data.user as SalonOwnerProfile;
		}
		return payload.data as SalonOwnerProfile;
	}
	return payload as SalonOwnerProfile;
}

function formatDate(value?: TimestampLike): string {
	if (!value) return '-';

	if (typeof value === 'string' || typeof value === 'number') {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString();
	}

	if (value instanceof Date) {
		return Number.isNaN(value.getTime()) ? '-' : value.toLocaleString();
	}

	if (typeof value === 'object' && value._seconds) {
		return new Date(value._seconds * 1000).toLocaleString();
	}

	return '-';
}

function formatRole(role?: string): string {
	return (role || 'SALON_OWNER').replaceAll('_', ' ');
}

export default function SalonOwnerProfilePage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [profile, setProfile] = useState<SalonOwnerProfile | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const { refreshUser } = useAuth();

	useEffect(() => {
		let mounted = true;

		const loadProfile = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await getUserProfile();
				const normalized = parseProfile(response);

				if (mounted) {
					setProfile(normalized);
				}
			} catch (err: any) {
				if (mounted) {
					setError(err?.message || 'Failed to load profile details.');
				}
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		loadProfile();

		return () => {
			mounted = false;
		};
	}, []);

	const displayName = useMemo(() => {
		if (!profile) return 'Salon Owner';
		const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
		return fullName || profile.name || 'Salon Owner';
	}, [profile]);

	const initials = useMemo(() => {
		const value = displayName
			.split(' ')
			.filter(Boolean)
			.map((item) => item[0])
			.join('')
			.toUpperCase();
		return value || 'SO';
	}, [displayName]);

	const handleProfileUpdate = async (payload: Partial<SalonProfileFormValues>) => {
		const response = await updateUserProfile(payload);
		const updated = parseProfile(response);
		setProfile((prev) => {
			const merged = { ...(prev || {}), ...payload } as SalonOwnerProfile;
			return Object.keys(updated || {}).length ? { ...merged, ...updated } : merged;
		});
		await refreshUser();
		setEditOpen(false);
	};

	return (
		<AuthGuard allowedRole="SALON_OWNER">
			<div className="flex h-screen bg-gray-50">
				<EditProfileDialogSalon
					open={editOpen}
					onClose={() => setEditOpen(false)}
					userId={profile?.id || null}
					profile={{
						firstName: profile?.firstName || '',
						lastName: profile?.lastName || '',
						phoneNumber: profile?.phoneNumber || '',
						profilePictureUrl: profile?.profilePictureUrl || '',
						email: profile?.email || '',
					}}
					onSubmit={handleProfileUpdate}
				/>
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
						<div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
								<div>
									<h1 className="text-2xl md:text-4xl font-playfair font-bold text-gray-900">My Profile</h1>
									<p className="text-gray-500 mt-1 text-sm md:text-base">View your salon owner account details.</p>
								</div>
								<button
									onClick={() => setEditOpen(true)}
									className="bg-[#C8A84B] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#b6903f] transition"
								>
									Edit Profile
								</button>
							</div>

							{loading ? (
								<div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-500">Loading profile...</div>
							) : error ? (
								<div className="bg-red-50 border border-red-200 rounded-xl p-5 text-sm text-red-700">{error}</div>
							) : (
								<>
									<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7 mb-6">
										<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
											{profile?.profilePictureUrl ? (
												<img
													src={profile.profilePictureUrl}
													alt={displayName}
													className="w-16 h-16 rounded-full object-cover border border-[#C8A84B]/40"
												/>
											) : (
												<div className="w-16 h-16 rounded-full bg-[#C8A84B]/10 text-[#C8A84B] font-bold flex items-center justify-center text-lg border border-[#C8A84B]/40">
													{initials}
												</div>
											)}

											<div>
												<h2 className="text-xl md:text-2xl font-semibold text-gray-900">{displayName}</h2>
												<p className="text-sm text-gray-500 mt-1">{profile?.email || '-'}</p>
												<span className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#C8A84B]/15 text-[#8E7327]">
													<BadgeCheck size={14} /> {formatRole(profile?.role)}
												</span>
											</div>
										</div>
									</section>

									<section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-7">
										<h3 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h3>

										<div className="divide-y divide-gray-100">
											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><UserCircle2 size={16} /> Full Name</p>
												<p className="text-sm font-medium text-gray-900">{displayName}</p>
											</div>

											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><Mail size={16} /> Email</p>
												<p className="text-sm font-medium text-gray-900">{profile?.email || '-'}</p>
											</div>

											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><Phone size={16} /> Phone Number</p>
												<p className="text-sm font-medium text-gray-900">{profile?.phoneNumber || '-'}</p>
											</div>

											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><BadgeCheck size={16} /> User ID</p>
												<p className="text-sm font-medium text-gray-900">{profile?.id || '-'}</p>
											</div>

											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><CalendarDays size={16} /> Created At</p>
												<p className="text-sm font-medium text-gray-900">{formatDate(profile?.createdAt)}</p>
											</div>

											<div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
												<p className="text-sm text-gray-500 flex items-center gap-2"><CalendarDays size={16} /> Last Updated</p>
												<p className="text-sm font-medium text-gray-900">{formatDate(profile?.updatedAt)}</p>
											</div>
										</div>
									</section>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</AuthGuard>
	);
}
