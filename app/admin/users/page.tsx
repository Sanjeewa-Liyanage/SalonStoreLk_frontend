'use client';

import { useEffect, useMemo, useState, SyntheticEvent } from 'react';
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
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
    Tabs,
    Tab,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { getAllUsers, suspendUser, unsuspendUser, getUserById } from '@/lib/userService';
import SalonLoader from '@/components/Loader';
import ConfirmDialog from '@/components/ConfirmDialog';
import UserViewDialog from '@/components/UserViewDialog';

// Assuming basic user type based on common standard fields
interface User {
    _id?: string;
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    role: string;
    status: string;
}

const statusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    const normalized = status?.toUpperCase() || '';
    if (normalized === 'ACTIVE') return 'success';
    if (normalized === 'SUSPENDED') return 'error';
    return 'default';
};

const UserTable = ({ users, isDark, onView, onSuspend, onReactive }: { users: User[]; isDark: boolean; onView?: (id: string) => void; onSuspend?: (id: string) => void; onReactive?: (id: string) => void }) => {
    const headers = ['Name', 'Email', 'Role', 'Status'];
    if (onView || onSuspend || onReactive) headers.push('Actions');

    const cellSx = (extra?: object) => ({
        py: 1.6,
        px: 2,
        borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
        fontSize: '0.86rem',
        color: isDark ? '#cbd5e1' : '#334155',
        ...extra,
    });

    return (
        <Box sx={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
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
                    {users.map((user, idx) => {
                        const id = user.id || user._id || String(idx);
                        return (
                            <Box
                                component="tr"
                                key={id}
                                onClick={() => onView && onView(id)}
                                sx={{
                                    cursor: onView ? 'pointer' : 'default',
                                    '&:hover': {
                                        backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : 'rgba(167, 139, 250, 0.06)',
                                    },
                                }}
                            >
                                <Box component="td" sx={cellSx({ color: isDark ? '#e2e8f0' : '#1a1d2e', fontWeight: 600 })}>
                                    {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name'}
                                </Box>
                                <Box component="td" sx={cellSx()}>
                                    {user.email || '-'}
                                </Box>
                                <Box component="td" sx={cellSx()}>
                                    {user.role ? user.role.replace('_', ' ') : '-'}
                                </Box>
                                <Box component="td" sx={cellSx()}>
                                    {user.status && (
                                        <Chip
                                            size="small"
                                            label={user.status}
                                            color={statusColor(user.status)}
                                            sx={{ textTransform: 'capitalize' }}
                                        />
                                    )}
                                </Box>
                                {(onView || onSuspend || onReactive) && (
                                    <Box component="td" sx={cellSx()}>
                                        <Stack direction="row" spacing={1}>
                                            {onSuspend && user.status?.toUpperCase() !== 'SUSPENDED' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSuspend(id);
                                                    }}
                                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                                >
                                                    Suspend
                                                </Button>
                                            )}
                                            {onReactive && user.status?.toUpperCase() === 'SUSPENDED' && (
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onReactive(id);
                                                    }}
                                                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                                >
                                                    Reactive
                                                </Button>
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

export default function AdminUsersPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const muiTheme = useTheme();
    const { isDark } = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    // Identify the current tab from query parameters
    const roleParam = searchParams.get('role');
    const statusParam = searchParams.get('status');

    let activeTab = 'all';
    if (roleParam === 'SALON_OWNER') activeTab = 'salonOwners';
    else if (roleParam === 'CUSTOMER') activeTab = 'customers';
    else if (statusParam === 'SUSPENDED') activeTab = 'suspended';

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [suspendConfirmState, setSuspendConfirmState] = useState<string | null>(null);
    const [suspendReason, setSuspendReason] = useState('');
    const [reactiveConfirmState, setReactiveConfirmState] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const [viewTargetUserId, setViewTargetUserId] = useState<string | null>(null);
    const [viewTargetData, setViewTargetData] = useState<any | null>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [isLoadingView, setIsLoadingView] = useState(false);

    const requestView = async (userId: string) => {
        setIsViewOpen(true);
        setViewTargetUserId(userId);
        setIsLoadingView(true);
        setViewTargetData(null);
        try {
            const data = await getUserById(userId);
            setViewTargetData(data);
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Failed to fetch user details.');
        } finally {
            setIsLoadingView(false);
        }
    };

    const closeViewDialog = () => {
        setIsViewOpen(false);
        setViewTargetUserId(null);
        setViewTargetData(null);
    };

    const requestSuspend = (userId: string) => {
        setSuspendConfirmState(userId);
        setSuspendReason('');
    };

    const cancelSuspendConfirm = () => {
        if (processingId) return;
        setSuspendConfirmState(null);
    };

    const confirmSuspend = async () => {
        if (!suspendConfirmState) return;
        setProcessingId(suspendConfirmState);
        try {
            setError('');
            await suspendUser(suspendConfirmState, suspendReason.trim() || 'Rules violated');
            setRefreshTrigger((prev) => prev + 1);

            setUsers((prev) =>
                prev.map((u) => {
                    const id = u.id || u._id;
                    if (id === suspendConfirmState) return { ...u, status: 'SUSPENDED' };
                    return u;
                })
            );
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Failed to suspend user.');
        } finally {
            setProcessingId(null);
            setSuspendConfirmState(null);
        }
    };

    const suspendTargetUser = useMemo(
        () => users.find((u) => (u.id || u._id) === suspendConfirmState),
        [users, suspendConfirmState]
    );

    const requestReactive = (userId: string) => {
        setReactiveConfirmState(userId);
    };

    const cancelReactiveConfirm = () => {
        if (processingId) return;
        setReactiveConfirmState(null);
    };

    const confirmReactive = async () => {
        if (!reactiveConfirmState) return;
        setProcessingId(reactiveConfirmState);
        try {
            setError('');
            await unsuspendUser(reactiveConfirmState);
            setRefreshTrigger((prev) => prev + 1);

            setUsers((prev) =>
                prev.map((u) => {
                    const id = u.id || u._id;
                    if (id === reactiveConfirmState) return { ...u, status: 'ACTIVE' };
                    return u;
                })
            );
        } catch (err: any) {
            setError(err instanceof Error ? err.message : 'Failed to reactivate user.');
        } finally {
            setProcessingId(null);
            setReactiveConfirmState(null);
        }
    };

    const reactiveTargetUser = useMemo(
        () => users.find((u) => (u.id || u._id) === reactiveConfirmState),
        [users, reactiveConfirmState]
    );

    // Load users conditionally based on filters
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setError('');
            try {
                const filters: any = {};
                if (roleParam) filters.role = roleParam;
                if (statusParam) filters.status = statusParam;

                const payload = await getAllUsers(filters);
                const usersData = payload?.data || payload || [];
                setUsers(Array.isArray(usersData) ? usersData : []);
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : 'Something went wrong while fetching users');
            } finally {
                setLoading(false);
            }
        };

        loadUsers();
    }, [roleParam, statusParam, refreshTrigger]);

    // Reset search when changing tabs
    useEffect(() => {
        setSearch('');
        setPage(1);
    }, [activeTab]);

    // Simple local filter for search bar
    const filteredList = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return users;
        return users.filter(
            (u) =>
                (u.name || '').toLowerCase().includes(query) ||
                (u.firstName || '').toLowerCase().includes(query) ||
                (u.lastName || '').toLowerCase().includes(query) ||
                (u.email || '').toLowerCase().includes(query)
        );
    }, [users, search]);

    const totalPages = Math.max(1, Math.ceil(filteredList.length / rowsPerPage));
    const paginatedList = filteredList.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleTabChange = (_: SyntheticEvent, value: string) => {
        let href = '/admin/users';
        if (value === 'salonOwners') href += '?role=SALON_OWNER';
        else if (value === 'customers') href += '?role=CUSTOMER';
        else if (value === 'suspended') href += '?status=SUSPENDED';
        router.push(href, { scroll: false });
    };

    if (loading && users.length === 0) {
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
                    <HeaderAdmin pageTitle="Users" pageSubtitle="Manage platform accounts and view users." />

                    <Box
                        component="main"
                        sx={{ flex: 1, overflow: 'auto', backgroundColor: isDark ? '#0d0f1a' : '#f9fafb' }}
                    >
                        <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, sm: 3, md: 4 } }}>
                            <Stack spacing={3}>
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
                                            <Tab value="all" label="All Users" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                            <Tab value="salonOwners" label="Salon Owners" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                            <Tab value="customers" label="Customers" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                            <Tab value="suspended" label="Suspended" sx={{ textTransform: 'none', fontWeight: 600 }} />
                                        </Tabs>
                                    </Box>

                                    <CardContent>
                                        <Stack spacing={2}>
                                            <TextField
                                                placeholder="Search by name or email"
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

                                            {error && <Alert severity="error">{error}</Alert>}

                                            {paginatedList.length === 0 && !loading ? (
                                                <Alert severity="info">
                                                    {filteredList.length === 0 && search
                                                        ? 'No users found matching your search.'
                                                        : 'No users found in this category.'}
                                                </Alert>
                                            ) : (
                                                <UserTable
                                                    users={paginatedList}
                                                    isDark={isDark}
                                                    onView={requestView}
                                                    onSuspend={
                                                        (activeTab === 'salonOwners' || activeTab === 'customers')
                                                            ? requestSuspend
                                                            : undefined
                                                    }
                                                    onReactive={
                                                        (activeTab === 'suspended' || activeTab === 'all')
                                                            ? requestReactive
                                                            : undefined
                                                    }
                                                />
                                            )}

                                            {loading && users.length > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Refreshing user data...
                                                    </Typography>
                                                </Box>
                                            )}

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

            <ConfirmDialog
                open={Boolean(suspendConfirmState)}
                title="Suspend User"
                message={
                    <>
                        {suspendTargetUser
                            ? `Are you sure you want to suspend user "${suspendTargetUser.name || suspendTargetUser.email || 'this user'}"?`
                            : 'Are you sure you want to suspend this user?'}
                        <TextField
                            size="small"
                            label="Reason for Suspension"
                            placeholder='e.g. Rules violated'
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            multiline
                            minRows={2}
                            maxRows={4}
                            fullWidth
                            sx={{ mt: 2 }}
                        />
                    </>
                }
                variant="danger"
                confirmLabel="Yes, Suspend"
                cancelLabel="Cancel"
                onConfirm={confirmSuspend}
                onCancel={cancelSuspendConfirm}
                loading={processingId === suspendConfirmState}
            />

            <ConfirmDialog
                open={Boolean(reactiveConfirmState)}
                title="Reactive User"
                message={
                    <>
                        {reactiveTargetUser
                            ? `Are you sure you want to reactive user "${reactiveTargetUser.name || reactiveTargetUser.email || 'this user'}"?`
                            : 'Are you sure you want to reactive this user?'}
                    </>
                }
                variant="success"
                confirmLabel="Yes, Reactive"
                cancelLabel="Cancel"
                onConfirm={confirmReactive}
                onCancel={cancelReactiveConfirm}
                loading={processingId === reactiveConfirmState}
            />

            <UserViewDialog
                open={isViewOpen}
                user={viewTargetData}
                loading={isLoadingView}
                onClose={closeViewDialog}
            />
        </>
    );
}
