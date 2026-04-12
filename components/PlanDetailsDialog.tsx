'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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

interface PlanDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  plan: PlanDetails | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(price);

const formatDate = (createdAt?: PlanTimestamp) => {
  if (!createdAt?._seconds) return '-';
  return new Date(createdAt._seconds * 1000).toLocaleDateString();
};

const statusColor = (status: string) => {
  const normalized = (status || '').toUpperCase();
  if (normalized === 'ACTIVE') return 'success';
  if (normalized === 'INACTIVE') return 'warning';
  return 'default';
};

export default function PlanDetailsDialog({ open, onClose, plan }: PlanDetailsDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Plan Details</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {plan ? (
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Plan Name</Typography>
                <Typography variant="body1">{plan.planName}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Plan Code</Typography>
                <Typography variant="body1">{plan.planCode}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Price</Typography>
                <Typography variant="body2">{formatPrice(plan.price)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="body2">{plan.duration} days</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Priority</Typography>
                <Typography variant="body2">P{plan.priority}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Image Count</Typography>
                <Typography variant="body2">{plan.imageCount ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Video Count</Typography>
                <Typography variant="body2">{plan.videoCount ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box mt={0.5}>
                  <Chip
                    size="small"
                    label={(plan.state || 'Unknown').replaceAll('_', ' ')}
                    color={statusColor(plan.state) as 'success' | 'warning' | 'default'}
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Created Date</Typography>
                <Typography variant="body2">{formatDate(plan.createdAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Updated Date</Typography>
                <Typography variant="body2">{formatDate(plan.updatedAt)}</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Description</Typography>
              <Typography variant="body2">{plan.description || '-'}</Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">Features</Typography>
              {plan.features?.length ? (
                <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2.5 }}>
                  {plan.features.map((feature) => (
                    <Box component="li" key={feature} sx={{ mb: 0.5 }}>
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">No features available.</Typography>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No plan selected.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
