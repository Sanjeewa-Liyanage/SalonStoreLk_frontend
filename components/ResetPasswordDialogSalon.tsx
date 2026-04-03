'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close as CloseIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

interface ResetPasswordDialogSalonProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { oldPassword: string; newPassword: string }) => Promise<void>;
}

export default function ResetPasswordDialogSalon({ open, onClose, onSubmit }: ResetPasswordDialogSalonProps) {
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [touched, setTouched] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const trimmed = useMemo(
    () => ({
      oldPassword: form.oldPassword.trim(),
      newPassword: form.newPassword.trim(),
      confirmPassword: form.confirmPassword.trim(),
    }),
    [form]
  );

  const passwordsMatch = trimmed.newPassword.length > 0 && trimmed.newPassword === trimmed.confirmPassword;
  const isValid = trimmed.oldPassword.length > 0 && trimmed.newPassword.length > 0 && passwordsMatch;

  const newPasswordHelper = touched.newPassword && trimmed.newPassword.length === 0
    ? 'New password is required.'
    : 'Use 8+ characters with upper/lowercase, a number, and a symbol.';

  const confirmPasswordHelper = touched.confirmPassword && !passwordsMatch
    ? 'Passwords do not match.'
    : 'Re-enter the new password to confirm.';

  const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setTouched({ oldPassword: true, newPassword: true, confirmPassword: true });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit({ oldPassword: trimmed.oldPassword, newPassword: trimmed.newPassword });
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTouched({ oldPassword: false, newPassword: false, confirmPassword: false });
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to reset password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '18px',
          backgroundColor: '#fefcf6',
          border: '1px solid rgba(200, 168, 75, 0.25)',
          boxShadow: '0 24px 50px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 0,
          pt: 3,
          px: 3,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ color: '#111827', mt: 0.5 }}>
            Choose a strong new password to secure your account.
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving} size="small" sx={{ color: '#111827' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack spacing={2}>
          <TextField
            label="Current Password"
            value={form.oldPassword}
            onChange={handleChange('oldPassword')}
            onBlur={() => setTouched((prev) => ({ ...prev, oldPassword: true }))}
            size="small"
            fullWidth
            required
            type={showOld ? 'text' : 'password'}
            error={touched.oldPassword && trimmed.oldPassword.length === 0}
            helperText={
              touched.oldPassword && trimmed.oldPassword.length === 0
                ? 'Current password is required.'
                : ' '
            }
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={() => setShowOld((prev) => !prev)}>
                  {showOld ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
              },
              '& .MuiOutlinedInput-input': {
                color: '#111827',
              },
              '& .MuiInputLabel-root': {
                color: '#111827',
              },
              '& .MuiFormHelperText-root': {
                color: '#111827',
              },
            }}
          />

          <TextField
            label="New Password"
            value={form.newPassword}
            onChange={handleChange('newPassword')}
            onBlur={() => setTouched((prev) => ({ ...prev, newPassword: true }))}
            size="small"
            fullWidth
            required
            type={showNew ? 'text' : 'password'}
            error={touched.newPassword && trimmed.newPassword.length === 0}
            helperText={newPasswordHelper}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={() => setShowNew((prev) => !prev)}>
                  {showNew ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
              },
              '& .MuiOutlinedInput-input': {
                color: '#111827',
              },
              '& .MuiInputLabel-root': {
                color: '#111827',
              },
              '& .MuiFormHelperText-root': {
                color: '#111827',
              },
            }}
          />

          <TextField
            label="Confirm New Password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
            size="small"
            fullWidth
            required
            type={showConfirm ? 'text' : 'password'}
            error={touched.confirmPassword && !passwordsMatch}
            helperText={confirmPasswordHelper}
            InputProps={{
              endAdornment: (
                <IconButton size="small" onClick={() => setShowConfirm((prev) => !prev)}>
                  {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                backgroundColor: '#ffffff',
              },
              '& .MuiOutlinedInput-input': {
                color: '#111827',
              },
              '& .MuiInputLabel-root': {
                color: '#111827',
              },
              '& .MuiFormHelperText-root': {
                color: '#111827',
              },
            }}
          />

          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
        <Button onClick={onClose} disabled={saving} variant="text" sx={{ textTransform: 'none', color: '#111827' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || saving}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
            backgroundColor: '#C8A84B',
            '&:hover': { backgroundColor: '#b6903f' },
          }}
        >
          {saving ? 'Updating...' : 'Reset Password'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
