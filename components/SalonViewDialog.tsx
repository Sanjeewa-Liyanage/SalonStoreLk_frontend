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
	Link,
} from '@mui/material';
import {
	Close as CloseIcon,
	Phone as PhoneIcon,
	LocationOn as LocationOnIcon,
	AccessTime as AccessTimeIcon,
	WhatsApp as WhatsAppIcon,
	Language as LanguageIcon,
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
	overview?: string;
	description: string;
	address: string;
	city: string;
	phoneNumber: string;
	location?: LocationData;
	status: string;
	createdAt?: CreatedAt;
	isActive: boolean;
	ownerId?: string;
	ownerName?: string;
	services?: SalonService[];
	images?: string[];
	openingTime?: string;
	closingTime?: string;
	contactInfo?: {
		phoneNumber?: string;
		whatsappNumber?: string;
	};
	socialMediaLinks?: {
		facebook?: string;
		instagram?: string;
		tiktok?: string;
		youtube?: string;
	};
}

interface SalonViewDialogProps {
	open: boolean;
	salon: SalonDetail | null;
	loading?: boolean;
	onClose: () => void;
}

const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
	const normalized = status.toUpperCase();
	if (normalized === 'ACTIVE') return 'success';
	if (normalized.includes('PENDING')) return 'warning';
	if (normalized.includes('REJECTED')) return 'error';
	if (normalized === 'SUSPENDED') return 'error';
	return 'default';
};

const getStatusLabel = (status: string): string => {
	const normalized = status.toUpperCase();
	if (normalized === 'PENDING_VERIFICATION') return 'Pending';
	if (normalized.includes('PENDING')) return 'Pending';
	return normalized;
};

const formatTime = (timeString?: string): string => {
	if (!timeString) return '-';
	try {
		const date = new Date(timeString);
		return date.toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true,
		});
	} catch {
		return timeString;
	}
};

