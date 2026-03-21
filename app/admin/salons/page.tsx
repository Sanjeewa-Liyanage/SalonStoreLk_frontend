'use client';

import { type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	InputAdornment,
	Pagination,
	Stack,
	Tab,
	Tabs,
	TextField,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import {
	CheckCircleOutline as CheckCircleOutlineIcon,
	PendingActions as PendingActionsIcon,
	Search as SearchIcon,
	Storefront as StorefrontIcon,
} from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import { useMuiTheme } from '@/context/MuiThemeContext';
import {
	fetchAllSalons,
	fetchActiveSalons,
	fetchPendingSalons,
	activateSalon,
} from '@/lib/salonService';
import SalonLoader from '@/components/Loader';

interface Salon {
	id: string;
	salonCode: string;
	salonName: string;
	description: string;
	address: string;
	city: string;
	phoneNumber: string;
	status: string;
	isActive: boolean;
	ownerId: string;
	createdAt?: {
		_seconds: number;
		_nanoseconds: number;
	};
}
type SalonTab = 'all' | 'active' | 'pending';

const normalizeSalonTab = (value: string | null): SalonTab => {
	if (value === 'active' || value === 'pending' || value === 'all') return value;
	return 'all';
};

interface SalonApiResponse {
	data: Salon[];
	pagination?: {
		page: number;
		limit: number;
		hasNext: boolean;
	};
}

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	const normalized = status.toUpperCase();
	if (normalized === 'ACTIVE') return 'success';
	if (normalized.includes('PENDING')) return 'warning';
	if (normalized.includes('INACTIVE')) return 'error';
	return 'default';
};

const formatDate = (createdAt?: Salon['createdAt']) => {
	if (!createdAt?._seconds) return '-';
	return new Date(createdAt._seconds * 1000).toLocaleDateString();
};

