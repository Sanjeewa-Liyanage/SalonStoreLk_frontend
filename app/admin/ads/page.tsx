'use client';

import { Suspense, type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
	Alert,
	Box,
	Card,
	CardContent,
	Chip,
	Container,
	InputAdornment,
	IconButton,
	Pagination,
	Tooltip,
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
	CancelOutlined as CancelOutlinedIcon,
	DeleteOutline as DeleteOutlineIcon,
	PendingActions as PendingActionsIcon,
	Search as SearchIcon,
	CampaignOutlined as AdsIcon,
} from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { getAllAds, approveAd, rejectAd, deleteAd } from '@/lib/adsService';
import SalonLoader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import AdDetailsDialog from '@/components/AdDetailsDialog';
import { toast } from '@/hooks/use-toast';

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

type AdTab = 'all' | 'active' | 'pending_approval' | 'rejected';

interface AdsPagination {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

interface AdsListResponse {
	data?: Ad[];
	pagination?: Partial<AdsPagination>;
}

interface AdsSummaryCounts {
	total: number;
	active: number;
	pending: number;
	rejected: number;
}

interface ApiErrorShape {
	response?: {
		data?: {
			message?: string;
		};
	};
	message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
	if (typeof error === 'object' && error !== null) {
		const parsedError = error as ApiErrorShape;
		const backendMessage = parsedError.response?.data?.message;
		if (backendMessage && backendMessage.trim()) return backendMessage;

		if (parsedError.message && parsedError.message.trim()) return parsedError.message;
	}

	return fallback;
};

const showErrorToast = (message: string) => {
	toast({
		title: 'Error',
		description: message,
		variant: 'destructive',
	});
};

const normalizeAdTab = (value: string | null): AdTab => {
	if (value === 'pending') return 'pending_approval';
	if (value === 'active' || value === 'pending_approval' || value === 'all' || value === 'rejected') return value;
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
	processingId?: string | null;
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onDelete?: (id: string) => void;
	onRowClick?: (id: string) => void;
}

const AdTable = ({
	ads,
	isDark,
	currentTab,
	processingId,
	onApprove,
	onReject,
	onDelete,
	onRowClick,
}: AdTableProps) => {
	const headers = ['Title', 'Salon Name', 'Status', 'Created', 'Actions'];
	const showModerationActions = currentTab === 'pending_approval';

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
							onClick={() => onRowClick?.(ad.id)}
							sx={{
								cursor: onRowClick ? 'pointer' : 'default',
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

							<Box component="td" sx={cellSx()}>
								<Stack direction="row" spacing={0.5} alignItems="center">
									{showModerationActions && (
										<>
											<Tooltip title="Approve">
												<span>
													<IconButton
														size="small"
														color="success"
														onClick={(e) => {
															e.stopPropagation();
															onApprove?.(ad.id);
														}}
														disabled={processingId === ad.id}
														aria-label="Approve ad"
													>
														<CheckCircleOutlineIcon fontSize="small" />
														</IconButton>
													</span>
											</Tooltip>
											<Tooltip title="Reject">
												<span>
													<IconButton
														size="small"
														color="error"
														onClick={(e) => {
															e.stopPropagation();
															onReject?.(ad.id);
														}}
														disabled={processingId === ad.id}
														aria-label="Reject ad"
													>
														<CancelOutlinedIcon fontSize="small" />
														</IconButton>
													</span>
											</Tooltip>
										</>
									)}
										<Tooltip title="Delete">
											<span>
												<IconButton
													size="small"
													color="error"
													onClick={(e) => {
														e.stopPropagation();
														onDelete?.(ad.id);
													}}
													disabled={processingId === ad.id}
													aria-label="Delete ad"
												>
													<DeleteOutlineIcon fontSize="small" />
												</IconButton>
											</span>
										</Tooltip>
									</Stack>
							</Box>
						</Box>
					))}
				</Box>
			</Box>
		</Box>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────────
function AdminAdsPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	const rowsPerPage = 10;

