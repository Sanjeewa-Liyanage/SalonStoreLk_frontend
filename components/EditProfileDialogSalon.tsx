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
import { uploadProfileImage } from '@/lib/firebase';

export interface SalonProfileFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profilePictureUrl: string;
  email: string;
}

interface EditProfileDialogSalonProps {
  open: boolean;
  onClose: () => void;
  profile: Partial<SalonProfileFormValues> | null;
  userId: string | null;
  onSubmit: (payload: Partial<SalonProfileFormValues>) => Promise<void>;
}

const DEFAULT_FORM: SalonProfileFormValues = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  profilePictureUrl: '',
  email: '',
};

interface AvatarUploadSectionProps {
  avatarUrl: string;
  fileLabel: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  uploading: boolean;
}

function AvatarUploadSection({ avatarUrl, fileLabel, onUpload, onRemove, uploading }: AvatarUploadSectionProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        p: 2.5,
        borderRadius: '16px',
        border: '1px solid rgba(200, 168, 75, 0.25)',
        background: 'linear-gradient(135deg, rgba(200, 168, 75, 0.12), rgba(255,255,255,0))',
      }}
    >
      <Box sx={{ position: 'relative', width: 84, height: 84 }}>
        <Avatar
          src={avatarUrl}
          sx={{
            width: 84,
            height: 84,
            bgcolor: 'rgba(200, 168, 75, 0.15)',
            color: '#8E7327',
            fontWeight: 700,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 30,
            height: 30,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(200, 168, 75, 0.4)',
            color: '#8E7327',
          }}
        >
          <EditOutlinedIcon fontSize="small" />
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, color: '#111827' }}>Profile Photo</Typography>
        <Typography variant="body2" sx={{ color: '#111827', mt: 0.5 }}>
          Upload a clear headshot to personalize your account.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1.5 }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
            disabled={uploading}
            sx={{
              textTransform: 'none',
              borderRadius: '10px',
              borderColor: 'rgba(200, 168, 75, 0.5)',
              color: '#111827',
              '&:hover': { borderColor: '#C8A84B', backgroundColor: 'rgba(200, 168, 75, 0.08)' },
            }}
          >
            {avatarUrl ? 'Change Photo' : 'Upload Photo'}
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
            disabled={!avatarUrl || uploading}
            sx={{ textTransform: 'none', color: '#111827' }}
          >
            Remove Photo
          </Button>
        </Stack>
        {fileLabel ? (
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#111827' }}>
            {fileLabel}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

export default function EditProfileDialogSalon({
  open,
  onClose,
  profile,
  userId,
  onSubmit,
}: EditProfileDialogSalonProps) {
  const [form, setForm] = useState<SalonProfileFormValues>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ firstName: false, lastName: false, phoneNumber: false });
  const [avatarLabel, setAvatarLabel] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [initialForm, setInitialForm] = useState<SalonProfileFormValues>(DEFAULT_FORM);

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

  const handleChange = (field: keyof SalonProfileFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
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
            Edit Profile
          </Typography>
          <Typography variant="body2" sx={{ color: '#111827', mt: 0.5 }}>
            Update your personal details and profile photo.
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving} size="small" sx={{ color: '#111827' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack spacing={3}>
          <AvatarUploadSection
            avatarUrl={form.profilePictureUrl}
            fileLabel={avatarLabel}
            onUpload={handleUpload}
            onRemove={handleRemovePhoto}
            uploading={uploading}
          />

          <Divider sx={{ borderColor: 'rgba(200, 168, 75, 0.2)' }} />

          <Box>
            <Typography sx={{ fontWeight: 700, color: '#111827' }}>Personal Information</Typography>
            <Typography variant="body2" sx={{ color: '#111827', mt: 0.5 }}>
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
                label="Email"
                value={form.email}
                size="small"
                fullWidth
                disabled
                helperText=" "
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8f6ef',
                  },
                  '& .MuiOutlinedInput-input': {
                    color: '#111827',
                  },
                  '& .MuiOutlinedInput-input.Mui-disabled': {
                    color: '#111827',
                    WebkitTextFillColor: '#111827',
                  },
                  '& .MuiInputLabel-root': {
                    color: '#111827',
                  },
                  '& .MuiInputLabel-root.Mui-disabled': {
                    color: '#111827',
                  },
                  '& .MuiFormHelperText-root': {
                    color: '#111827',
                  },
                }}
              />
              <TextField
                label="Phone Number"
                value={form.phoneNumber}
                onChange={handleChange('phoneNumber')}
                onBlur={() => setTouched((prev) => ({ ...prev, phoneNumber: true }))}
                size="small"
                fullWidth
                helperText=" "
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
        <Button onClick={onClose} disabled={saving} variant="text" sx={{ textTransform: 'none', color: '#111827' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isDirty || !isValid || saving || uploading}
          sx={{
            textTransform: 'none',
            borderRadius: '10px',
            px: 3,
            backgroundColor: '#C8A84B',
            '&:hover': { backgroundColor: '#b6903f' },
          }}
        >
          {saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
