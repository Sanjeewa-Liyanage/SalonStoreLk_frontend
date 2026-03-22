'use client';

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import { useMuiTheme } from '@/context/MuiThemeContext';

interface SuspendReasonDialogProps {
	open: boolean;
	salonName?: string;
	reason: string;
	error?: string | null;
	loading?: boolean;
	title?: string;
	actionVerb?: string;
	inputLabel?: string;
	helperText?: string;
	confirmLabel?: string;
	confirmColor?: 'warning' | 'error' | 'primary' | 'info' | 'success';
	onReasonChange: (value: string) => void;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function SuspendReasonDialog({
	open,
	salonName,
	reason,
	error = null,
	loading = false,
	title = 'Suspend Salon',
	actionVerb = 'suspending',
	inputLabel = 'Suspend Reason',
	helperText = 'This reason will be sent with the suspend request.',
	confirmLabel = 'Continue',
	confirmColor = 'warning',
	onReasonChange,
	onCancel,
	onConfirm,
}: SuspendReasonDialogProps) {
	const { isDark } = useMuiTheme();

	return (
		<Dialog
			open={open}
			onClose={loading ? undefined : onCancel}
			maxWidth="sm"
			fullWidth
			PaperProps={{
				sx: {
					borderRadius: '16px',
					backgroundColor: isDark ? '#141828' : '#ffffff',
					border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
					boxShadow: isDark
						? '0 24px 48px rgba(0,0,0,0.6)'
						: '0 24px 48px rgba(0,0,0,0.12)',
				},
			}}
		>
			<DialogTitle
				sx={{
					pb: 1,
					fontSize: '1.1rem',
					fontWeight: 700,
					color: isDark ? '#e2e8f0' : '#1a1d2e',
				}}
			>
				{title}
			</DialogTitle>
			<DialogContent sx={{ pt: 1.5 }}>
				<Stack spacing={1.5}>
					<Typography sx={{ color: isDark ? '#8ea0c4' : '#64748b', fontSize: '0.9rem' }}>
						{salonName
							? `Enter the reason for ${actionVerb} ${salonName}.`
							: `Enter the reason for ${actionVerb} this salon.`}
					</Typography>
					<TextField
						autoFocus
						label={inputLabel}
						placeholder="Type the reason"
						value={reason}
						onChange={(event) => onReasonChange(event.target.value)}
						disabled={loading}
						required
						fullWidth
						error={Boolean(error)}
						helperText={error || helperText}
						size="small"
						InputProps={{
							sx: {
								borderRadius: '8px',
								backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
							},
						}}
					/>
				</Stack>
			</DialogContent>
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
					}}
				>
					Cancel
				</Button>
				<Button
					fullWidth
					variant="contained"
					color={confirmColor}
					onClick={onConfirm}
					disabled={loading}
					sx={{
						textTransform: 'none',
						fontWeight: 600,
						borderRadius: '8px',
					}}
				>
					{confirmLabel}
				</Button>
			</DialogActions>
		</Dialog>
	);
}