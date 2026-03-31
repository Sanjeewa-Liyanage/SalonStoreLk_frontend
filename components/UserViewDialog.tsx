'use client';

import {
	Dialog,
	DialogContent,
	DialogTitle,
	Box,
	Typography,
	Button,
	Chip,
	Divider,
	Stack,
	IconButton,
	Card,
	CardContent,
} from '@mui/material';
import {
	Close as CloseIcon,
	Phone as PhoneIcon,
	Email as EmailIcon,
	Person as PersonIcon,
	Store as StoreIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import Loader from './Loader';

interface SalonService {
    name: string;
    price: number;
    duration: number;
}

interface LocationData {
    latitude: number;
    longitude: number;
}

interface CreatedAt {
    _seconds: number;
    _nanoseconds: number;
}

interface SalonDetail {
    id: string;
    salonCode: string;
    salonName: string;
    description: string;
    address: string;
    city: string;
    phoneNumber: string;
    location?: LocationData;
    status: string;
    createdAt?: CreatedAt;
    updatedAt?: CreatedAt;
    isActive: boolean;
    ownerId?: string;
    services?: SalonService[];
    images?: string[];
    openingTime?: string;
    closingTime?: string;
}

interface UserDetail {
	id: string;
	userCode: string;
	email: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	role: string;
	registeredAt: string;
	isActive: boolean;
	status: string;
	businessLicense?: string;
	isVerified: boolean;
	accountType: string;
    salons: SalonDetail[];
}

interface UserViewDialogProps {
	open: boolean;
	user: UserDetail | null;
	loading?: boolean;
	onClose: () => void;
}

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	const normalized = status?.toUpperCase() || '';
	if (normalized === 'ACTIVE') return 'success';
	if (normalized === 'SUSPENDED') return 'error';
	return 'default';
};

const formatDate = (dateString?: string): string => {
	if (!dateString) return '-';
	try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
};

