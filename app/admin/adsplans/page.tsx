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
	IconButton,
	InputAdornment,
	Pagination,
	Stack,
	Tab,
	Tabs,
	TextField,
	Tooltip,
	Typography,
	useMediaQuery,
	useTheme,
} from '@mui/material';
import {
	Add as AddIcon,
	DeleteOutline as DeleteOutlineIcon,
	EditOutlined as EditOutlinedIcon,
	LocalOfferOutlined as LocalOfferOutlinedIcon,
	Search as SearchIcon,
	StarOutline as StarOutlineIcon,
	VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { createPlan, deletePlan, fetchAllPlans, updatePlan } from '@/lib/planService';
import SalonLoader from '@/components/Loader';
import PlanDetailsDialog from '@/components/PlanDetailsDialog';
import PlanDeleteDialog from '@/components/PlanDeleteDialog';
import PlanUpdateDialog from '@/components/PlanUpdateDialog';
import PlanCreateDialog from '@/components/PlanCreateDialog';
import { PlanState } from '@/lib/types';

interface PlanTimestamp {
	_seconds: number;
	_nanoseconds: number;
}

interface Plan {
	id: string;
	planName: string;
	planCode: string;
	description: string;
	state: string;
	price: number;
	features: string[];
	createdAt?: PlanTimestamp;
	updatedAt?: PlanTimestamp;
	duration: number;
	priority: number;
}

interface PlanPagination {
	currentPage: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

interface PlanResponse {
	data: Plan[];
	pagination?: PlanPagination;
}

interface UpdatePlanPayload {
	planName: string;
	description: string;
	state: PlanState;
	price: number;
	features: string[];
	duration: number;
	priority: number;
}

type PlanTab = 'all' | 'active' | 'inactive';

const normalizePlanTab = (value: string | null): PlanTab => {
	if (value === 'active' || value === 'inactive' || value === 'all') return value;
	return 'all';
};

const formatDate = (createdAt?: PlanTimestamp) => {
	if (!createdAt?._seconds) return '-';
	return new Date(createdAt._seconds * 1000).toLocaleDateString();
};

const formatPrice = (price: number) =>
	new Intl.NumberFormat('en-LK', {
		style: 'currency',
		currency: 'LKR',
		maximumFractionDigits: 0,
	}).format(price);

const PlanTable = ({
	plans,
	isDark,
	onView,
	onUpdate,
	onDelete,
}: {
	plans: Plan[];
	isDark: boolean;
	onView: (id: string) => void;
	onUpdate: (id: string) => void;
	onDelete: (id: string) => void;
}) => {
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
			<Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 1040 }}>
				<Box component="thead" sx={{ backgroundColor: isDark ? '#0f1322' : '#f8fafc' }}>
					<Box component="tr">
						{['Plan Code', 'Plan Name', 'Duration', 'Priority', 'Price', 'Status', 'Created', 'Actions'].map((header) => (
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
					{plans.map((plan) => (
						<Box
							component="tr"
							key={plan.id}
							sx={{
								'&:hover': {
									backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(167, 139, 250, 0.06)',
								},
							}}
						>
							<Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e' })}>
								{plan.planCode}
							</Box>
							<Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e', fontWeight: 600 })}>
								{plan.planName}
							</Box>
							<Box component="td" sx={cellSx()}>
								{plan.duration} days
							</Box>
							<Box component="td" sx={cellSx()}>
								P{plan.priority}
							</Box>
							<Box component="td" sx={cellSx({ fontWeight: 600 })}>
								{formatPrice(plan.price)}
							</Box>
							<Box component="td" sx={cellSx()}>
								<Chip
									size="small"
									label={plan.state.replaceAll('_', ' ')}
									color={plan.state.toUpperCase() === 'ACTIVE' ? 'success' : 'default'}
									sx={{ textTransform: 'capitalize' }}
								/>
							</Box>
							<Box component="td" sx={cellSx({ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' })}>
								{formatDate(plan.createdAt)}
							</Box>
							<Box component="td" sx={cellSx()}>
								<Stack direction="row" spacing={0.5}>
									<Tooltip title="View">
										<IconButton size="small" onClick={() => onView(plan.id)}>
											<VisibilityOutlinedIcon sx={{ fontSize: '1rem', color: isDark ? '#8ea0c4' : '#64748b' }} />
										</IconButton>
									</Tooltip>
									<Tooltip title="Update">
										<IconButton size="small" onClick={() => onUpdate(plan.id)}>
											<EditOutlinedIcon sx={{ fontSize: '1rem', color: '#f59e0b' }} />
										</IconButton>
									</Tooltip>
									<Tooltip title="Delete">
										<IconButton size="small" onClick={() => onDelete(plan.id)}>
											<DeleteOutlineIcon sx={{ fontSize: '1rem', color: '#ef4444' }} />
										</IconButton>
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

export default function AdminAdsPlansPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const muiTheme = useTheme();
	const { isDark } = useMuiTheme();
	const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

	const [plans, setPlans] = useState<Plan[]>([]);
	const [paginationData, setPaginationData] = useState<PlanPagination | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [actionError, setActionError] = useState<string | null>(null);

	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const rowsPerPage = 8;

	const [viewPlanId, setViewPlanId] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [updatePlanId, setUpdatePlanId] = useState<string | null>(null);
	const [deletePlanId, setDeletePlanId] = useState<string | null>(null);
	const [deleteLoading, setDeleteLoading] = useState(false);

	const activeTab = normalizePlanTab(searchParams.get('tab'));

	useEffect(() => {
		const loadPlans = async () => {
			setLoading(true);
			setError('');
			try {
				const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
				if (!token) throw new Error('No access token found. Please login again.');

				const payload = (await fetchAllPlans(token)) as PlanResponse;
				setPlans(Array.isArray(payload?.data) ? payload.data : []);
				setPaginationData(payload?.pagination ?? null);
			} catch (fetchError) {
				setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong');
			} finally {
				setLoading(false);
			}
		};

		loadPlans();
	}, []);

	useEffect(() => {
		setSearch('');
		setPage(1);
	}, [activeTab]);

	const activePlans = useMemo(() => plans.filter((plan) => plan.state.toUpperCase() === 'ACTIVE'), [plans]);
	const inactivePlans = useMemo(() => plans.filter((plan) => plan.state.toUpperCase() !== 'ACTIVE'), [plans]);

	const counts = useMemo(
		() => ({
			total: plans.length,
			active: activePlans.length,
			inactive: inactivePlans.length,
		}),
		[plans, activePlans.length, inactivePlans.length]
	);

	const currentList = useMemo(() => {
		switch (activeTab) {
			case 'active':
				return activePlans;
			case 'inactive':
				return inactivePlans;
			default:
				return plans;
		}
	}, [activeTab, plans, activePlans, inactivePlans]);

	const filteredList = useMemo(() => {
		const query = search.toLowerCase().trim();
		if (!query) return currentList;
		return currentList.filter(
			(plan) =>
				plan.planName.toLowerCase().includes(query) ||
				plan.planCode.toLowerCase().includes(query) ||
				plan.description.toLowerCase().includes(query)
		);
	}, [currentList, search]);

	const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
	const paginatedList = filteredList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

	const selectedPlan = useMemo(() => plans.find((plan) => plan.id === viewPlanId) ?? null, [plans, viewPlanId]);
	const selectedPlanForUpdate = useMemo(() => plans.find((plan) => plan.id === updatePlanId) ?? null, [plans, updatePlanId]);
	const deleteTargetPlan = useMemo(() => plans.find((plan) => plan.id === deletePlanId) ?? null, [plans, deletePlanId]);

	const handleTabChange = (_: SyntheticEvent, value: PlanTab) => {
		const href = value === 'all' ? '/admin/adsplans' : `/admin/adsplans?tab=${value}`;
		router.push(href, { scroll: false });
	};

	const handleCreate = () => {
		setActionError(null);
		setCreateDialogOpen(true);
	};

	const handleCreateSubmit = async (payload: UpdatePlanPayload) => {
		const response = await createPlan(payload);
		const createdPlan = response?.data ?? response?.plan ?? response?.createdPlan ?? response ?? null;

		if (createdPlan && createdPlan.id) {
			setPlans((prev) => [createdPlan, ...prev]);
		} else {
			// Fallback keeps UI responsive even if backend omits created object in response.
			setPlans((prev) => [
				{
					id: `tmp-${Date.now()}`,
					planCode: 'PENDING-CODE',
					createdAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
					updatedAt: { _seconds: Math.floor(Date.now() / 1000), _nanoseconds: 0 },
					...payload,
				},
				...prev,
			]);
		}

		setCreateDialogOpen(false);
	};

	const handleUpdate = (planId: string) => {
		setActionError(null);
		setUpdatePlanId(planId);
	};

	const handleUpdateSubmit = async (planId: string, payload: UpdatePlanPayload) => {
		const response = await updatePlan(planId, payload);
		const serverPlan = response?.data ?? response?.plan ?? response?.updatedPlan ?? null;

		setPlans((prev) =>
			prev.map((plan) => {
				if (plan.id !== planId) return plan;
				if (serverPlan) {
					return {
						...plan,
						...serverPlan,
					};
				}
				return {
					...plan,
					...payload,
				};
			})
		);

		setUpdatePlanId(null);
	};

	const handleDeleteRequest = (planId: string) => {
		setDeletePlanId(planId);
	};

	const handleDeleteConfirm = async () => {
		if (!deletePlanId) return;
		try {
			setDeleteLoading(true);
			setActionError(null);
			await deletePlan(deletePlanId);
			setPlans((prev) => prev.filter((plan) => plan.id !== deletePlanId));
			setDeletePlanId(null);
		} catch (deleteError) {
			setActionError(deleteError instanceof Error ? deleteError.message : 'Failed to delete plan.');
		} finally {
			setDeleteLoading(false);
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
						pageTitle="Ads Plans"
						pageSubtitle="Manage advertisement plans and monitor plan availability."
					/>

					<Box component="main" sx={{ flex: 1, overflow: 'auto', backgroundColor: isDark ? '#0d0f1a' : '#f9fafb' }}>
						<Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
							<Stack spacing={3}>
								<Box
									sx={{
										display: 'grid',
										gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0,1fr))' },
										gap: 2,
									}}
								>
									{[
										{ label: 'Total Plans', value: counts.total, icon: <LocalOfferOutlinedIcon sx={{ color: '#a78bfa' }} /> },
										{ label: 'Active Plans', value: counts.active, icon: <StarOutlineIcon sx={{ color: '#10b981' }} /> },
										{ label: 'Inactive Plans', value: counts.inactive, icon: <DeleteOutlineIcon sx={{ color: '#f59e0b' }} /> },
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

								<Card
									sx={{
										borderRadius: '12px',
										backgroundColor: isDark ? '#141828' : '#ffffff',
										border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
									}}
								>
									<Box sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`, px: 2 }}>
										<Tabs value={activeTab} onChange={handleTabChange} sx={{ '& .MuiTabs-indicator': { backgroundColor: '#a78bfa' } }}>
											{(['all', 'active', 'inactive'] as PlanTab[]).map((tab) => (
												<Tab
													key={tab}
													value={tab}
													label={tab === 'all' ? 'All Plans' : tab === 'active' ? 'Active Plans' : 'Inactive Plans'}
													sx={{ textTransform: 'none', fontWeight: 600 }}
												/>
											))}
										</Tabs>
									</Box>

									<CardContent>
										<Stack spacing={2}>
											<Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
												<TextField
													placeholder="Search by plan name, plan code, or description"
													value={search}
													onChange={(event) => {
														setSearch(event.target.value);
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
														maxWidth: { xs: '100%', sm: 420 },
														'& .MuiOutlinedInput-root': {
															borderRadius: '8px',
															backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
															'& fieldset': { borderColor: isDark ? '#1e2440' : '#eaecf5' },
														},
													}}
												/>

												<Button
													variant="contained"
													startIcon={<AddIcon />}
													onClick={handleCreate}
													sx={{
														textTransform: 'none',
														fontWeight: 600,
														borderRadius: '8px',
														backgroundColor: '#a78bfa',
														'&:hover': { backgroundColor: '#8b5cf6' },
													}}
												>
													Create Plan
												</Button>
											</Stack>

											{error && <Alert severity="error">{error}</Alert>}
											{actionError && <Alert severity="warning">{actionError}</Alert>}

											{paginatedList.length === 0 ? (
												<Alert severity="info">
													{filteredList.length === 0 && search
														? 'No plans found for your search.'
														: `No ${activeTab === 'all' ? '' : activeTab + ' '}plans found.`}
												</Alert>
											) : (
												<PlanTable
													plans={paginatedList}
													isDark={isDark}
													onView={setViewPlanId}
													onUpdate={handleUpdate}
													onDelete={handleDeleteRequest}
												/>
											)}

											<Stack direction="row" justifyContent="space-between" alignItems="center">
												<Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
													{paginationData
														? `API Total: ${paginationData.totalItems} plans`
														: `Showing ${filteredList.length} plans`}
												</Typography>
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

			<PlanDetailsDialog
				open={Boolean(selectedPlan)}
				onClose={() => setViewPlanId(null)}
				plan={selectedPlan}
			/>

			<PlanDeleteDialog
				open={Boolean(deletePlanId)}
				onClose={() => {
					if (deleteLoading) return;
					setDeletePlanId(null);
				}}
				onConfirm={handleDeleteConfirm}
				planName={deleteTargetPlan?.planName}
				loading={deleteLoading}
			/>

			<PlanUpdateDialog
				open={Boolean(updatePlanId)}
				onClose={() => setUpdatePlanId(null)}
				plan={selectedPlanForUpdate}
				onSubmit={handleUpdateSubmit}
			/>

			<PlanCreateDialog
				open={createDialogOpen}
				onClose={() => setCreateDialogOpen(false)}
				onSubmit={handleCreateSubmit}
			/>
		</>
	);
}
