'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from '@mui/material';
import {
  AddBusiness as AddBusinessIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Assessment as AssessmentIcon,
  Campaign as CampaignIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

const actions = [
  {
    label: 'Add Salon',
    description: 'Register a new salon profile',
    href: '/admin/salons',
    icon: AddBusinessIcon,
  },
  {
    label: 'Create Ad',
    description: 'Launch a new promotion quickly',
    href: '/admin/ads',
    icon: CampaignIcon,
  },
  {
    label: 'Add Plan',
    description: 'Update ad packages and pricing',
    href: '/admin/adsplans',
    icon: AddCircleOutlineIcon,
  },
  {
    label: 'View Reports',
    description: 'See growth and performance trends',
    href: '/admin/dashboard',
    icon: AssessmentIcon,
  },
];

export default function QuickActionsPanel() {
  const { isDark } = useMuiTheme();

  return (
    <Card
      sx={{
        borderRadius: '14px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#e5e7eb'}`,
      }}
    >
      <CardHeader
        title="Quick Actions"
        subheader="Most used admin actions"
        sx={{
          pb: 1,
          '& .MuiCardHeader-title': {
            fontWeight: 700,
            fontSize: '1rem',
          },
          '& .MuiCardHeader-subheader': {
            color: isDark ? '#94a3b8' : '#64748b',
          },
        }}
      />
      <CardContent>
        <Stack spacing={1.25}>
          {actions.map((action) => (
            <Button
              key={action.label}
              component={Link}
              href={action.href}
              variant="outlined"
              startIcon={<action.icon />}
              sx={{
                justifyContent: 'flex-start',
                textTransform: 'none',
                borderRadius: '10px',
                borderColor: isDark ? '#334155' : '#d1d5db',
                color: isDark ? '#e2e8f0' : '#0f172a',
                px: 1.5,
                py: 1.25,
                '&:hover': {
                  borderColor: '#a78bfa',
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f5f3ff',
                },
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {action.label}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                  {action.description}
                </Typography>
              </Box>
            </Button>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
