'use client';

import React from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import {
  AdsClick as AdsClickIcon,
  CheckCircle as CheckCircleIcon,
  Payment as PaymentIcon,
  Storefront as StorefrontIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

interface PendingApprovalsPanelProps {
  kpis?: any;
  recentActivity?: any;
}

export default function PendingApprovalsPanel({
  kpis,
  recentActivity,
}: PendingApprovalsPanelProps) {
  const { isDark } = useMuiTheme();

  const pendingSalons = recentActivity?.pendingSalons?.length ?? kpis?.salons?.pendingVerification ?? 0;
  const pendingAds = kpis?.ads?.pendingApproval ?? 0;
  const pendingPayments = kpis?.payments?.pendingVerification ?? 0;
  const totalPending = pendingSalons + pendingAds + pendingPayments;

  const hasPending = totalPending > 0;

  return (
    <Card
      sx={{
        borderRadius: '14px',
        border: `1px solid ${hasPending ? '#f59e0b' : isDark ? '#1e2440' : '#d1fae5'}`,
        backgroundColor: hasPending
          ? isDark
            ? 'rgba(245, 158, 11, 0.08)'
            : '#fffbeb'
          : isDark
          ? '#141828'
          : '#f0fdf4',
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDark ? '#f8fafc' : '#111827',
                }}
              >
                Pending Approvals
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: isDark ? '#9ca3af' : '#6b7280', mt: 0.5 }}
              >
                Prioritize items that need admin action right now.
              </Typography>
            </Box>

            <Chip
              icon={hasPending ? <WarningAmberIcon /> : <CheckCircleIcon />}
              label={hasPending ? `${totalPending} item(s) require review` : 'No pending approvals'}
              sx={{
                fontWeight: 600,
                color: hasPending ? '#b45309' : '#065f46',
                backgroundColor: hasPending ? '#fef3c7' : '#d1fae5',
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} flexWrap="wrap">
            <Chip
              icon={<StorefrontIcon />}
              label={`Salons Pending: ${pendingSalons}`}
              sx={{ backgroundColor: isDark ? '#1b223b' : '#eef2ff', color: isDark ? '#c7d2fe' : '#3730a3' }}
            />
            <Chip
              icon={<AdsClickIcon />}
              label={`Ads Pending: ${pendingAds}`}
              sx={{ backgroundColor: isDark ? '#172136' : '#ecfeff', color: isDark ? '#67e8f9' : '#155e75' }}
            />
            <Chip
              icon={<PaymentIcon />}
              label={`Payments Pending: ${pendingPayments}`}
              sx={{ backgroundColor: isDark ? '#202025' : '#fff7ed', color: isDark ? '#fdba74' : '#9a3412' }}
            />
          </Stack>

          {hasPending ? (
            <Alert
              severity="warning"
              icon={<WarningAmberIcon fontSize="inherit" />}
              sx={{
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(245, 158, 11, 0.14)' : '#fef3c7',
                color: isDark ? '#fde68a' : '#92400e',
              }}
            >
              Review pending approvals to keep salon onboarding and campaign performance on track.
            </Alert>
          ) : (
            <Alert
              severity="success"
              icon={<CheckCircleIcon fontSize="inherit" />}
              sx={{
                borderRadius: '10px',
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.14)' : '#dcfce7',
                color: isDark ? '#86efac' : '#166534',
              }}
            >
              No pending approvals. Operations are up to date.
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button component={Link} href="/admin/salons?tab=pending" variant="contained" sx={{ borderRadius: '10px', textTransform: 'none', backgroundColor: '#a78bfa' }}>
              Review Salons
            </Button>
            <Button component={Link} href="/admin/ads?status=pending" variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', borderColor: '#a78bfa', color: '#a78bfa' }}>
              Review Ads
            </Button>
            <Button component={Link} href="/admin/dashboard" variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none', borderColor: isDark ? '#334155' : '#cbd5e1', color: isDark ? '#cbd5e1' : '#475569' }}>
              Review Payments
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