const formatDate = (createdAt?: CreatedAt): string => {
	if (!createdAt?._seconds) return '-';
	return new Date(createdAt._seconds * 1000).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

export default function SalonViewDialog({
	open,
	salon,
	loading = false,
	onClose,
}: SalonViewDialogProps) {
	const { isDark } = useMuiTheme();

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="sm"
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
			) : salon ? (
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
								{salon.salonName}
							</Typography>
							<Typography
								variant="caption"
								sx={{ color: isDark ? '#94a3b8' : '#64748b', display: 'block', marginTop: 0.5 }}
							>
								{salon.salonCode}
							</Typography>
						</Box>
						<Stack direction="row" spacing={1} alignItems="center">
							<Chip
								label={getStatusLabel(salon.status)}
								color={getStatusColor(salon.status)}
								size="small"
								variant="filled"
							/>
							<IconButton size="small" onClick={onClose} sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Stack>
					</DialogTitle>

					<DialogContent sx={{ paddingTop: 2 }}>
						{/* Gallery */}
						{salon.images && salon.images.length > 0 && (
							<Box sx={{ marginBottom: 3 }}>
								<Typography
									variant="subtitle2"
									sx={{
										fontWeight: 600,
										marginBottom: 1,
										color: isDark ? '#e2e8f0' : '#1e293b',
										textTransform: 'uppercase',
										fontSize: '0.75rem',
										letterSpacing: '0.5px',
									}}
								>
									Photos
								</Typography>
								<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
									{salon.images.map((image, index) => (
										<Box
											key={index}
											sx={{
												position: 'relative',
												paddingBottom: '100%',
												backgroundColor: isDark ? '#1e2440' : '#f1f5f9',
												borderRadius: '6px',
												overflow: 'hidden',
												border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
											}}
										>
											<Box
												component="img"
												src={image}
												alt={`Salon image ${index + 1}`}
												sx={{
													position: 'absolute',
													top: 0,
													left: 0,
													width: '100%',
													height: '100%',
													objectFit: 'cover',
												}}
											/>
										</Box>
									))}
								</Box>
							</Box>
						)}

						<Divider sx={{ my: 2, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />

						{/* Basic Info */}
						<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, marginBottom: 2 }}>
							{/* Owner */}
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
									Owner
								</Typography>
								<Typography
									sx={{
										color: isDark ? '#e2e8f0' : '#1e293b',
										fontWeight: 500,
										marginTop: 0.5,
									}}
								>
									{salon.ownerName || '-'}
								</Typography>
							</Box>

							{/* Phone */}
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<PhoneIcon
									sx={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.3 }}
								/>
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
										Phone
									</Typography>
									<Typography
										sx={{
											color: isDark ? '#e2e8f0' : '#1e293b',
											fontWeight: 500,
											marginTop: 0.5,
										}}
									>
										{salon.phoneNumber || '-'}
									</Typography>
								</Box>
							</Stack>

							{/* City */}
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<LocationOnIcon
									sx={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.3 }}
								/>
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
										City
									</Typography>
									<Typography
										sx={{
											color: isDark ? '#e2e8f0' : '#1e293b',
											fontWeight: 500,
											marginTop: 0.5,
										}}
									>
										{salon.city || '-'}
									</Typography>
								</Box>
							</Stack>

							{/* Hours */}
							<Stack direction="row" spacing={1} alignItems="flex-start">
								<AccessTimeIcon
									sx={{ fontSize: '0.9rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: 0.3 }}
								/>
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
										Hours
									</Typography>
									<Typography
										sx={{
											color: isDark ? '#e2e8f0' : '#1e293b',
											fontWeight: 500,
											marginTop: 0.5,
											fontSize: '0.875rem',
										}}
									>
										{formatTime(salon.openingTime)} — {formatTime(salon.closingTime)}
									</Typography>
								</Box>
							</Stack>
						</Box>

						<Divider sx={{ my: 2, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />

						{/* Address */}
						<Box sx={{ marginBottom: 2 }}>
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
								Address
							</Typography>
							<Typography
								sx={{
									color: isDark ? '#e2e8f0' : '#1e293b',
									marginTop: 0.5,
									wordBreak: 'break-word',
								}}
							>
								{salon.address || '-'}
							</Typography>
						</Box>

						{/* Description */}
						<Box sx={{ marginBottom: 2 }}>
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
								Description
							</Typography>
							<Typography
								sx={{
									color: isDark ? '#e2e8f0' : '#1e293b',
									marginTop: 0.5,
									wordBreak: 'break-word',
								}}
							>
								{salon.description || '-'}
							</Typography>
						</Box>

						{/* Overview */}
						{salon.overview && (
							<Box sx={{ marginBottom: 2 }}>
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
									Overview
								</Typography>
								<Typography
									sx={{
										color: isDark ? '#e2e8f0' : '#1e293b',
										marginTop: 0.5,
										wordBreak: 'break-word',
									}}
								>
									{salon.overview}
								</Typography>
							</Box>
						)}

						{/* Contact Information */}
						{salon.contactInfo && (
							<Box sx={{ marginBottom: 2, backgroundColor: isDark ? '#1a202c' : '#f0f4f8', padding: 2, borderRadius: 1 }}>
								<Typography
									variant="caption"
									sx={{
										color: isDark ? '#94a3b8' : '#64748b',
										textTransform: 'uppercase',
										fontSize: '0.75rem',
										fontWeight: 500,
										letterSpacing: '0.5px',
										display: 'block',
										marginBottom: 1,
									}}
								>
									Contact Information
								</Typography>
								<Stack spacing={1}>
									{salon.contactInfo.phoneNumber && (
										<Stack direction="row" spacing={1} alignItems="center">
											<PhoneIcon sx={{ fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' }} />
											<Box>
												<Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
													Main Phone
												</Typography>
												<Typography sx={{ color: isDark ? '#e2e8f0' : '#1e293b', fontSize: '0.875rem' }}>
													{salon.contactInfo.phoneNumber}
												</Typography>
											</Box>
										</Stack>
									)}
									{salon.contactInfo.whatsappNumber && (
										<Stack direction="row" spacing={1} alignItems="center">
											<WhatsAppIcon sx={{ fontSize: '0.85rem', color: '#25D366' }} />
											<Box>
												<Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
													WhatsApp
												</Typography>
												<Link
													href={`https://wa.me/${salon.contactInfo.whatsappNumber.replace(/\D/g, '')}`}
													target="_blank"
													rel="noopener noreferrer"
													sx={{ color: '#25D366', fontSize: '0.875rem', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
												>
													{salon.contactInfo.whatsappNumber}
												</Link>
											</Box>
										</Stack>
									)}
								</Stack>
							</Box>
						)}

						{/* Services */}
						{salon.services && salon.services.length > 0 && (
							<Box sx={{ marginBottom: 2 }}>
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
									Services
								</Typography>
								<Stack spacing={1} sx={{ marginTop: 1 }}>
									{salon.services.map((service, index) => (
										<Card
											key={index}
											sx={{
												backgroundColor: isDark ? '#1a202c' : '#f8fafc',
												border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
											}}
										>
											<CardContent sx={{ padding: '12px 16px !important' }}>
												<Stack direction="row" justifyContent="space-between" alignItems="center">
													<Box>
														<Typography
															variant="body2"
															sx={{
																color: isDark ? '#e2e8f0' : '#1e293b',
																fontWeight: 500,
															}}
														>
															{service.name}
														</Typography>
														<Typography
															variant="caption"
															sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
														>
															{service.duration} min
														</Typography>
													</Box>
													<Typography
														variant="body2"
														sx={{
															color: isDark ? '#86efac' : '#16a34a',
															fontWeight: 600,
														}}
													>
														Rs {service.price.toLocaleString()}
													</Typography>
												</Stack>
											</CardContent>
										</Card>
									))}
								</Stack>
							</Box>
						)}

						{/* Social Media Links */}
						{salon.socialMediaLinks && Object.values(salon.socialMediaLinks).some(link => link) && (
							<Box sx={{ marginBottom: 2, backgroundColor: isDark ? '#1a202c' : '#f0f4f8', padding: 2, borderRadius: 1 }}>
								<Typography
									variant="caption"
									sx={{
										color: isDark ? '#94a3b8' : '#64748b',
										textTransform: 'uppercase',
										fontSize: '0.75rem',
										fontWeight: 500,
										letterSpacing: '0.5px',
										display: 'block',
										marginBottom: 1,
									}}
								>
									Follow Us
								</Typography>
								<Stack direction="row" spacing={1} flexWrap="wrap">
									{salon.socialMediaLinks.facebook && (
										<Link
											href={salon.socialMediaLinks.facebook}
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.5,
												padding: '6px 12px',
												backgroundColor: isDark ? '#263238' : '#e3f2fd',
												borderRadius: '6px',
												textDecoration: 'none',
												fontSize: '0.75rem',
												color: '#1976d2',
												'&:hover': { backgroundColor: isDark ? '#37474f' : '#bbdefb' },
											}}
										>
											<LanguageIcon sx={{ fontSize: '0.9rem' }} /> Facebook
										</Link>
									)}
									{salon.socialMediaLinks.instagram && (
										<Link
											href={salon.socialMediaLinks.instagram}
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.5,
												padding: '6px 12px',
												backgroundColor: isDark ? '#263238' : '#f3e5f5',
												borderRadius: '6px',
												textDecoration: 'none',
												fontSize: '0.75rem',
												color: '#e91e63',
												'&:hover': { backgroundColor: isDark ? '#37474f' : '#f1f0f2' },
											}}
										>
											<LanguageIcon sx={{ fontSize: '0.9rem' }} /> Instagram
										</Link>
									)}
									{salon.socialMediaLinks.tiktok && (
										<Link
											href={salon.socialMediaLinks.tiktok}
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.5,
												padding: '6px 12px',
												backgroundColor: isDark ? '#263238' : '#f5f5f5',
												borderRadius: '6px',
												textDecoration: 'none',
												fontSize: '0.75rem',
												color: '#000',
												'&:hover': { backgroundColor: isDark ? '#37474f' : '#eeeeee' },
											}}
										>
											<LanguageIcon sx={{ fontSize: '0.9rem' }} /> TikTok
										</Link>
									)}
									{salon.socialMediaLinks.youtube && (
										<Link
											href={salon.socialMediaLinks.youtube}
											target="_blank"
											rel="noopener noreferrer"
											sx={{
												display: 'inline-flex',
												alignItems: 'center',
												gap: 0.5,
												padding: '6px 12px',
												backgroundColor: isDark ? '#263238' : '#ffebee',
												borderRadius: '6px',
												textDecoration: 'none',
												fontSize: '0.75rem',
												color: '#ff0000',
												'&:hover': { backgroundColor: isDark ? '#37474f' : '#ffcdd2' },
											}}
										>
											<LanguageIcon sx={{ fontSize: '0.9rem' }} /> YouTube
										</Link>
									)}
								</Stack>
							</Box>
						)}

						{/* Metadata */}
						<Divider sx={{ my: 2, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
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
								Created {formatDate(salon.createdAt)}
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
						<Button variant="outlined" onClick={onClose}>
							Close
						</Button>
					</Box>
				</>
			) : (
				<DialogContent>
					<Typography color="error">Salon not found</Typography>
				</DialogContent>
			)}
		</Dialog>
	);
}
