'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Stack, LinearProgress } from '@mui/material';
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
  trend?: number;
  color: string;
  bgColor: string;
  description?: string;
  progress?: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  bgColor,
  description,
  progress,
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
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: isDark ? '#6b7a99' : '#94a3b8',
                  fontWeight: 500,
                  mb: 0.5,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
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

          {/* Trend */}
          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <TrendingUpIcon
                sx={{
                  fontSize: '1rem',
                  color: trend >= 0 ? '#10b981' : '#ef4444',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: trend >= 0 ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {trend >= 0 ? '+' : ''}{trend}% from last month
              </Typography>
            </Stack>
          )}

          {/* Progress */}
          {progress !== undefined && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography variant="caption" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
                  {description}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color }}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: '3px',
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: '3px',
                    backgroundColor: color,
                  },
                }}
              />
            </Box>
          )}

          {/* Description */}
          {description && !progress && (
            <Typography
              variant="caption"
              sx={{
                color: isDark ? '#6b7a99' : '#94a3b8',
              }}
            >
              {description}
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function StatCards() {
  const { isDark } = useMuiTheme();

  const stats: StatCardProps[] = [
    {
      title: 'Total Salons',
      value: 234,
      icon: StorefrontIcon,
      trend: 12.5,
      color: '#a78bfa',
      bgColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
      description: '32 new registrations this month',
    },
    {
      title: 'Active Users',
      value: '8,542',
      icon: PeopleIcon,
      trend: 8.2,
      color: '#0ea5e9',
      bgColor: isDark ? 'rgba(14, 165, 233, 0.1)' : '#cffafe',
      description: '1,245 new sign-ups this week',
    },
    {
      title: 'Total Revenue',
      value: 'Rs. 2.4M',
      icon: TrendingUpIcon,
      trend: 23.1,
      color: '#10b981',
      bgColor: isDark ? 'rgba(16, 185, 129, 0.1)' : '#d1fae5',
      description: 'Monthly recurring revenue',
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      icon: OfferIcon,
      trend: -2.4,
      color: '#f59e0b',
      bgColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7',
      description: 'Down from 3.65% last month',
      progress: 32,
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
