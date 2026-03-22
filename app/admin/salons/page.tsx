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
import { fetchAllSalons, activateSalon, rejectSalon, suspendSalon, unsuspendSalon } from '@/lib/salonService';
import SalonLoader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import SuspendReasonDialog from '@/components/SuspendReasonDialog';

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

// ─── Reusable table component to avoid repetition ────────────────────────────
interface SalonTableProps {
	salons: Salon[];
	isDark: boolean;
	currentTab: SalonTab;
	showActions?: boolean;
	processingId?: string | null;
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
							sx={{
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
								{salon.ownerId}
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

	// ── Single source of truth: all salons fetched once ──
	const [allSalons, setAllSalons] = useState<Salon[]>([]);
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

	const rowsPerPage = 8;
	const activeTab = normalizeSalonTab(searchParams.get('tab'));

	// ── Fetch ONCE on mount — no tab dependency ──
	useEffect(() => {
		const loadSalons = async () => {
			setLoading(true);
			setError('');
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
				if (!token) throw new Error('No access token found. Please login again.');

				const payload = await fetchAllSalons(token);
				setAllSalons(payload.data || []);
			} catch (fetchError) {
				setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong');
			} finally {
				setLoading(false);
			}
		};

		loadSalons();
	}, []); // ← empty array: runs once only

	// ── Reset search + page when tab changes ──
	useEffect(() => {
		setSearch('');
		setPage(1);
	}, [activeTab]);

	// ── Derive filtered lists from allSalons ──
	const activeSalons = useMemo(
		() => allSalons.filter((s) => s.status.toUpperCase() === 'ACTIVE'),
		[allSalons]
	);

	const pendingSalons = useMemo(
		() => allSalons.filter((s) => s.status.toUpperCase().includes('PENDING')),
		[allSalons]
	);

	const suspendedSalons = useMemo(
		() => allSalons.filter((s) => s.status.toUpperCase() === 'SUSPENDED'),
		[allSalons]
	);
	const rejectedSalons = useMemo(
		() => allSalons.filter((s) => s.status.toUpperCase() === 'REJECTED'),
		[allSalons]
	);
	// ── Summary counts (always derived from allSalons) ──
	const counts = useMemo(
		() => ({
			total: allSalons.length,
			active: activeSalons.length,
			pending: pendingSalons.length,
			suspended: suspendedSalons.length,
			rejected: rejectedSalons.length,
		}),
		[allSalons, activeSalons, pendingSalons, suspendedSalons, rejectedSalons]
	);

	// ── Pick the correct list for the active tab ──
	const currentList = useMemo(() => {
		switch (activeTab) {
			case 'active':    return activeSalons;
			case 'pending':   return pendingSalons;
			case 'suspended': return suspendedSalons;
			case 'rejected':  return rejectedSalons;

			default:          return allSalons;
		}
	}, [activeTab, allSalons, activeSalons, pendingSalons, suspendedSalons, rejectedSalons]);

	// ── Apply search filter on top of the current list ──
	const filteredList = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return currentList;
		return currentList.filter(
			(s) =>
				s.salonName.toLowerCase().includes(query) ||
				s.salonCode.toLowerCase().includes(query) ||
				s.city.toLowerCase().includes(query) ||
				s.phoneNumber.toLowerCase().includes(query)
		);
	}, [currentList, search]);

	// ── Pagination ──
	const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
	const paginatedList = filteredList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

	// ── Tab change ──
	const handleTabChange = (_: SyntheticEvent, value: SalonTab) => {
		const href = value === 'all' ? '/admin/salons' : `/admin/salons?tab=${value}`;
		router.push(href, { scroll: false });
	};

	// ── Approve ──
	const handleApprove = async (salonId: string) => {
		try {
			setProcessingId(salonId);
			setActionError(null);
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await activateSalon(salonId, token);

			// Optimistically update local state — no re-fetch needed
			setAllSalons((prev) =>
				prev.map((s) => (s.id === salonId ? { ...s, status: 'ACTIVE', isActive: true } : s))
			);
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
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await rejectSalon(salonId, reason, token);

			setAllSalons((prev) =>
				prev.map((s) => (s.id === salonId ? { ...s, status: 'REJECTED' } : s))
			);
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
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await suspendSalon(salonId, reason, token);

			setAllSalons((prev) =>
				prev.map((s) => (s.id === salonId ? { ...s, status: 'SUSPENDED', isActive: false } : s))
			);
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
			const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
			if (!token) throw new Error('No access token found.');

			await unsuspendSalon(salonId, token);

			setAllSalons((prev) =>
				prev.map((s) => (s.id === salonId ? { ...s, status: 'ACTIVE', isActive: true } : s))
			);
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
		</>
	);
}