export default function UserViewDialog({
	open,
	user,
	loading = false,
	onClose,
}: UserViewDialogProps) {
	const { isDark } = useMuiTheme();

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			PaperProps={{
				sx: {
					backgroundColor: isDark ? '#0f1419' : '#ffffff',
					backgroundImage: 'none',
					maxHeight: '90vh',
					borderRadius: '12px',
					border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
				},
			}}
		>
			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
					<Loader />
				</Box>
			) : user ? (
				<>
					<DialogTitle
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							paddingBottom: 1,
							borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
						}}
					>
						<Box>
							<Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b' }}>
                                {user.firstName || ''} {user.lastName || ''}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginTop: 0.5 }}
							>
								{user.userCode}
							</Typography>
						</Box>
						<Stack direction="row" spacing={1} alignItems="center">
							<Chip
								label={user.status || 'UNKNOWN'}
								color={getStatusColor(user.status)}
								size="small"
								variant="filled"
							/>
                            {user.isVerified && (
                                <Chip label="Verified" color="primary" size="small" variant="outlined" />
                            )}
                            <Chip label={(user.role || '').replace('_', ' ')} color="default" size="small" variant="outlined" />
							<IconButton size="small" onClick={onClose} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Stack>
					</DialogTitle>

					<DialogContent sx={{ paddingTop: 3 }}>
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3, marginBottom: 2 }}>
							{/* Email */}
							<Stack direction="row" spacing={1.5} alignItems="flex-start">
								<EmailIcon sx={{ fontSize: '1.1rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.2 }} />
								<Box>
									<Typography
										variant="caption"
										sx={{
											color: isDark ? '#94a3b8' : '#64748b',
											textTransform: 'uppercase',
											fontSize: '0.75rem',
											fontWeight: 500,
											letterSpacing: '0.5px',
										}}
									>
										Email Address
									</Typography>
									<Typography sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500, marginTop: 0.5 }}>
										{user.email || '-'}
									</Typography>
								</Box>
							</Stack>

							{/* Phone Number */}
							<Stack direction="row" spacing={1.5} alignItems="flex-start">
								<PhoneIcon sx={{ fontSize: '1.1rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.2 }} />
								<Box>
									<Typography
										variant="caption"
										sx={{
											color: isDark ? '#94a3b8' : '#64748b',
											textTransform: 'uppercase',
											fontSize: '0.75rem',
											fontWeight: 500,
											letterSpacing: '0.5px',
										}}
									>
										Phone Number
									</Typography>
									<Typography sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500, marginTop: 0.5 }}>
										{user.phoneNumber || '-'}
									</Typography>
								</Box>
							</Stack>
                            
                            {/* Account Type */}
							<Stack direction="row" spacing={1.5} alignItems="flex-start">
								<PersonIcon sx={{ fontSize: '1.1rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.2 }} />
								<Box>
									<Typography
										variant="caption"
										sx={{
											color: isDark ? '#94a3b8' : '#64748b',
											textTransform: 'uppercase',
											fontSize: '0.75rem',
											fontWeight: 500,
											letterSpacing: '0.5px',
										}}
									>
										Account Type
									</Typography>
									<Typography sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 500, marginTop: 0.5, textTransform: 'capitalize' }}>
										{user.accountType || '-'}
									</Typography>
								</Box>
							</Stack>
						</Box>

						{/* Salons List */}
						{user.salons && user.salons.length > 0 && (
                            <>
                                <Divider sx={{ my: 3, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
                                <Box sx={{ marginBottom: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                        <StoreIcon sx={{ fontSize: '1.2rem', color: isDark ? '#e2e8f0' : '#1e293b' }} />
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                fontWeight: 600,
                                                color: isDark ? '#e2e8f0' : '#1e293b',
                                            }}
                                        >
                                            Registered Salons ({user.salons.length})
                                        </Typography>
                                    </Stack>
                                    
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                                        {user.salons.map((salon) => (
                                            <Card
                                                key={salon.id}
                                                sx={{
                                                    backgroundColor: isDark ? '#141828' : '#f8fafc',
                                                    border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                        <Box>
                                                            <Typography sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.95rem' }}>
                                                                {salon.salonName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                                {salon.salonCode}
                                                            </Typography>
                                                        </Box>
                                                        <Chip 
                                                            label={salon.status} 
                                                            size="small" 
                                                            color={getStatusColor(salon.status)} 
                                                            sx={{ height: 20, fontSize: '0.65rem' }} 
                                                        />
                                                    </Box>
                                                    <Divider sx={{ my: 1, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
                                                    <Typography variant="body2" sx={{ color: isDark ? '#cbd5e1' : '#334155', mb: 0.5 }}>
                                                        <strong>Location:</strong> {salon.city} ({salon.address.substring(0, 30)}{salon.address.length > 30 ? '...' : ''})
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                                                        <strong>Phone:</strong> {salon.phoneNumber}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Box>
                                </Box>
                            </>
                        )}

						{/* Metadata */}
						<Divider sx={{ my: 3, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
						<Box sx={{ marginBottom: 1 }}>
							<Typography
								variant="caption"
								sx={{
									color: isDark ? '#94a3b8' : '#64748b',
									fontSize: '0.75rem',
									fontWeight: 500,
									letterSpacing: '0.5px',
								}}
							>
								Registered On: {formatDate(user.registeredAt)}
							</Typography>
						</Box>
					</DialogContent>

					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							padding: 2,
							borderTop: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
						}}
					>
						<Button variant="outlined" onClick={onClose} sx={{ 
                            borderRadius: '8px', 
                            textTransform: 'none', 
                            borderColor: isDark ? '#1e2440' : '#e2e8f0',
                            color: isDark ? '#e2e8f0' : '#475569'
                        }}>
							Close
						</Button>
					</Box>
				</>
			) : (
				<DialogContent>
					<Typography color="error">User details not available</Typography>
				</DialogContent>
			)}
		</Dialog>
	);
}
