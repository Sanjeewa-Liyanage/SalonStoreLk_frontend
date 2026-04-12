'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
} from '@mui/icons-material';
import { PlanState } from '@/lib/types';

interface PlanTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface PlanDetails {
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
  imageCount?: number;
  videoCount?: number;
}

interface UpdatePlanPayload {
  planName: string;
  description: string;
  state: PlanState;
  price: number;
  features: string[];
  duration: number;
  priority: number;
  imageCount?: number;
  videoCount?: number;
}

interface PlanUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
  onSubmit: (id: string, payload: UpdatePlanPayload) => Promise<void>;
}

const DEFAULT_FORM: UpdatePlanPayload = {
  planName: '',
  description: '',
  state: PlanState.ACTIVE,
  price: 0,
  features: [''],
  duration: 30,
  priority: 1,
  imageCount: 0,
  videoCount: 0,
};

export default function PlanUpdateDialog({
  open,
  onClose,
  plan,
  onSubmit,
}: PlanUpdateDialogProps) {
  const [form, setForm] = useState<UpdatePlanPayload>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !plan) return;
    setForm({
      planName: plan.planName || '',
      description: plan.description || '',
      state: (plan.state as PlanState) || PlanState.ACTIVE,
      price: Number(plan.price || 0),
      features: plan.features?.length ? plan.features : [''],
      duration: Number(plan.duration || 0),
      priority: Number(plan.priority || 1),
      imageCount: Number(plan.imageCount || 0),
      videoCount: Number(plan.videoCount || 0),
    });
    setError(null);
  }, [open, plan]);

  const canSubmit = useMemo(() => {
    return (
      form.planName.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.price > 0 &&
      form.duration > 0 &&
      form.priority > 0 &&
      form.features.some((item) => item.trim().length > 0)
    );
  }, [form]);

  const updateFeature = (index: number, value: string) => {
    setForm((prev) => {
      const nextFeatures = [...prev.features];
      nextFeatures[index] = value;
      return { ...prev, features: nextFeatures };
    });
  };

  const addFeature = () => {
    setForm((prev) => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setForm((prev) => {
      const next = prev.features.filter((_, idx) => idx !== index);
      return { ...prev, features: next.length ? next : [''] };
    });
  };

  const handleSubmit = async () => {
    if (!plan) return;

    const cleanedFeatures = form.features.map((item) => item.trim()).filter(Boolean);
    if (!cleanedFeatures.length) {
      setError('At least one feature is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(plan.id, {
        ...form,
        planName: form.planName.trim(),
        description: form.description.trim(),
        features: cleanedFeatures,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Update Plan</Typography>
        <IconButton onClick={onClose} size="small" disabled={saving}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Plan Name"
              value={form.planName}
              onChange={(event) => setForm((prev) => ({ ...prev, planName: event.target.value }))}
              size="small"
              fullWidth
              required
            />

            <TextField
              label="Price"
              type="number"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              size="small"
              fullWidth
              required
              inputProps={{ min: 0 }}
            />

            <TextField
              select
              label="State"
              value={form.state}
              onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value as PlanState }))}
              size="small"
              fullWidth
            >
              {Object.values(PlanState).map((value) => (
                <MenuItem key={value} value={value}>
                  {value.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: Number(event.target.value) }))}
              size="small"
              fullWidth
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Duration (days)"
              type="number"
              value={form.duration}
              onChange={(event) => setForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
              size="small"
              fullWidth
              required
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Image Count"
              type="number"
              value={form.imageCount ?? 0}
              onChange={(event) => setForm((prev) => ({ ...prev, imageCount: Number(event.target.value) }))}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Video Count"
              type="number"
              value={form.videoCount ?? 0}
              onChange={(event) => setForm((prev) => ({ ...prev, videoCount: Number(event.target.value) }))}
              size="small"
              fullWidth
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Plan Code"
              value={plan?.planCode ?? '-'}
              size="small"
              fullWidth
              disabled
            />
          </Box>

          <TextField
            label="Description"
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            size="small"
            fullWidth
            multiline
            minRows={3}
            required
          />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Features
              </Typography>
              <Button type="button" variant="outlined" size="small" startIcon={<AddIcon />} onClick={addFeature}>
                Add Feature
              </Button>
            </Stack>

            {form.features.map((feature, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'center',
                  pb: 1.5,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <TextField
                  placeholder="Feature"
                  value={feature}
                  onChange={(event) => updateFeature(index, event.target.value)}
                  size="small"
                  fullWidth
                />
                <IconButton color="error" onClick={() => removeFeature(index)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>

          {error ? <Typography color="error" variant="body2">{error}</Typography> : null}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!canSubmit || saving}>
          {saving ? 'Updating...' : 'Update Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
