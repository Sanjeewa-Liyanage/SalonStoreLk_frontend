'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  EditOutlined as EditOutlinedIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { uploadProfileImage } from '@/lib/firebase';

export interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePictureUrl: string;
  email: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onClose: () => void;
  profile: Partial<ProfileFormValues> | null;
  userId: string | null;
  onSubmit: (payload: Partial<ProfileFormValues>) => Promise<void>;
}

const DEFAULT_FORM: ProfileFormValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  profilePictureUrl: '',
  email: '',
};

interface AvatarUploadSectionProps {
  isDark: boolean;
  avatarUrl: string;
  previewUrl: string | null;
  fileLabel: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function AvatarUploadSection({
  isDark,
  avatarUrl,
  previewUrl,
  fileLabel,
  onUpload,
  onRemove,
}: AvatarUploadSectionProps) {
  const displayUrl = previewUrl || avatarUrl;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        p: 2,
        borderRadius: '12px',
        border: `1px solid ${isDark ? '#1e2440' : '#e2e8f0'}`,
        backgroundColor: isDark ? '#0f1526' : '#f8fafc',
      }}
    >
      <Box sx={{ position: 'relative', width: 80, height: 80 }}>
        <Avatar
          src={displayUrl}
          sx={{
            width: 80,
            height: 80,
            bgcolor: isDark ? '#1e293b' : '#e2e8f0',
            color: isDark ? '#e2e8f0' : '#475569',
            fontWeight: 700,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#27304a' : '#e2e8f0'}`,
          }}
        >
          <EditOutlinedIcon fontSize="small" sx={{ color: isDark ? '#cbd5f5' : '#475569' }} />
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a' }}>Profile Photo</Typography>
        <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Upload a clear headshot to personalize your account.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            sx={{ textTransform: 'none', borderRadius: '10px' }}
          >
            {displayUrl ? 'Change Photo' : 'Upload Photo'}
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  onUpload(file);
                }
                event.target.value = '';
              }}
            />
          </Button>
          <Button
            variant="text"
            color="inherit"
            startIcon={<DeleteOutlineIcon />}
            onClick={onRemove}
            disabled={!displayUrl}
            sx={{ textTransform: 'none', color: isDark ? '#94a3b8' : '#64748b' }}
          >
            Remove Photo
          </Button>
        </Stack>
        {fileLabel ? (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: isDark ? '#9ca3af' : '#94a3b8' }}>
            {fileLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function EditProfileDialog({ open, onClose, profile, userId, onSubmit }: EditProfileDialogProps) {
  const { isDark } = useMuiTheme();
  const [form, setForm] = useState<ProfileFormValues>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ firstName: false, lastName: false, phoneNumber: false });
  const [avatarLabel, setAvatarLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [initialForm, setInitialForm] = useState<ProfileFormValues>(DEFAULT_FORM);

  useEffect(() => {
    if (!open) return;
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phoneNumber: profile?.phoneNumber || '',
      profilePictureUrl: profile?.profilePictureUrl || '',
      email: profile?.email || '',
    });
    setInitialForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phoneNumber: profile?.phoneNumber || '',
      profilePictureUrl: profile?.profilePictureUrl || '',
      email: profile?.email || '',
    });
    setError(null);
    setTouched({ firstName: false, lastName: false, phoneNumber: false });
    setAvatarLabel(null);
  }, [open, profile]);

  const trimmedForm = useMemo(() => {
    return {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      profilePictureUrl: form.profilePictureUrl.trim(),
    };
  }, [form]);

  const isValid = useMemo(() => {
    return trimmedForm.firstName.length > 0 && trimmedForm.lastName.length > 0;
  }, [trimmedForm.firstName, trimmedForm.lastName]);

  const isDirty = useMemo(() => {
    const baseline = {
      ...initialForm,
      firstName: initialForm.firstName.trim(),
      lastName: initialForm.lastName.trim(),
      phoneNumber: initialForm.phoneNumber.trim(),
      profilePictureUrl: initialForm.profilePictureUrl.trim(),
    };

    return (
      trimmedForm.firstName !== baseline.firstName ||
      trimmedForm.lastName !== baseline.lastName ||
      trimmedForm.phoneNumber !== baseline.phoneNumber ||
      trimmedForm.profilePictureUrl !== baseline.profilePictureUrl
    );
  }, [initialForm, trimmedForm]);

  const handleChange = (field: keyof ProfileFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setTouched({ firstName: true, lastName: true, phoneNumber: true });
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit({
        firstName: trimmedForm.firstName,
        lastName: trimmedForm.lastName,
        phoneNumber: trimmedForm.phoneNumber,
        profilePictureUrl: trimmedForm.profilePictureUrl,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = (file: File) => {
    if (!userId) {
      setError('Unable to upload photo. User ID is missing.');
      return;
    }

    setUploading(true);
    setError(null);
    uploadProfileImage(file, userId)
      .then(({ url }) => {
        setForm((prev) => ({ ...prev, profilePictureUrl: url }));
        setAvatarLabel(file.name);
      })
      .catch((uploadError) => {
        setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload photo.');
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const handleRemovePhoto = () => {
    setAvatarLabel(null);
    setForm((prev) => ({ ...prev, profilePictureUrl: '' }));
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          backgroundColor: isDark ? '#141828' : '#ffffff',
          border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
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
          <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
            Edit Profile
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
            Update your personal details and profile photo.
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack spacing={3}>
          <AvatarUploadSection
            isDark={isDark}
            avatarUrl={form.profilePictureUrl}
            previewUrl={null}
            fileLabel={avatarLabel}
            onUpload={handleUpload}
            onRemove={handleRemovePhoto}
          />

          <Divider sx={{ borderColor: isDark ? '#1e2440' : '#e2e8f0' }} />

          <Box>
            <Typography sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a' }}>
              Personal Information
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
              Keep your contact details up to date.
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <TextField
                label="First Name"
                value={form.firstName}
                onChange={handleChange('firstName')}
                onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                size="small"
                fullWidth
                required
                error={touched.firstName && trimmedForm.firstName.length === 0}
                helperText={
                  touched.firstName && trimmedForm.firstName.length === 0
                    ? 'First name is required.'
                    : ' '
                }
              />
              <TextField
                label="Last Name"
                value={form.lastName}
                onChange={handleChange('lastName')}
                onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                size="small"
                fullWidth
                required
                error={touched.lastName && trimmedForm.lastName.length === 0}
                helperText={
                  touched.lastName && trimmedForm.lastName.length === 0
                    ? 'Last name is required.'
                    : ' '
                }
              />
              <TextField
                label="Email"
                value={form.email}
                size="small"
                fullWidth
                disabled
                helperText=" "
              />
              <TextField
                label="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                onBlur={() => setTouched((prev) => ({ ...prev, phoneNumber: true }))}
                size="small"
                fullWidth
                helperText=" "
              />
            </Box>
          </Box>

          {error ? (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
        <Button onClick={onClose} disabled={saving} variant="text" sx={{ textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isDirty || !isValid || saving || uploading}
          sx={{ textTransform: 'none', borderRadius: '10px', px: 3 }}
        >
          {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
