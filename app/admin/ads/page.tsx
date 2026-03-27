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
	CampaignOutlined as AdsIcon,
} from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { getAllAds } from '@/lib/adsService';
import SalonLoader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import AdDetailsDialog from '@/components/AdDetailsDialog';

interface Ad {
	id: string;
	title: string;
	description: string;
	salonId: string;
	salonName?: string;
	status: string; // PENDING_APPROVAL | APPROVED | REJECTED
	createdAt?: {
		_seconds: number;
		_nanoseconds: number;
	};
	updatedAt?: {
		_seconds: number;
		_nanoseconds: number;
	};
	imageUrl?: string[];
	planId?: string;
	paymentStatus?: string;
	rejectionReason?: string;
}

type AdTab = 'all' | 'active' | 'pending' | 'rejected';

const normalizeAdTab = (value: string | null): AdTab => {
	if (value === 'active' || value === 'pending' || value === 'all' || value === 'rejected') return value;
	return 'all';
};

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	const normalized = status.toUpperCase();
	if (normalized === 'APPROVED') return 'success';
	if (normalized === 'PENDING_APPROVAL') return 'warning';
	if (normalized === 'REJECTED') return 'error';
	return 'default';
};

const formatDate = (timestamp?: Ad['createdAt']) => {
	if (!timestamp?._seconds) return '-';
	return new Date(timestamp._seconds * 1000).toLocaleDateString();
};

// ─── Reusable table component to avoid repetition ────────────────────────────
interface AdTableProps {
	ads: Ad[];
	isDark: boolean;
	currentTab: AdTab;
	showActions?: boolean;
	processingId?: string | null;
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onView?: (id: string) => void;
}

