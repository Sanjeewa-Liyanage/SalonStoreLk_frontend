'use client';

import { type SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
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
	activateSalon,
	fetchActiveSalons,
	fetchAllSalons,
	fetchPendingSalons,
	fetchRejectedSalons,
	fetchSalonDetails,
	fetchSuspendedSalons,
	rejectSalon,
	suspendSalon,
	unsuspendSalon,
} from '@/lib/salonService';
import SalonLoader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import SuspendReasonDialog from '@/components/SuspendReasonDialog';
import SalonViewDialog from '@/components/SalonViewDialog';

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
	ownerName: string;
	createdAt?: {
		_seconds: number;
		_nanoseconds: number;
	};
}

type SalonTab = 'all' | 'active' | 'pending' | 'suspended'| 'rejected';

const normalizeSalonTab = (value: string | null): SalonTab => {
	if (value === 'active' || value === 'pending' || value === 'all' || value === 'suspended' || value === 'rejected') return value;
	return 'all';
};

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	const normalized = status.toUpperCase();
	if (normalized === 'ACTIVE') return 'success';
	if (normalized.includes('PENDING')) return 'warning';
	if (normalized.includes('REJECTED')) return 'error';
	return 'default';
};

const formatDate = (createdAt?: Salon['createdAt']) => {
	if (!createdAt?._seconds) return '-';
	return new Date(createdAt._seconds * 1000).toLocaleDateString();
};

interface SalonListPayload {
	data?: Salon[];
	items?: Salon[];
	salons?: Salon[];
	total?: number;
	count?: number;
	totalItems?: number;
	meta?: {
		total?: number;
		totalItems?: number;
	};
	pagination?: Partial<PaginationMeta>;
}

interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

const extractSalonRows = (payload: SalonListPayload | Salon[] | null | undefined): Salon[] => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.items)) return payload.items;
	if (Array.isArray(payload?.salons)) return payload.salons;
	return [];
};

const extractSalonTotal = (payload: SalonListPayload | Salon[] | null | undefined, fallback: number): number => {
	if (Array.isArray(payload)) return payload.length;

	const totalCandidates = [
		payload?.total,
		payload?.totalItems,
		payload?.count,
		payload?.meta?.total,
		payload?.meta?.totalItems,
		payload?.pagination?.totalItems,
	];

	const numericTotal = totalCandidates.find((value) => typeof value === 'number');
	return typeof numericTotal === 'number' ? numericTotal : fallback;
};

const extractPaginationMeta = (
	payload: SalonListPayload | Salon[] | null | undefined,
	fallbackPage: number,
	fallbackLimit: number,
	fallbackCount: number
): PaginationMeta => {
	if (Array.isArray(payload)) {
		return {
			page: fallbackPage,
			limit: fallbackLimit,
			totalItems: payload.length,
			totalPages: 1,
			hasPrevious: fallbackPage > 1,
			hasNext: false,
		};
	}

	const totalItems = extractSalonTotal(payload, fallbackCount);
	const totalPagesFromResponse = payload?.pagination?.totalPages;
	const totalPages =
		typeof totalPagesFromResponse === 'number' && totalPagesFromResponse > 0
			? totalPagesFromResponse
			: Math.max(1, Math.ceil(totalItems / Math.max(1, fallbackLimit)));

	return {
		page:
			typeof payload?.pagination?.page === 'number' && payload.pagination.page > 0
				? payload.pagination.page
				: fallbackPage,
		limit:
			typeof payload?.pagination?.limit === 'number' && payload.pagination.limit > 0
				? payload.pagination.limit
				: fallbackLimit,
		totalItems,
		totalPages,
		hasPrevious:
			typeof payload?.pagination?.hasPrevious === 'boolean'
				? payload.pagination.hasPrevious
				: fallbackPage > 1,
		hasNext:
			typeof payload?.pagination?.hasNext === 'boolean'
				? payload.pagination.hasNext
				: fallbackPage < totalPages,
	};
};

// ─── Reusable table component to avoid repetition ────────────────────────────
interface SalonTableProps {
	salons: Salon[];
	isDark: boolean;
	currentTab: SalonTab;
	showActions?: boolean;
	processingId?: string | null;
	onView?: (id: string) => void;
	onApprove?: (id: string) => void;
	onReject?: (id: string) => void;
	onSuspend?: (id: string) => void;
	onUnsuspend?: (id: string) => void;
}