export default function AdminSalonsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	const [salons, setSalons] = useState<Salon[]>([]);
	const [activeSalons, setActiveSalons] = useState<Salon[]>([]);
	const [pendingSalons, setPendingSalons] = useState<Salon[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [activePage, setActivePage] = useState(1);
	const [pendingPage, setPendingPage] = useState(1);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const rowsPerPage = 8;
	const activeTab = normalizeSalonTab(searchParams.get('tab'));


	useEffect(() => {
		const loadSalons = async () => {
			setLoading(true);
			setError('');

			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
				if (!token) {
					throw new Error('No access token found. Please login again.');
				}

				if (activeTab === 'pending') {
					const payload = await fetchPendingSalons(token);
					setPendingSalons(payload.data || []);
				} else if (activeTab === 'active') {
					// Fetch all salons and filter for active ones
					const payload = await fetchAllSalons(token);
					const allSalons = payload.data || [];
					const filtered = allSalons.filter((salon: { status: string; }) => salon.status.toUpperCase() === 'ACTIVE');
					setActiveSalons(filtered);
				} else {
					// Fetch all and pending counts for the top cards
					const [allPayload, pendingPayload] = await Promise.all([
						fetchAllSalons(token),
						fetchPendingSalons(token),
					]);
					setSalons(allPayload.data || []);
					setPendingSalons(pendingPayload.data || []);
				}
			} catch (fetchError) {
				setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong');
			} finally {
				setLoading(false);
			}
		};

		loadSalons();
	}, [activeTab]);

	const counts = useMemo(() => {
		const total = salons.length;
		const active = salons.filter((salon) => salon.status.toUpperCase() === 'ACTIVE').length;
		const pending = pendingSalons.length;
		return { total, active, pending };
	}, [salons, pendingSalons]);

	const filteredSalons = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return salons;

		return salons.filter((salon) =>
			salon.salonName.toLowerCase().includes(query) ||
			salon.salonCode.toLowerCase().includes(query) ||
			salon.city.toLowerCase().includes(query) ||
			salon.phoneNumber.toLowerCase().includes(query)
		);
	}, [salons, search]);

	const filteredActiveSalons = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return activeSalons;

		return activeSalons.filter((salon) =>
			salon.salonName.toLowerCase().includes(query) ||
			salon.salonCode.toLowerCase().includes(query) ||
			salon.city.toLowerCase().includes(query) ||
			salon.phoneNumber.toLowerCase().includes(query)
		);
	}, [activeSalons, search]);

	const filteredPendingSalons = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return pendingSalons;

		return pendingSalons.filter((salon) =>
			salon.salonName.toLowerCase().includes(query) ||
			salon.salonCode.toLowerCase().includes(query) ||
			salon.city.toLowerCase().includes(query) ||
			salon.phoneNumber.toLowerCase().includes(query)
		);
	}, [pendingSalons, search]);

	const totalPages = Math.max(1, Math.ceil(filteredSalons.length / rowsPerPage));
	const paginatedSalons = filteredSalons.slice((page - 1) * rowsPerPage, page * rowsPerPage);

	const totalActivePages = Math.max(1, Math.ceil(filteredActiveSalons.length / rowsPerPage));
	const paginatedActiveSalons = filteredActiveSalons.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage);

	const totalPendingPages = Math.max(1, Math.ceil(filteredPendingSalons.length / rowsPerPage));
	const paginatedPendingSalons = filteredPendingSalons.slice(
		(pendingPage - 1) * rowsPerPage,
		pendingPage * rowsPerPage
	);

	useEffect(() => {
		setPage(1);
		setActivePage(1);
		setSearch('');
	}, []);

	

	const handleTabChange = (_: SyntheticEvent, value: SalonTab) => {
		setPage(1);
		setActivePage(1);
		setPendingPage(1);
		const href = value === 'all' ? '/admin/salons' : `/admin/salons?tab=${value}`;
		router.push(href, { scroll: false });
	};

	const handleApprove = async (salonId: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');
			
			await activateSalon(salonId, token);
			
			// Remove the approved salon from the pending list
			setPendingSalons((prev) => prev.filter((s) => s.id !== salonId));
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to approve salon.');
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (salonId: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');
			
			// TODO: Implement reject/deny endpoint in backend and add service function
			// For now, just remove from pending list
			setPendingSalons((prev) => prev.filter((s) => s.id !== salonId));
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to reject salon.');
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
					backgroundColor: isDark ? '#0d0f1a' : '#f9fafb',
				}}
			>
				<SalonLoader />
			</Box>
		);
	}

	return (
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
				<HeaderAdmin
					pageTitle="Salons"
					pageSubtitle="Manage all salons and review verification status."
				/>

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
						}}
					>
						<Stack spacing={3}>
							<Box
								sx={{
									display: 'grid',
									gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' },
									gap: 2,
								}}
							>
								<Card
									sx={{
										borderRadius: '12px',
										backgroundColor: isDark ? '#141828' : '#ffffff',
										border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Box>
												<Typography sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }} variant="body2">
													Total Salons
												</Typography>
												<Typography sx={{ fontWeight: 700 }} variant="h5">
													{counts.total}
												</Typography>
											</Box>
											<StorefrontIcon sx={{ color: '#a78bfa' }} />
										</Stack>
									</CardContent>
								</Card>

								<Card
									sx={{
										borderRadius: '12px',
										backgroundColor: isDark ? '#141828' : '#ffffff',
										border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Box>
												<Typography sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }} variant="body2">
													Active Salons
												</Typography>
												<Typography sx={{ fontWeight: 700 }} variant="h5">
													{counts.active}
												</Typography>
											</Box>
											<CheckCircleOutlineIcon sx={{ color: '#10b981' }} />
										</Stack>
									</CardContent>
								</Card>

								<Card
									sx={{
										borderRadius: '12px',
										backgroundColor: isDark ? '#141828' : '#ffffff',
										border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
									}}
								>
									<CardContent>
										<Stack direction="row" alignItems="center" justifyContent="space-between">
											<Box>
												<Typography sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }} variant="body2">
													Pending Approval
												</Typography>
												<Typography sx={{ fontWeight: 700 }} variant="h5">
													{counts.pending}
												</Typography>
											</Box>
											<PendingActionsIcon sx={{ color: '#f59e0b' }} />
										</Stack>
									</CardContent>
								</Card>
							</Box>

							<Card
								sx={{
									borderRadius: '12px',
									backgroundColor: isDark ? '#141828' : '#ffffff',
									border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
								}}
							>
								<Box
									sx={{
										borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
										px: 2,
									}}
								>
									<Tabs
										value={activeTab}
										onChange={handleTabChange}
										sx={{
											'& .MuiTabs-indicator': {
												backgroundColor: '#a78bfa',
											},
										}}
									>
										<Tab
											value="all"
											label="All Salons"
											sx={{ textTransform: 'none', fontWeight: 600 }}
										/>
										<Tab
											value="active"
											label="Active Salons"
											sx={{ textTransform: 'none', fontWeight: 600 }}
										/>
										<Tab
											value="pending"
											label="Pending Approval"
											sx={{ textTransform: 'none', fontWeight: 600 }}
										/>
									</Tabs>
								</Box>

								<CardContent>
									{activeTab === 'all' && (
										<Stack spacing={2}>
											<TextField
												placeholder="Search by salon name, code, city, or phone number"
												value={search}
												onChange={(event) => setSearch(event.target.value)}
												size="small"
												fullWidth
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<SearchIcon
																sx={{ fontSize: '1rem', color: isDark ? '#6b7a99' : '#94a3b8' }}
															/>
														</InputAdornment>
													),
												}}
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
														backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
														'& fieldset': {
															borderColor: isDark ? '#1e2440' : '#eaecf5',
														},
													},
												}}
											/>

											{error && <Alert severity="error">{error}</Alert>}

											{!loading && !error && paginatedSalons.length === 0 && (
												<Alert severity="info">No salons found for your search.</Alert>
											)}

											<Box
												sx={{
													overflowX: 'auto',
													borderRadius: '10px',
													border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
												}}
											>
												<Box
													component="table"
													sx={{
														width: '100%',
														borderCollapse: 'collapse',
														minWidth: 920,
													}}
												>
													<Box
														component="thead"
														sx={{ backgroundColor: isDark ? '#0f1322' : '#f8fafc' }}
													>
														<Box component="tr">
															{['Salon Code', 'Name', 'City', 'Phone', 'Status', 'Created', 'Owner'].map(
																(header) => (
																	<Box
																		key={header}
																		component="th"
																		sx={{
																			textAlign: 'left',
																			py: 1.5,
																			px: 2,
																			fontSize: '0.78rem',
																			fontWeight: 700,
																			color: isDark ? '#8ea0c4' : '#64748b',
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			whiteSpace: 'nowrap',
																		}}
																	>
																		{header}
																	</Box>
																)
															)}
														</Box>
													</Box>

													<Box component="tbody">
														{!loading &&
															paginatedSalons.map((salon) => (
																<Box
																	component="tr"
																	key={salon.id}
																	sx={{
																		'&:hover': {
																			backgroundColor: isDark
																				? 'rgba(167, 139, 250, 0.08)'
																				: 'rgba(167, 139, 250, 0.06)',
																		},
																	}}
																>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#e2e8f0' : '#1a1d2e',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.salonCode}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#e2e8f0' : '#1a1d2e',
																			fontSize: '0.86rem',
																			fontWeight: 600,
																		}}
																	>
																		{salon.salonName}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.city}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.phoneNumber}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																		}}
																	>
																		<Chip
																			size="small"
																			label={salon.status.replaceAll('_', ' ')}
																			color={statusColor(salon.status)}
																			sx={{ textTransform: 'capitalize' }}
																		/>
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{formatDate(salon.createdAt)}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#94a3b8' : '#64748b',
																			fontSize: '0.78rem',
																		}}
																	>
																		{salon.ownerId}
																	</Box>
																</Box>
															))}
													</Box>
												</Box>
											</Box>

											<Stack direction="row" justifyContent="flex-end">
												<Pagination
													page={page}
													count={totalPages}
													onChange={(_, nextPage) => setPage(nextPage)}
													color="primary"
													shape="rounded"
													sx={{
														'& .Mui-selected': {
															backgroundColor: '#a78bfa !important',
															color: 'white',
														},
													}}
												/>
											</Stack>
										</Stack>
									)}

									{activeTab === 'active' && (
										<Stack spacing={2}>
											<TextField
												placeholder="Search by salon name, code, city, or phone number"
												value={search}
												onChange={(event) => setSearch(event.target.value)}
												size="small"
												fullWidth
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<SearchIcon
																sx={{ fontSize: '1rem', color: isDark ? '#6b7a99' : '#94a3b8' }}
															/>
														</InputAdornment>
													),
												}}
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
														backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
														'& fieldset': {
															borderColor: isDark ? '#1e2440' : '#eaecf5',
														},
													},
												}}
											/>

											{error && <Alert severity="error">{error}</Alert>}

											{!loading && !error && paginatedActiveSalons.length === 0 && (
												<Alert severity="info">No active salons found for your search.</Alert>
											)}

											<Box
												sx={{
													overflowX: 'auto',
													borderRadius: '10px',
													border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
												}}
											>
												<Box
													component="table"
													sx={{
														width: '100%',
														borderCollapse: 'collapse',
														minWidth: 920,
													}}
												>
													<Box
														component="thead"
														sx={{ backgroundColor: isDark ? '#0f1322' : '#f8fafc' }}
													>
														<Box component="tr">
															{['Salon Code', 'Name', 'City', 'Phone', 'Status', 'Created', 'Owner'].map(
																(header) => (
																	<Box
																		key={header}
																		component="th"
																		sx={{
																			textAlign: 'left',
																			py: 1.5,
																			px: 2,
																			fontSize: '0.78rem',
																			fontWeight: 700,
																			color: isDark ? '#8ea0c4' : '#64748b',
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			whiteSpace: 'nowrap',
																		}}
																	>
																		{header}
																	</Box>
																)
															)}
														</Box>
													</Box>

													<Box component="tbody">
														{!loading &&
															paginatedActiveSalons.map((salon) => (
																<Box
																	component="tr"
																	key={salon.id}
																	sx={{
																		'&:hover': {
																			backgroundColor: isDark
																				? 'rgba(167, 139, 250, 0.08)'
																				: 'rgba(167, 139, 250, 0.06)',
																		},
																	}}
																>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#e2e8f0' : '#1a1d2e',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.salonCode}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#e2e8f0' : '#1a1d2e',
																			fontSize: '0.86rem',
																			fontWeight: 600,
																		}}
																	>
																		{salon.salonName}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.city}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{salon.phoneNumber}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																		}}
																	>
																		<Chip
																			size="small"
																			label={salon.status.replaceAll('_', ' ')}
																			color={statusColor(salon.status)}
																			sx={{ textTransform: 'capitalize' }}
																		/>
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#cbd5e1' : '#334155',
																			fontSize: '0.86rem',
																		}}
																	>
																		{formatDate(salon.createdAt)}
																	</Box>
																	<Box
																		component="td"
																		sx={{
																			py: 1.6,
																			px: 2,
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			color: isDark ? '#94a3b8' : '#64748b',
																			fontSize: '0.78rem',
																		}}
																	>
																		{salon.ownerId}
																	</Box>
																</Box>
															))}
													</Box>
												</Box>
											</Box>

											<Stack direction="row" justifyContent="flex-end">
												<Pagination
													page={activePage}
													count={totalActivePages}
													onChange={(_, nextPage) => setActivePage(nextPage)}
													color="primary"
													shape="rounded"
													sx={{
														'& .Mui-selected': {
															backgroundColor: '#a78bfa !important',
															color: 'white',
														},
													}}
												/>
											</Stack>
										</Stack>
									)}

									{activeTab === 'pending' && (
									<Stack spacing={2}>
										<TextField
											placeholder="Search by salon name, code, city, or phone number"
											value={search}
											onChange={(event) => setSearch(event.target.value)}
											size="small"
											fullWidth
											InputProps={{
												startAdornment: (
													<InputAdornment position="start">
														<SearchIcon
															sx={{ fontSize: '1rem', color: isDark ? '#6b7a99' : '#94a3b8' }}
														/>
													</InputAdornment>
												),
											}}
											sx={{
												'& .MuiOutlinedInput-root': {
													borderRadius: '8px',
													backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
													'& fieldset': {
														borderColor: isDark ? '#1e2440' : '#eaecf5',
													},
												},
											}}
										/>
										{error && <Alert severity="error">{error}</Alert>}
										{actionError && <Alert severity="error">{actionError}</Alert>}
										{!loading && !error && paginatedPendingSalons.length === 0 && filteredPendingSalons.length === 0 && (
											<Alert severity="info">No pending salons found.</Alert>
										)}
										{!loading && !error && paginatedPendingSalons.length === 0 && filteredPendingSalons.length > 0 && (
											<Alert severity="info">No pending salons found for your search.</Alert>
										)}
										{paginatedPendingSalons.length > 0 && (
											<Box
												sx={{
													overflowX: 'auto',
													borderRadius: '10px',
													border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
												}}
											>
												<Box
													component="table"
													sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}
												>
													<Box
														component="thead"
														sx={{ backgroundColor: isDark ? '#0f1322' : '#f8fafc' }}
													>
														<Box component="tr">
															{['Salon Code', 'Name', 'City', 'Phone', 'Created', 'Owner', 'Actions'].map(
																(header) => (
																	<Box
																		key={header}
																		component="th"
																		sx={{
																			textAlign: 'left',
																			py: 1.5,
																			px: 2,
																			fontSize: '0.78rem',
																			fontWeight: 700,
																			color: isDark ? '#8ea0c4' : '#64748b',
																			borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
																			whiteSpace: 'nowrap',
																		}}
																	>
																		{header}
																	</Box>
																)
															)}
														</Box>
													</Box>
													<Box component="tbody">
														{paginatedPendingSalons.map((salon) => (
															<Box
																component="tr"
																key={salon.id}
																sx={{
																	'&:hover': {
																		backgroundColor: isDark
																			? 'rgba(167, 139, 250, 0.08)'
																			: 'rgba(167, 139, 250, 0.06)',
																	},
																}}
															>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.86rem', color: isDark ? '#e2e8f0' : '#1a1d2e' }}>
																	{salon.salonCode}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.86rem', fontWeight: 600, color: isDark ? '#e2e8f0' : '#1a1d2e' }}>
																	{salon.salonName}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.86rem', color: isDark ? '#cbd5e1' : '#334155' }}>
																	{salon.city}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.86rem', color: isDark ? '#cbd5e1' : '#334155' }}>
																	{salon.phoneNumber}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.86rem', color: isDark ? '#cbd5e1' : '#334155' }}>
																	{formatDate(salon.createdAt)}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
																	{salon.ownerId}
																</Box>
																<Box component="td" sx={{ py: 1.6, px: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
																	<Stack direction="row" spacing={1}>
																		<Button
																			size="small"
																			variant="contained"
																			color="success"
																			onClick={() => handleApprove(salon.id)}
																			disabled={processingId === salon.id}
																			sx={{ textTransform: 'none', fontSize: '0.75rem' }}
																		>
																			{processingId === salon.id ? 'Approving...' : 'Approve'}
																		</Button>
																		<Button
																			size="small"
																			variant="outlined"
																			color="error"
																			onClick={() => handleReject(salon.id)}
																			disabled={processingId === salon.id}
																			sx={{ textTransform: 'none', fontSize: '0.75rem' }}
																		>
																			{processingId === salon.id ? 'Rejecting...' : 'Reject'}
																		</Button>
																	</Stack>
																</Box>
															</Box>
														))}
													</Box>
												</Box>
											</Box>
										)}
										<Stack direction="row" justifyContent="flex-end">
											<Pagination
												page={pendingPage}
												count={totalPendingPages}
												onChange={(_, nextPage) => setPendingPage(nextPage)}
												color="primary"
												shape="rounded"
												sx={{
													'& .Mui-selected': {
														backgroundColor: '#a78bfa !important',
														color: 'white',
													},
												}}
											/>
										</Stack>
									</Stack>
									)}
								</CardContent>
							</Card>
						</Stack>
					</Container>
				</Box>
			</Box>
		</Box>
	);
}