	// ── Server-driven data state ──
	const [ads, setAds] = useState<Ad[]>([]);
	const [pagination, setPagination] = useState<AdsPagination>({
		page: 1,
		limit: rowsPerPage,
		totalItems: 0,
		totalPages: 1,
		hasPrevious: false,
		hasNext: false,
	});
	const [counts, setCounts] = useState<AdsSummaryCounts>({
		total: 0,
		active: 0,
		pending: 0,
		rejected: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// ── UI state ──
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [rejectConfirmState, setRejectConfirmState] = useState<string | null>(null);
	const [deleteConfirmState, setDeleteConfirmState] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [viewAdId, setViewAdId] = useState<string | null>(null);

	const activeTab = normalizeAdTab(searchParams.get('status'));

	const resolveAccessToken = () => {
		const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
		if (!token) throw new Error('No access token found. Please login again.');
		return token;
	};

	const applyAdsResponse = (payload: AdsListResponse, requestedPage: number) => {
		const adsData = Array.isArray(payload?.data) ? payload.data : [];
		const paginationData = payload?.pagination;

		setAds(adsData);
		setPagination({
			page: paginationData?.page ?? requestedPage,
			limit: paginationData?.limit ?? rowsPerPage,
			totalItems: paginationData?.totalItems ?? adsData.length,
			totalPages: Math.max(1, paginationData?.totalPages ?? 1),
			hasPrevious: Boolean(paginationData?.hasPrevious),
			hasNext: Boolean(paginationData?.hasNext),
		});
	};

	const refreshSummaryCounts = async (token: string, commit = true) => {
		const [allResponse, activeResponse, pendingResponse, rejectedResponse] = await Promise.all([
			getAllAds({ page: 1, limit: 1, type: 'all' }, token),
			getAllAds({ page: 1, limit: 1, type: 'active' }, token),
			getAllAds({ page: 1, limit: 1, type: 'pending_approval' }, token),
			getAllAds({ page: 1, limit: 1, type: 'rejected' }, token),
		]);

		const nextCounts: AdsSummaryCounts = {
			total: allResponse?.pagination?.totalItems ?? 0,
			active: activeResponse?.pagination?.totalItems ?? 0,
			pending: pendingResponse?.pagination?.totalItems ?? 0,
			rejected: rejectedResponse?.pagination?.totalItems ?? 0,
		};

		if (commit) {
			setCounts(nextCounts);
		}

		return nextCounts;
	};

	// ── Load tab data from backend by type + page ──
	useEffect(() => {
		let isMounted = true;

		const loadAds = async () => {
			setLoading(true);
			setError('');
			try {
				const token = resolveAccessToken();
				const payload = (await getAllAds({ page, limit: rowsPerPage, type: activeTab }, token)) as AdsListResponse;
				if (!isMounted) return;
				applyAdsResponse(payload, page);
			} catch (fetchError) {
				if (!isMounted) return;
				console.error('Error loading ads:', fetchError);
				const message = getErrorMessage(fetchError, 'Something went wrong');
				setError(message);
				showErrorToast(message);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		loadAds();

		return () => {
			isMounted = false;
		};
	}, [activeTab, page]);

	// ── Load summary totals for cards ──
	useEffect(() => {
		let isMounted = true;

		const loadSummary = async () => {
			try {
				const token = resolveAccessToken();
				const nextCounts = await refreshSummaryCounts(token, false);

				if (!isMounted) return;
				setCounts(nextCounts);
			} catch (summaryError) {
				if (!isMounted) return;
				console.error('Error loading ad summary:', summaryError);
			}
		};

		loadSummary();

		return () => {
			isMounted = false;
		};
	}, []);

	// ── Reset search + page when tab changes ──
	useEffect(() => {
		setSearch('');
		setPage(1);
	}, [activeTab]);

	// ── Apply search filter on current backend page results ──
	const filteredList = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return ads;
		return ads.filter(
			(ad) =>
				ad.title.toLowerCase().includes(query) ||
				(ad.salonName || '').toLowerCase().includes(query) ||
				ad.description.toLowerCase().includes(query)
		);
	}, [ads, search]);

	// ── Pagination ──
	const totalPages = Math.max(1, pagination.totalPages);
	const activeTabLabel = activeTab === 'pending_approval' ? 'pending approval' : activeTab;

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
			const token = resolveAccessToken();

			await approveAd(adId);
			const payload = (await getAllAds({ page, limit: rowsPerPage, type: activeTab }, token)) as AdsListResponse;
			applyAdsResponse(payload, page);
			await refreshSummaryCounts(token);
		} catch (err) {
			const message = getErrorMessage(err, 'Failed to approve ad.');
			setActionError(message);
			showErrorToast(message);
		} finally {
			setProcessingId(null);
		}
	};

	// ── Reject ──
	const handleReject = async (adId: string) => {
		try {
			setProcessingId(adId);
			setActionError(null);
			const token = resolveAccessToken();

			await rejectAd(adId, rejectReason.trim() || 'Rejected by admin');
			const payload = (await getAllAds({ page, limit: rowsPerPage, type: activeTab }, token)) as AdsListResponse;
			applyAdsResponse(payload, page);
			await refreshSummaryCounts(token);
		} catch (err) {
			const message = getErrorMessage(err, 'Failed to reject ad.');
			setActionError(message);
			showErrorToast(message);
		} finally {
			setProcessingId(null);
		}
	};

