'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Box, Typography, Stack, Button } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Storefront as StorefrontIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  helperText: string;
  actionLabel: string;
  actionHref: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  helperText,
  actionLabel,
  actionHref,
}: StatCardProps) {
  const { isDark } = useMuiTheme();

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 10px 30px rgba(0, 0, 0, 0.3)'
            : '0 10px 30px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent>
        <Stack spacing={2.5}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#6b7a99' : '#94a3b8',
                  fontWeight: 600,
                  letterSpacing: 0.2,
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: isDark ? '#f1f5f9' : '#1a1d2e',
                }}
              >
                {value}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '10px',
                backgroundColor: bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon sx={{ color, fontSize: '1.5rem' }} />
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.7} alignItems="center">
            <TrendingUpIcon sx={{ fontSize: '0.95rem', color }} />
            <Typography
              variant="caption"
              sx={{
                color: isDark ? '#aab6cf' : '#475569',
                fontWeight: 500,
              }}
            >
              {helperText}
            </Typography>
          </Stack>

          <Button
            component={Link}
            href={actionHref}
            variant="text"
            size="small"
            sx={{
              textTransform: 'none',
              alignSelf: 'flex-start',
              px: 0,
              minWidth: 'auto',
              color,
              fontWeight: 700,
              '&:hover': {
                backgroundColor: 'transparent',
                color: isDark ? '#c4b5fd' : '#7c3aed',
              },
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function StatCards({ kpis }: { kpis?: any }) {
  const { isDark } = useMuiTheme();

  if (!kpis) return null;

  const stats: StatCardProps[] = [
    {
      title: 'Total Salons',
      value: kpis.salons?.total || 0,
      icon: StorefrontIcon,
      color: '#a78bfa',
      bgColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
      helperText: `${kpis.salons?.active || 0} active, ${kpis.salons?.pendingVerification || 0} pending verification`,
      actionLabel: 'View all',
      actionHref: '/admin/salons',
    },
    {
      title: 'Total Users',
      value: (kpis.users?.customers || 0) + (kpis.users?.salonOwners || 0),
      icon: PeopleIcon,
      color: '#0ea5e9',
      bgColor: isDark ? 'rgba(14, 165, 233, 0.1)' : '#cffafe',
      helperText: `${kpis.users?.customers || 0} customers, ${kpis.users?.salonOwners || 0} salon owners`,
      actionLabel: 'View users',
      actionHref: '/admin/users',
    },
    {
      title: 'Active Ads',
      value: kpis.ads?.activeApproved || 0,
      icon: OfferIcon,
      color: '#10b981',
      bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
      helperText: `${kpis.ads?.pendingApproval || 0} awaiting approval`,
      actionLabel: 'Manage ads',
      actionHref: '/admin/ads',
    },
    {
      title: 'Pending Payments',
      value: kpis.payments?.pendingVerification || 0,
      icon: TrendingUpIcon,
      color: '#f59e0b',
      bgColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
      helperText: 'Payments waiting for verification',
      actionLabel: 'Review payments',
      actionHref: '/admin/dashboard',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
      {stats.map((stat, index) => (
        <Box key={index}>
          <StatCard {...stat} />
        </Box>
      ))}
    </Box>
  );
}
