'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface PlanDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  planName?: string;
  loading?: boolean;
}

export default function PlanDeleteDialog({
  open,
  onClose,
  onConfirm,
  planName,
  loading = false,
}: PlanDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Delete Plan</Typography>
        <IconButton onClick={onClose} size="small" disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {planName
              ? `Are you sure you want to delete ${planName}? This action cannot be undone.`
              : 'Are you sure you want to delete this plan? This action cannot be undone.'}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