const SalonTable = ({
	salons,
	isDark,
	currentTab,
	showActions = false,
	processingId,
	onView,
	onApprove,
	onReject,
	onSuspend,
	onUnsuspend,
}: SalonTableProps) => {
	const headers = showActions
		? ['Salon Code', 'Name', 'City', 'Phone', 'Created', 'Owner', 'Actions']
		: ['Salon Code', 'Name', 'City', 'Phone', 'Status', 'Created', 'Owner'];

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
					{salons.map((salon) => (
						<Box
							component="tr"
							key={salon.id}
							onClick={() => !showActions && onView?.(salon.id)}
							sx={{
								cursor: !showActions ? 'pointer' : 'default',
								'&:hover': {
									backgroundColor: isDark
										? 'rgba(167, 139, 250, 0.08)'
										: 'rgba(167, 139, 250, 0.06)',
								},
							}}
						>
							<Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e' })}>
								{salon.salonCode}
							</Box>
							<Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e', fontWeight: 600 })}>
								{salon.salonName}
							</Box>
							<Box component="td" sx={cellSx()}>
								{salon.city}
							</Box>
							<Box component="td" sx={cellSx()}>
								{salon.phoneNumber}
							</Box>

							{/* Status column — only shown when NOT in pending/actions mode */}
							{!showActions && (
								<Box component="td" sx={cellSx()}>
									<Chip
										size="small"
										label={salon.status.replaceAll('_', ' ')}
										color={statusColor(salon.status)}
										sx={{ textTransform: 'capitalize' }}
									/>
								</Box>
							)}

							<Box component="td" sx={cellSx()}>
								{formatDate(salon.createdAt)}
							</Box>
							<Box component="td" sx={cellSx({ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' })}>
								{salon.ownerName}
							</Box>

							{/* Actions column — shown in pending, active, and suspended tabs */}
							{showActions && (
								<Box component="td" sx={cellSx()}>
									{currentTab === 'active' ? (
										<Button
											size="small"
											variant="outlined"
											color="warning"
											onClick={() => onSuspend?.(salon.id)}
											disabled={processingId === salon.id}
											sx={{ textTransform: 'none', fontSize: '0.75rem' }}
										>
											{processingId === salon.id ? 'Suspending...' : 'Suspend'}
										</Button>
									) : currentTab === 'suspended' ? (
										<Button
											size="small"
											variant="contained"
											color="info"
											onClick={() => onUnsuspend?.(salon.id)}
											disabled={processingId === salon.id}
											sx={{ textTransform: 'none', fontSize: '0.75rem' }}
										>
											{processingId === salon.id ? 'Unsuspending...' : 'Unsuspend'}
										</Button>
									) : (
										<Stack direction="row" spacing={1}>
											<Button
												size="small"
												variant="contained"
												color="success"
												onClick={() => onApprove?.(salon.id)}
												disabled={processingId === salon.id}
												sx={{ textTransform: 'none', fontSize: '0.75rem' }}
											>
												{processingId === salon.id ? 'Approving...' : 'Approve'}
											</Button>
											<Button
												size="small"
												variant="outlined"
												color="error"
												onClick={() => onReject?.(salon.id)}
												disabled={processingId === salon.id}
												sx={{ textTransform: 'none', fontSize: '0.75rem' }}
											>
												{processingId === salon.id ? 'Rejecting...' : 'Reject'}
											</Button>
										</Stack>
									)}
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
export default function AdminSalonsPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	const [allSalons, setAllSalons] = useState<Salon[]>([]);
	const [totalItems, setTotalItems] = useState(0);
	const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
		page: 1,
		limit: 10,
		totalItems: 0,
		totalPages: 1,
		hasPrevious: false,
		hasNext: false,
	});
	const [counts, setCounts] = useState({
		total: 0,
		active: 0,
		pending: 0,
		suspended: 0,
		rejected: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	// ── UI state ──
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);
	const [suspendReasonDialogId, setSuspendReasonDialogId] = useState<string | null>(null);
	const [suspendReason, setSuspendReason] = useState('');
	const [suspendReasonError, setSuspendReasonError] = useState<string | null>(null);
	const [suspendConfirmState, setSuspendConfirmState] = useState<{ salonId: string; reason: string } | null>(null);
	const [rejectReasonDialogId, setRejectReasonDialogId] = useState<string | null>(null);
	const [rejectReason, setRejectReason] = useState('');
	const [rejectReasonError, setRejectReasonError] = useState<string | null>(null);
	const [rejectConfirmState, setRejectConfirmState] = useState<{ salonId: string; reason: string } | null>(null);
	const [unsuspendConfirmId, setUnsuspendConfirmId] = useState<string | null>(null);

	// ── View dialog state ──
	const [viewDialogOpen, setViewDialogOpen] = useState(false);
	const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
	const [salonDetails, setSalonDetails] = useState<any>(null);
	const [loadingDialog, setLoadingDialog] = useState(false);
	const [dialogError, setDialogError] = useState<string | null>(null);

	const rowsPerPage = 10;
	const activeTab = normalizeSalonTab(searchParams.get('tab'));

	const fetchSalonsByTab = useCallback((tab: SalonTab, token: string, targetPage: number, limit: number) => {
		switch (tab) {
			case 'active':
				return fetchActiveSalons(token, { page: targetPage, limit });
			case 'pending':
				return fetchPendingSalons(token, { page: targetPage, limit });
			case 'suspended':
				return fetchSuspendedSalons(token, { page: targetPage, limit });
			case 'rejected':
				return fetchRejectedSalons(token, { page: targetPage, limit });
			default:
				return fetchAllSalons(token, { page: targetPage, limit });
		}
	}, []);

	const loadPagedSalons = useCallback(
		async (targetPage: number, tab: SalonTab) => {
			setLoading(true);
			setError('');

			try {
				const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
				if (!token) throw new Error('No access token found. Please login again.');

				const payload = (await fetchSalonsByTab(tab, token, targetPage, rowsPerPage)) as SalonListPayload;
				const salons = extractSalonRows(payload);
				const nextPaginationMeta = extractPaginationMeta(payload, targetPage, rowsPerPage, salons.length);

				setAllSalons(salons);
				setTotalItems(nextPaginationMeta.totalItems);
				setPaginationMeta(nextPaginationMeta);

				if (nextPaginationMeta.page !== targetPage) {
					setPage(nextPaginationMeta.page);
				}
			} catch (fetchError) {
				setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong');
				setAllSalons([]);
				setTotalItems(0);
				setPaginationMeta((prev) => ({ ...prev, hasNext: false, hasPrevious: page > 1 }));
			} finally {
				setLoading(false);
			}
		},
		[fetchSalonsByTab, page, rowsPerPage]
	);

	const loadSummaryCounts = useCallback(async () => {
		try {
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) return;

			const requests = [
				fetchAllSalons(token, { page: 1, limit: 1 }),
				fetchActiveSalons(token, { page: 1, limit: 1 }),
				fetchPendingSalons(token, { page: 1, limit: 1 }),
				fetchSuspendedSalons(token, { page: 1, limit: 1 }),
				fetchRejectedSalons(token, { page: 1, limit: 1 }),
			] as const;

			const [allResult, activeResult, pendingResult, suspendedResult, rejectedResult] =
				await Promise.allSettled(requests);

			setCounts({
				total:
					allResult.status === 'fulfilled'
						? extractSalonTotal(allResult.value as SalonListPayload, extractSalonRows(allResult.value as SalonListPayload).length)
						: 0,
				active:
					activeResult.status === 'fulfilled'
						? extractSalonTotal(activeResult.value as SalonListPayload, extractSalonRows(activeResult.value as SalonListPayload).length)
						: 0,
				pending:
					pendingResult.status === 'fulfilled'
						? extractSalonTotal(pendingResult.value as SalonListPayload, extractSalonRows(pendingResult.value as SalonListPayload).length)
						: 0,
				suspended:
					suspendedResult.status === 'fulfilled'
						? extractSalonTotal(suspendedResult.value as SalonListPayload, extractSalonRows(suspendedResult.value as SalonListPayload).length)
						: 0,
				rejected:
					rejectedResult.status === 'fulfilled'
						? extractSalonTotal(rejectedResult.value as SalonListPayload, extractSalonRows(rejectedResult.value as SalonListPayload).length)
						: 0,
			});
		} catch {
			// Counts are not critical for table rendering.
		}
	}, []);

	// ── Fetch current page from backend whenever tab/page changes ──
	useEffect(() => {
		void loadPagedSalons(page, activeTab);
	}, [activeTab, loadPagedSalons, page]);

	useEffect(() => {
		void loadSummaryCounts();
	}, [loadSummaryCounts]);

	// ── Apply search filter on top of the current backend page ──
	const filteredList = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return allSalons;
		return allSalons.filter(
			(s) =>
				s.salonName.toLowerCase().includes(query) ||
				s.salonCode.toLowerCase().includes(query) ||
				s.city.toLowerCase().includes(query) ||
				s.phoneNumber.toLowerCase().includes(query)
		);
	}, [allSalons, search]);

	// ── Pagination from backend totals (local search only filters current page) ──
	const totalPages = useMemo(
		() => Math.max(1, paginationMeta.totalPages || Math.ceil(totalItems / rowsPerPage) || 1),
		[paginationMeta.totalPages, rowsPerPage, totalItems]
	);
	const paginatedList = filteredList;

	// ── Tab change ──
	const handleTabChange = (_: SyntheticEvent, value: SalonTab) => {
		setSearch('');
		setPage(1);
		const href = value === 'all' ? '/admin/salons' : `/admin/salons?tab=${value}`;
		router.push(href, { scroll: false });
	};

	// ── Approve ──
	const handleApprove = async (salonId: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await activateSalon(salonId, token);
			const nextPage = page > 1 && allSalons.length === 1 ? page - 1 : page;
			if (nextPage !== page) {
				setPage(nextPage);
			} else {
				await loadPagedSalons(nextPage, activeTab);
			}
			void loadSummaryCounts();
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to approve salon.');
		} finally {
			setProcessingId(null);
		}
	};

	// ── Reject ──
	const handleReject = async (salonId: string, reason: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await rejectSalon(salonId, reason, token);
			const nextPage = page > 1 && allSalons.length === 1 ? page - 1 : page;
			if (nextPage !== page) {
				setPage(nextPage);
			} else {
				await loadPagedSalons(nextPage, activeTab);
			}
			void loadSummaryCounts();
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to reject salon.');
		} finally {
			setProcessingId(null);
		}
	};

	// ── Suspend ──
	const handleSuspend = async (salonId: string, reason: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await suspendSalon(salonId, reason, token);
			const nextPage = page > 1 && allSalons.length === 1 ? page - 1 : page;
			if (nextPage !== page) {
				setPage(nextPage);
			} else {
				await loadPagedSalons(nextPage, activeTab);
			}
			void loadSummaryCounts();
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to suspend salon.');
		} finally {
			setProcessingId(null);
		}
	};

	// ── Unsuspend ──
	const handleUnsuspend = async (salonId: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await unsuspendSalon(salonId, token);
			const nextPage = page > 1 && allSalons.length === 1 ? page - 1 : page;
			if (nextPage !== page) {
				setPage(nextPage);
			} else {
				await loadPagedSalons(nextPage, activeTab);
			}
			void loadSummaryCounts();
		} catch (err) {
			setActionError(err instanceof Error ? err.message : 'Failed to unsuspend salon.');
		} finally {
			setProcessingId(null);
		}
	};

	const requestSuspend = (salonId: string) => {
		setSuspendReasonDialogId(salonId);
		setSuspendReason('');
		setSuspendReasonError(null);
		setSuspendConfirmState(null);
	};

	const requestUnsuspend = (salonId: string) => {
		setUnsuspendConfirmId(salonId);
	};

	const requestReject = (salonId: string) => {
		setRejectReasonDialogId(salonId);
		setRejectReason('');
		setRejectReasonError(null);
		setRejectConfirmState(null);
	};

	const cancelSuspendReason = () => {
		if (processingId) return;
		setSuspendReasonDialogId(null);
		setSuspendReasonError(null);
		setSuspendReason('');
	};

	const continueSuspendReason = () => {
		if (!suspendReasonDialogId) return;
		const trimmedReason = suspendReason.trim();
		if (!trimmedReason) {
			setSuspendReasonError('Suspend reason is required.');
			return;
		}

		setSuspendReasonError(null);
		setSuspendConfirmState({ salonId: suspendReasonDialogId, reason: trimmedReason });
		setSuspendReasonDialogId(null);
	};

	const cancelSuspendConfirm = () => {
		if (processingId) return;
		setSuspendConfirmState(null);
		setSuspendReason('');
		setSuspendReasonError(null);
	};

	const cancelUnsuspend = () => {
		if (processingId) return;
		setUnsuspendConfirmId(null);
	};

	const cancelRejectReason = () => {
		if (processingId) return;
		setRejectReasonDialogId(null);
		setRejectReasonError(null);
		setRejectReason('');
	};

	const continueRejectReason = () => {
		if (!rejectReasonDialogId) return;
		const trimmedReason = rejectReason.trim();
		if (!trimmedReason) {
			setRejectReasonError('Reject reason is required.');
			return;
		}

		setRejectReasonError(null);
		setRejectConfirmState({ salonId: rejectReasonDialogId, reason: trimmedReason });
		setRejectReasonDialogId(null);
	};

	const cancelRejectConfirm = () => {
		if (processingId) return;
		setRejectConfirmState(null);
		setRejectReason('');
		setRejectReasonError(null);
	};

	const confirmSuspend = async () => {
		if (!suspendConfirmState) return;
		await handleSuspend(suspendConfirmState.salonId, suspendConfirmState.reason);
		setSuspendConfirmState(null);
		setSuspendReason('');
		setSuspendReasonError(null);
	};

	const confirmUnsuspend = async () => {
		if (!unsuspendConfirmId) return;
		await handleUnsuspend(unsuspendConfirmId);
		setUnsuspendConfirmId(null);
	};

	const confirmReject = async () => {
		if (!rejectConfirmState) return;
		await handleReject(rejectConfirmState.salonId, rejectConfirmState.reason);
		setRejectConfirmState(null);
		setRejectReason('');
		setRejectReasonError(null);
	};

	const suspendTargetSalon = useMemo(
		() => allSalons.find((salon) => salon.id === (suspendConfirmState?.salonId ?? suspendReasonDialogId)),
		[allSalons, suspendConfirmState?.salonId, suspendReasonDialogId]
	);

	const unsuspendTargetSalon = useMemo(
		() => allSalons.find((salon) => salon.id === unsuspendConfirmId),
		[allSalons, unsuspendConfirmId]
	);

	const rejectTargetSalon = useMemo(
		() => allSalons.find((salon) => salon.id === (rejectConfirmState?.salonId ?? rejectReasonDialogId)),
		[allSalons, rejectConfirmState?.salonId, rejectReasonDialogId]
	);

	// ── View salon dialog handlers ──
	const handleViewSalon = async (salonId: string) => {
		try {
			setSelectedSalonId(salonId);
			setViewDialogOpen(true);
			setLoadingDialog(true);
			setDialogError(null);

			const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			const details = await fetchSalonDetails(salonId, token);
			setSalonDetails(details.data || details);
		} catch (err) {
			setDialogError(err instanceof Error ? err.message : 'Failed to load salon details');
		} finally {
			setLoadingDialog(false);
		}
	};

	const handleCloseViewDialog = () => {
		setViewDialogOpen(false);
		setSelectedSalonId(null);
		setSalonDetails(null);
		setDialogError(null);
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
					pageTitle="Salons"
					pageSubtitle="Manage all salons and review verification status."
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
									{ label: 'Total Salons',     value: counts.total,   icon: <StorefrontIcon sx={{ color: '#a78bfa' }} /> },
									{ label: 'Active Salons',    value: counts.active,  icon: <CheckCircleOutlineIcon sx={{ color: '#10b981' }} /> },
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
										{(['all', 'active', 'pending', 'suspended','rejected'] as SalonTab[]).map((tab) => (
											<Tab
												key={tab}
												value={tab}
												label={
													tab === 'all'       ? 'All Salons' :
													tab === 'active'    ? 'Active Salons' :
													tab === 'pending'   ? 'Pending Approval' :
													tab === 'suspended' ? 'Suspended Salons' :
													'Rejected Salons'

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
											placeholder="Search by salon name, code, city, or phone number"
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
													? 'No salons found for your search.'
													: `No ${activeTab === 'all' ? '' : activeTab + ' '}salons found.`}
											</Alert>
										) : (
											<SalonTable
												salons={paginatedList}
												isDark={isDark}
												currentTab={activeTab}
												showActions={activeTab === 'pending' || activeTab === 'active' || activeTab === 'suspended'}
												processingId={processingId}
												onView={handleViewSalon}
												onApprove={handleApprove}
												onReject={requestReject}
												onSuspend={requestSuspend}
												onUnsuspend={requestUnsuspend}
											/>
										)}

										{/* Pagination */}
										<Stack direction="row" justifyContent="flex-end">
											<Pagination
												page={page}
												count={totalPages}
												onChange={(_, nextPage) =>
													setPage(Math.min(Math.max(1, nextPage), totalPages))
												}
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

			<SuspendReasonDialog
				open={Boolean(suspendReasonDialogId)}
				salonName={suspendTargetSalon?.salonName}
				reason={suspendReason}
				error={suspendReasonError}
				loading={Boolean(processingId)}
				onReasonChange={(value) => {
					setSuspendReason(value);
					if (suspendReasonError) {
						setSuspendReasonError(null);
					}
				}}
				onCancel={cancelSuspendReason}
				onConfirm={continueSuspendReason}
			/>

			<SuspendReasonDialog
				open={Boolean(rejectReasonDialogId)}
				salonName={rejectTargetSalon?.salonName}
				reason={rejectReason}
				error={rejectReasonError}
				loading={Boolean(processingId)}
				title="Reject Salon"
				actionVerb="rejecting"
				inputLabel="Reject Reason"
				helperText="This reason will be sent with the reject request."
				confirmColor="error"
				onReasonChange={(value) => {
					setRejectReason(value);
					if (rejectReasonError) {
						setRejectReasonError(null);
					}
				}}
				onCancel={cancelRejectReason}
				onConfirm={continueRejectReason}
			/>

			<ConfirmDialog
				open={Boolean(suspendConfirmState)}
				title="Suspend Salon"
				message={
					suspendTargetSalon
						? `Are you sure you want to suspend ${suspendTargetSalon.salonName}? This salon will be moved to the suspended list.`
						: 'Are you sure you want to suspend this salon?'
				}
				variant="warning"
				confirmLabel="Yes, Suspend"
				cancelLabel="Cancel"
				onConfirm={confirmSuspend}
				onCancel={cancelSuspendConfirm}
				loading={processingId === suspendConfirmState?.salonId}
			/>

			<ConfirmDialog
				open={Boolean(unsuspendConfirmId)}
				title="Unsuspend Salon"
				message={
					unsuspendTargetSalon
						? `Are you sure you want to unsuspend ${unsuspendTargetSalon.salonName}? This salon will be moved to the active list.`
						: 'Are you sure you want to unsuspend this salon?'
				}
				variant="info"
				confirmLabel="Yes, Unsuspend"
				cancelLabel="Cancel"
				onConfirm={confirmUnsuspend}
				onCancel={cancelUnsuspend}
				loading={processingId === unsuspendConfirmId}
			/>

			<ConfirmDialog
				open={Boolean(rejectConfirmState)}
				title="Reject Salon"
				message={
					rejectTargetSalon
						? `Are you sure you want to reject ${rejectTargetSalon.salonName}? This salon will be moved to the rejected list.`
						: 'Are you sure you want to reject this salon?'
				}
				variant="danger"
				confirmLabel="Yes, Reject"
				cancelLabel="Cancel"
				onConfirm={confirmReject}
				onCancel={cancelRejectConfirm}
				loading={processingId === rejectConfirmState?.salonId}
			/>

			<SalonViewDialog
				open={viewDialogOpen}
				salon={salonDetails}
				loading={loadingDialog}
				onClose={handleCloseViewDialog}
			/>
		</>
	);
}