const AdTable = ({
	ads,
	isDark,
	currentTab,
	showActions = false,
	processingId,
	onApprove,
	onReject,
	onView,
}: AdTableProps) => {
	const headers = showActions
		? ['Title', 'Salon Name', 'Status', 'Created', 'Actions']
		: ['Title', 'Salon Name', 'Status', 'Created'];

	const cellSx = (extra?: object) => ({
		py: 1.6,
		px: 2,
		borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
		fontSize: '0.86rem',
		color: isDark ? '#cbd5e1' : '#334155',
		...extra,
	});

	return (
		<Box
			sx={{
				overflowX: 'auto',
				borderRadius: '10px',
				border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
			}}
		>
			<Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
				<Box component="thead" sx={{ backgroundColor: isDark ? '#0f1322' : '#f8fafc' }}>
					<Box component="tr">
						{headers.map((header) => (
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
						))}
					</Box>
				</Box>

				<Box component="tbody">
					{ads.map((ad) => (
						<Box
							component="tr"
							key={ad.id}
							sx={{
								'&:hover': {
									backgroundColor: isDark
										? 'rgba(167, 139, 250, 0.08)'
										: 'rgba(167, 139, 250, 0.06)',
								},
							}}
						>
							<Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e', fontWeight: 600 })}>
								{ad.title}
							</Box>
							<Box component="td" sx={cellSx()}>
								{ad.salonName || '-'}
							</Box>
							<Box component="td" sx={cellSx()}>
								<Chip
									size="small"
									label={ad.status.replaceAll('_', ' ')}
									color={statusColor(ad.status)}
									sx={{ textTransform: 'capitalize' }}
								/>
							</Box>
							<Box component="td" sx={cellSx()}>
								{formatDate(ad.createdAt)}
							</Box>

							{/* Actions column — shown in pending and rejected tabs */}
							{showActions && (
								<Box component="td" sx={cellSx()}>
									<Stack direction="row" spacing={1}>
										<Button
											size="small"
											variant="outlined"
											color="info"
											onClick={() => onView?.(ad.id)}
											sx={{ textTransform: 'none', fontSize: '0.75rem' }}
										>
											View Details
										</Button>
										{currentTab === 'pending' && (
											<>
												<Button
													size="small"
													variant="contained"
													color="success"
													onClick={() => onApprove?.(ad.id)}
													disabled={processingId === ad.id}
													sx={{ textTransform: 'none', fontSize: '0.75rem' }}
												>
													{processingId === ad.id ? 'Approving...' : 'Approve'}
												</Button>
												<Button
													size="small"
													variant="outlined"
													color="error"
													onClick={() => onReject?.(ad.id)}
													disabled={processingId === ad.id}
													sx={{ textTransform: 'none', fontSize: '0.75rem' }}
												>
													{processingId === ad.id ? 'Rejecting...' : 'Reject'}
												</Button>
											</>
										)}
									</Stack>
								</Box>
							)}
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAdsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	// ── Single source of truth: all ads fetched once ──
	const [allAds, setAllAds] = useState<Ad[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// ── UI state ──
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [rejectConfirmState, setRejectConfirmState] = useState<string | null>(null);
	const [viewAdId, setViewAdId] = useState<string | null>(null);

	const rowsPerPage = 10;
	const activeTab = normalizeAdTab(searchParams.get('status'));

	// ── Fetch ONCE on mount — no tab dependency ──
	useEffect(() => {
		const loadAds = async () => {
			setLoading(true);
			setError('');
			try {
				const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
				if (!token) throw new Error('No access token found. Please login again.');

				const payload = await getAllAds(token); // Get all ads with auth
				// Response is always { data: [...], total: ... }
				const adsData = Array.isArray(payload?.data) ? payload.data : [];
				setAllAds(adsData);
			} catch (fetchError) {
				console.error('Error loading ads:', fetchError);
				setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong');
			} finally {
				setLoading(false);
			}
		};

		loadAds();
	}, []); // ← empty array: runs once only

	// ── Reset search + page when tab changes ──
	useEffect(() => {
		setSearch('');
		setPage(1);
	}, [activeTab]);

	// ── Derive filtered lists from allAds ──
	const activeAds = useMemo(
		() => allAds.filter((ad) => ad.status.toUpperCase() === 'APPROVED'),
		[allAds]
	);

	const pendingAds = useMemo(
		() => allAds.filter((ad) => ad.status.toUpperCase() === 'PENDING_APPROVAL'),
		[allAds]
	);

	const rejectedAds = useMemo(
		() => allAds.filter((ad) => ad.status.toUpperCase() === 'REJECTED'),
		[allAds]
	);

	// ── Summary counts (always derived from allAds) ──
	const counts = useMemo(
		() => ({
			total: allAds.length,
			active: activeAds.length,
			pending: pendingAds.length,
			rejected: rejectedAds.length,
		}),
		[allAds, activeAds, pendingAds, rejectedAds]
	);

	// ── Pick the correct list for the active tab ──
	const currentList = useMemo(() => {
		switch (activeTab) {
			case 'active':
				return activeAds;
			case 'pending':
				return pendingAds;
			case 'rejected':
				return rejectedAds;
			default:
				return allAds;
		}
	}, [activeTab, allAds, activeAds, pendingAds, rejectedAds]);

	// ── Apply search filter on top of the current list ──
	const filteredList = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return currentList;
		return currentList.filter(
			(ad) =>
				ad.title.toLowerCase().includes(query) ||
				(ad.salonName || '').toLowerCase().includes(query) ||
				ad.description.toLowerCase().includes(query)
		);
	}, [currentList, search]);

	// ── Pagination ──
	const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
	const paginatedList = filteredList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

	// ── Tab change ──
	const handleTabChange = (_: SyntheticEvent, value: AdTab) => {
		const href = value === 'all' ? '/admin/ads' : `/admin/ads?status=${value}`;
		router.push(href, { scroll: false });
	};

	// ── Approve ──
	const handleApprove = async (adId: string) => {
		try {
			setProcessingId(adId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			// TODO: Call approve ad service when available
			// await approveAd(adId, token);

			// Optimistically update local state
			setAllAds((prev) =>
				prev.map((ad) => (ad.id === adId ? { ...ad, status: 'APPROVED' } : ad))
			);
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to approve ad.');
		} finally {
			setProcessingId(null);
		}
	};

	// ── Reject ──
	const handleReject = async (adId: string) => {
		try {
			setProcessingId(adId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			// TODO: Call reject ad service when available
			// await rejectAd(adId, token);

			setAllAds((prev) =>
				prev.map((ad) => (ad.id === adId ? { ...ad, status: 'REJECTED' } : ad))
			);
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to reject ad.');
		} finally {
			setProcessingId(null);
		}
	};

	const requestReject = (adId: string) => {
		setRejectConfirmState(adId);
	};

	const cancelRejectConfirm = () => {
		if (processingId) return;
		setRejectConfirmState(null);
	};

	const confirmReject = async () => {
		if (!rejectConfirmState) return;
		await handleReject(rejectConfirmState);
		setRejectConfirmState(null);
	};

	const rejectTargetAd = useMemo(
		() => allAds.find((ad) => ad.id === rejectConfirmState),
		[allAds, rejectConfirmState]
	);

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
		<>
			<Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDark ? '#0d0f1a' : '#f9fafb' }}>
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
						pageTitle="Ads"
						pageSubtitle="Manage all ads and review approval status."
					/>

					<Box
						component="main"
						sx={{ flex: 1, overflow: 'auto', backgroundColor: isDark ? '#0d0f1a' : '#f9fafb' }}
					>
						<Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
							<Stack spacing={3}>

								{/* ── Summary cards ── */}
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' },
										gap: 2,
									}}
								>
									{[
										{ label: 'Total Ads',     value: counts.total,   icon: <AdsIcon sx={{ color: '#a78bfa' }} /> },
										{ label: 'Active Ads',    value: counts.active,  icon: <CheckCircleOutlineIcon sx={{ color: '#10b981' }} /> },
										{ label: 'Pending Approval', value: counts.pending, icon: <PendingActionsIcon sx={{ color: '#f59e0b' }} /> },
									].map(({ label, value, icon }) => (
										<Card
											key={label}
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
															{label}
														</Typography>
														<Typography sx={{ fontWeight: 700 }} variant="h5">
															{value}
														</Typography>
													</Box>
													{icon}
												</Stack>
											</CardContent>
										</Card>
									))}
								</Box>

								{/* ── Tab card ── */}
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
											sx={{ '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' } }}
										>
											{(['all', 'active', 'pending', 'rejected'] as AdTab[]).map((tab) => (
												<Tab
													key={tab}
													value={tab}
													label={
														tab === 'all'       ? 'All Ads' :
														tab === 'active'    ? 'Active Ads' :
														tab === 'pending'   ? 'Pending Approval' :
														'Rejected Ads'

													}
													sx={{ textTransform: 'none', fontWeight: 600 }}
												/>
											))}
										</Tabs>
									</Box>

									<CardContent>
										<Stack spacing={2}>
											{/* Search */}
											<TextField
												placeholder="Search by title, salon name, or description"
												value={search}
												onChange={(e) => {
													setSearch(e.target.value);
													setPage(1);
												}}
												size="small"
												fullWidth
												InputProps={{
													startAdornment: (
														<InputAdornment position="start">
															<SearchIcon sx={{ fontSize: '1rem', color: isDark ? '#6b7a99' : '#94a3b8' }} />
														</InputAdornment>
													),
												}}
												sx={{
													'& .MuiOutlinedInput-root': {
														borderRadius: '8px',
														backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
														'& fieldset': { borderColor: isDark ? '#1e2440' : '#eaecf5' },
													},
												}}
											/>

											{error       && <Alert severity="error">{error}</Alert>}
											{actionError && <Alert severity="error">{actionError}</Alert>}

											{paginatedList.length === 0 ? (
												<Alert severity="info">
													{filteredList.length === 0 && search
														? 'No ads found for your search.'
														: `No ${activeTab === 'all' ? '' : activeTab + ' '}ads found.`}
												</Alert>
											) : (
												<AdTable
													ads={paginatedList}
													isDark={isDark}
													currentTab={activeTab}
													showActions={activeTab === 'pending' || activeTab === 'rejected'}
													processingId={processingId}
													onApprove={handleApprove}
													onReject={requestReject}
													onView={(id) => setViewAdId(id)}
												/>
											)}

											{/* Pagination */}
											<Stack direction="row" justifyContent="flex-end">
												<Pagination
													page={page}
													count={totalPages}
													onChange={(_, nextPage) => setPage(nextPage)}
													color="primary"
													shape="rounded"
													sx={{ '& .Mui-selected': { backgroundColor: '#a78bfa !important', color: 'white' } }}
												/>
											</Stack>
										</Stack>
									</CardContent>
								</Card>

							</Stack>
						</Container>
					</Box>
				</Box>
			</Box>

			<AdDetailsDialog 
				open={Boolean(viewAdId)} 
				onClose={() => setViewAdId(null)} 
				adId={viewAdId} 
			/>

			<ConfirmDialog
				open={Boolean(rejectConfirmState)}
				title="Reject Ad"
				message={
					rejectTargetAd
						? `Are you sure you want to reject "${rejectTargetAd.title}"? This ad will be moved to the rejected list.`
						: 'Are you sure you want to reject this ad?'
				}
				variant="danger"
				confirmLabel="Yes, Reject"
				cancelLabel="Cancel"
				onConfirm={confirmReject}
				onCancel={cancelRejectConfirm}
				loading={processingId === rejectConfirmState}
			/>
		</>
	);
}