	const handleDelete = async (adId: string) => {
		try {
			setProcessingId(adId);
			setActionError(null);
			const token = resolveAccessToken();

			await deleteAd(adId);
			await refreshSummaryCounts(token);

			if (ads.length === 1 && page > 1) {
				setPage((currentPage) => Math.max(1, currentPage - 1));
				return;
			}

			const payload = (await getAllAds({ page, limit: rowsPerPage, type: activeTab }, token)) as AdsListResponse;
			applyAdsResponse(payload, page);
		} catch (err) {
			const message = getErrorMessage(err, 'Failed to delete ad.');
			setActionError(message);
			showErrorToast(message);
		} finally {
			setProcessingId(null);
		}
	};

	const requestReject = (adId: string) => {
		setRejectConfirmState(adId);
		setRejectReason('');
	};

	const requestDelete = (adId: string) => {
		setDeleteConfirmState(adId);
	};

	const cancelRejectConfirm = () => {
		if (processingId) return;
		setRejectConfirmState(null);
	};

	const cancelDeleteConfirm = () => {
		if (processingId) return;
		setDeleteConfirmState(null);
	};

	const confirmReject = async () => {
		if (!rejectConfirmState) return;
		await handleReject(rejectConfirmState);
		setRejectConfirmState(null);
	};

	const confirmDelete = async () => {
		if (!deleteConfirmState) return;
		await handleDelete(deleteConfirmState);
		setDeleteConfirmState(null);
	};

	const rejectTargetAd = useMemo(
		() => ads.find((ad) => ad.id === rejectConfirmState),
		[ads, rejectConfirmState]
	);

	const deleteTargetAd = useMemo(
		() => ads.find((ad) => ad.id === deleteConfirmState),
		[ads, deleteConfirmState]
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
											{(['all', 'active', 'pending_approval', 'rejected'] as AdTab[]).map((tab) => (
												<Tab
													key={tab}
													value={tab}
													label={
														tab === 'all'       ? 'All Ads' :
														tab === 'active'    ? 'Active Ads' :
														tab === 'pending_approval'   ? 'Pending Approval' :
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
												onChange={(e) => setSearch(e.target.value)}
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

											{filteredList.length === 0 ? (
												<Alert severity="info">
													{filteredList.length === 0 && search
														? 'No ads found for your search.'
														: `No ${activeTab === 'all' ? '' : activeTabLabel + ' '}ads found.`}
												</Alert>
											) : (
												<AdTable
													ads={filteredList}
													isDark={isDark}
													currentTab={activeTab}
													processingId={processingId}
													onApprove={handleApprove}
													onReject={requestReject}
													onDelete={requestDelete}
													onRowClick={(id) => setViewAdId(id)}
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
					<>
						{rejectTargetAd
							? `Are you sure you want to reject "${rejectTargetAd.title}"? This ad will be moved to the rejected list.`
							: 'Are you sure you want to reject this ad?'}
						<TextField
							size="small"
							label="Rejection Reason"
							placeholder="e.g. Inappropriate content"
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							multiline
							minRows={2}
							maxRows={4}
							fullWidth
							sx={{ mt: 2 }}
						/>
					</>
				}
				variant="danger"
				confirmLabel="Yes, Reject"
				cancelLabel="Cancel"
				onConfirm={confirmReject}
				onCancel={cancelRejectConfirm}
				loading={processingId === rejectConfirmState}
			/>

			<ConfirmDialog
				open={Boolean(deleteConfirmState)}
				title="Delete Ad"
				message={
					deleteTargetAd
						? `Are you sure you want to delete "${deleteTargetAd.title}"? This action cannot be undone.`
						: 'Are you sure you want to delete this ad? This action cannot be undone.'
				}
				variant="danger"
				confirmLabel="Yes, Delete"
				cancelLabel="Cancel"
				onConfirm={confirmDelete}
				onCancel={cancelDeleteConfirm}
				loading={processingId === deleteConfirmState}
			/>
		</>
	);
}

export default function AdminAdsPage() {
	return (
		<Suspense
			fallback={
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						minHeight: '100vh',
						backgroundColor: '#f9fafb',
					}}
				>
					<SalonLoader />
				</Box>
			}
		>
			<AdminAdsPageContent />
		</Suspense>
	);
}
