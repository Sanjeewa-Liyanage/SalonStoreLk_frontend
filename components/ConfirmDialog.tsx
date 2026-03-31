'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Stack,
	Typography,
} from '@mui/material';
import {
	Close as CloseIcon,
	ErrorOutline as ErrorOutlineIcon,
	HelpOutline as HelpOutlineIcon,
	InfoOutlined as InfoOutlinedIcon,
	WarningAmberOutlined as WarningAmberOutlinedIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ConfirmDialogVariant = 'info' | 'warning' | 'danger' | 'question' | 'success';

interface ConfirmDialogProps {
	/** Controls visibility */
	open: boolean;
	/** Dialog heading */
	title: string;
	/** Body message — can be a string or any JSX */
	message: React.ReactNode;
	/** Visual style of the icon & confirm button  (default: 'question') */
	variant?: ConfirmDialogVariant;
	/** Label for the confirm button  (default: 'Confirm') */
	confirmLabel?: string;
	/** Label for the cancel button   (default: 'Cancel') */
	cancelLabel?: string;
	/** Called when the user clicks Confirm */
	onConfirm: () => void;
	/** Called when the user clicks Cancel or closes the dialog */
	onCancel: () => void;
	/** Disable buttons while an async action is in progress */
	loading?: boolean;
}

// ─── Variant config ───────────────────────────────────────────────────────────
const variantConfig: Record<
	ConfirmDialogVariant,
	{
		icon: React.ReactNode;
		iconColor: string;
		confirmColor: 'error' | 'warning' | 'primary' | 'info' | 'success';
		bgLight: string;
		bgDark: string;
	}
> = {
	danger: {
		icon: <ErrorOutlineIcon sx={{ fontSize: 36 }} />,
		iconColor: '#ef4444',
		confirmColor: 'error',
		bgLight: 'rgba(239,68,68,0.08)',
		bgDark:  'rgba(239,68,68,0.12)',
	},
	warning: {
		icon: <WarningAmberOutlinedIcon sx={{ fontSize: 36 }} />,
		iconColor: '#f59e0b',
		confirmColor: 'warning',
		bgLight: 'rgba(245,158,11,0.08)',
		bgDark:  'rgba(245,158,11,0.12)',
	},
	info: {
		icon: <InfoOutlinedIcon sx={{ fontSize: 36 }} />,
		iconColor: '#3b82f6',
		confirmColor: 'info',
		bgLight: 'rgba(59,130,246,0.08)',
		bgDark:  'rgba(59,130,246,0.12)',
	},
	question: {
		icon: <HelpOutlineIcon sx={{ fontSize: 36 }} />,
		iconColor: '#a78bfa',
		confirmColor: 'primary',
		bgLight: 'rgba(167,139,250,0.08)',
		bgDark:  'rgba(167,139,250,0.12)',
	},
    success: {
        icon: <CheckCircleOutlineIcon sx={{ fontSize: 36 }} />,
        iconColor: '#22c55e',
        confirmColor: 'success',
        bgLight: 'rgba(34,197,94,0.08)',
        bgDark:  'rgba(34,197,94,0.12)',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ConfirmDialog({
	open,
	title,
	message,
	variant = 'question',
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
	loading = false,
}: ConfirmDialogProps) {
	const { isDark } = useMuiTheme();
	const cfg = variantConfig[variant];

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onCancel}
			maxWidth="xs"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '16px',
					backgroundColor: isDark ? '#141828' : '#ffffff',
					border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
					boxShadow: isDark
						? '0 24px 48px rgba(0,0,0,0.6)'
						: '0 24px 48px rgba(0,0,0,0.12)',
					overflow: 'hidden',
				},
			}}
			BackdropProps={{
				sx: {
					backdropFilter: 'blur(4px)',
					backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
				},
			}}
		>
			{/* ── Coloured accent bar at the top ── */}
			<Stack
				alignItems="center"
				justifyContent="center"
				sx={{
					pt: 4,
					pb: 2,
					px: 3,
					backgroundColor: isDark ? cfg.bgDark : cfg.bgLight,
					position: 'relative',
				}}
			>
				{/* Close button */}
				<IconButton
					onClick={onCancel}
					disabled={loading}
					size="small"
					sx={{
						position: 'absolute',
						top: 12,
						right: 12,
						color: isDark ? '#6b7a99' : '#94a3b8',
						'&:hover': { color: isDark ? '#cbd5e1' : '#334155' },
					}}
				>
					<CloseIcon fontSize="small" />
				</IconButton>

				{/* Icon */}
				<Stack
					alignItems="center"
					justifyContent="center"
					sx={{
						width: 64,
						height: 64,
						borderRadius: '50%',
						backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)',
						border: `2px solid ${cfg.iconColor}22`,
						color: cfg.iconColor,
						mb: 1.5,
					}}
				>
					{cfg.icon}
				</Stack>

				{/* Title */}
				<DialogTitle
					sx={{
						p: 0,
						fontSize: '1.1rem',
						fontWeight: 700,
						color: isDark ? '#e2e8f0' : '#1a1d2e',
						textAlign: 'center',
					}}
				>
					{title}
				</DialogTitle>
			</Stack>

			{/* ── Body ── */}
			<DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
				{typeof message === 'string' ? (
					<DialogContentText
						sx={{
							textAlign: 'center',
							fontSize: '0.9rem',
							color: isDark ? '#8ea0c4' : '#64748b',
							lineHeight: 1.6,
						}}
					>
						{message}
					</DialogContentText>
				) : (
					<Typography
						component="div"
						sx={{
							textAlign: 'center',
							fontSize: '0.9rem',
							color: isDark ? '#8ea0c4' : '#64748b',
							lineHeight: 1.6,
						}}
					>
						{message}
					</Typography>
				)}
			</DialogContent>

			{/* ── Actions ── */}
			<DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
				<Button
					fullWidth
					variant="outlined"
					onClick={onCancel}
					disabled={loading}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '8px',
						borderColor: isDark ? '#1e2440' : '#eaecf5',
						color: isDark ? '#8ea0c4' : '#64748b',
						'&:hover': {
							borderColor: isDark ? '#334155' : '#cbd5e1',
							backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
						},
					}}
				>
					{cancelLabel}
				</Button>
				<Button
					fullWidth
					variant="contained"
					color={cfg.confirmColor}
					onClick={onConfirm}
					disabled={loading}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '8px',
					}}
				>
					{loading ? 'Please wait...' : confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}