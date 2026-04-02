'use client';

import { useEffect, useMemo, useState } from 'react';
import {
	Avatar,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Divider,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import {
	AlternateEmail as EmailIcon,
	Badge as BadgeIcon,
	CalendarMonth as CalendarIcon,
	Call as PhoneIcon,
	Person as PersonIcon,
	Shield as ShieldIcon,
} from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import AuthGuard from '@/components/AuthGuard';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { getUserProfile } from '@/lib/authService';

type TimestampLike =
	| string
	| number
	| Date
	| {
			_seconds?: number;
			_nanoseconds?: number;
		}
	| undefined;

interface AdminProfile {
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	role?: string;
	avatarUrl?: string;
	phoneNumber?: string;
	createdAt?: TimestampLike;
	updatedAt?: TimestampLike;
}

function extractProfile(payload: any): AdminProfile {
	if (!payload || typeof payload !== 'object') {
		return {};
	}

	if (payload.user && typeof payload.user === 'object') {
		return payload.user as AdminProfile;
	}

	if (payload.data && typeof payload.data === 'object') {
		if (payload.data.user && typeof payload.data.user === 'object') {
			return payload.data.user as AdminProfile;
		}

		return payload.data as AdminProfile;
	}

	return payload as AdminProfile;
}

function formatDate(value?: TimestampLike): string {
	if (!value) return '-';

	if (typeof value === 'string' || typeof value === 'number') {
		const date = new Date(value);
		return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString();
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
	if (!role) return 'ADMIN';
	return role.replaceAll('_', ' ');
}

export default function AdminProfilePage() {
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	const [profile, setProfile] = useState<AdminProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;

		const loadProfile = async () => {
			try {
				setLoading(true);
				setError(null);
				const response = await getUserProfile();
				const normalized = extractProfile(response);

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
		if (!profile) return 'Admin User';
		const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
		return fullName || profile.name || 'Admin User';
	}, [profile]);

	const initials = useMemo(() => {
		const chars = displayName
			.split(' ')
			.filter(Boolean)
			.map((part) => part[0])
			.join('')
			.toUpperCase();
		return chars || 'AD';
	}, [displayName]);

	return (
		<AuthGuard allowedRole="ADMIN">
			<Box
				sx={{
					display: 'flex',
					minHeight: '100vh',
					backgroundColor: isDark ? '#0d0f1a' : '#f9fafb',
				}}
			>
				{!isMobile && <Sidebar />}

				<Box
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						width: { xs: '100%', md: 'calc(100% - 280px)' },
					}}
				>
					<HeaderAdmin pageTitle="My Profile" pageSubtitle="View your account details." />

					<Box
						component="main"
						sx={{
							flex: 1,
							overflow: 'auto',
							backgroundColor: isDark ? '#0d0f1a' : '#f9fafb',
						}}
					>
						<Container
							maxWidth={false}
							sx={{
								py: 3,
								px: { xs: 2, sm: 3, md: 4 },
								maxWidth: 1100,
							}}
						>
							{loading ? (
								<Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
									<CircularProgress />
								</Box>
							) : error ? (
								<Card
									sx={{
										borderRadius: '14px',
										border: `1px solid ${isDark ? '#3b1f27' : '#ffe4e6'}`,
										backgroundColor: isDark ? '#22131a' : '#fff1f2',
									}}
								>
									<CardContent>
										<Typography sx={{ color: isDark ? '#fecdd3' : '#be123c', fontWeight: 600 }}>
											{error}
										</Typography>
									</CardContent>
								</Card>
							) : (
								<Stack spacing={3}>
									<Card
										sx={{
											borderRadius: '16px',
											border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
											background: isDark
												? 'linear-gradient(140deg, #141828 0%, #101423 100%)'
												: 'linear-gradient(140deg, #ffffff 0%, #f8faff 100%)',
										}}
									>
										<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
											<Stack
												direction={{ xs: 'column', sm: 'row' }}
												spacing={2}
												justifyContent="space-between"
												alignItems={{ xs: 'flex-start', sm: 'center' }}
											>
												<Stack direction="row" spacing={2} alignItems="center">
													<Avatar
														src={profile?.avatarUrl || ''}
														sx={{
															width: 64,
															height: 64,
															fontSize: '1.25rem',
															fontWeight: 700,
															background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
														}}
													>
														{!profile?.avatarUrl && initials}
													</Avatar>

													<Box>
														<Typography
															variant="h5"
															sx={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}
														>
															{displayName}
														</Typography>
														<Typography
															variant="body2"
															sx={{ mt: 0.4, color: isDark ? '#94a3b8' : '#64748b' }}
														>
															{profile?.email || '-'}
														</Typography>
														<Chip
															size="small"
															icon={<ShieldIcon />}
															label={formatRole(profile?.role)}
															sx={{
																mt: 1.2,
																fontWeight: 600,
																backgroundColor: isDark ? 'rgba(167, 139, 250, 0.18)' : '#ede9fe',
																color: '#7c3aed',
															}}
														/>
													</Box>
												</Stack>

												<Button
													variant="outlined"
													disabled
													sx={{
														textTransform: 'none',
														borderRadius: '10px',
														borderColor: isDark ? '#2f3557' : '#d5dbeb',
														color: isDark ? '#94a3b8' : '#64748b',
													}}
												>
													Edit Profile (Coming Soon)
												</Button>
											</Stack>
										</CardContent>
									</Card>

									<Card
										sx={{
											borderRadius: '16px',
											border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
											backgroundColor: isDark ? '#141828' : '#ffffff',
										}}
									>
										<CardContent sx={{ p: { xs: 2, sm: 3 } }}>
											<Typography
												variant="h6"
												sx={{ fontWeight: 700, color: isDark ? '#f1f5f9' : '#1a1d2e', mb: 2 }}
											>
												Account Details
											</Typography>

											<Stack divider={<Divider flexItem sx={{ borderColor: isDark ? '#1e2440' : '#eef2ff' }} />}>
												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<PersonIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>Full Name</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{displayName}
													</Typography>
												</Stack>

												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<EmailIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>Email</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{profile?.email || '-'}
													</Typography>
												</Stack>

												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<PhoneIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>Phone Number</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{profile?.phoneNumber || '-'}
													</Typography>
												</Stack>

												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<BadgeIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>User ID</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{profile?.id || '-'}
													</Typography>
												</Stack>

												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<CalendarIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>Created At</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{formatDate(profile?.createdAt)}
													</Typography>
												</Stack>

												<Stack
													direction={{ xs: 'column', sm: 'row' }}
													alignItems={{ xs: 'flex-start', sm: 'center' }}
													justifyContent="space-between"
													spacing={1}
													sx={{ py: 1.5 }}
												>
													<Stack direction="row" spacing={1.2} alignItems="center">
														<CalendarIcon sx={{ color: isDark ? '#94a3b8' : '#64748b' }} fontSize="small" />
														<Typography sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>Last Updated</Typography>
													</Stack>
													<Typography sx={{ fontWeight: 600, color: isDark ? '#f8fafc' : '#0f172a' }}>
														{formatDate(profile?.updatedAt)}
													</Typography>
												</Stack>
											</Stack>
										</CardContent>
									</Card>
								</Stack>
							)}
						</Container>
					</Box>
				</Box>
			</Box>
		</AuthGuard>
	);
}
