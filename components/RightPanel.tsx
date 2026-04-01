'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import {
  Storefront as StorefrontIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

export default function RightPanel({ recentActivity }: { recentActivity?: any }) {
  const { isDark } = useMuiTheme();
  const [activeTab, setActiveTab] = useState<'ads' | 'payments'>('ads');

  const ads = recentActivity?.latestApprovedAds || [];
  const payments = recentActivity?.recentPayments || [];

  const renderAds = () => (
    <List sx={{ p: 0 }}>
      {ads.length === 0 && (
        <Typography variant="body2" sx={{ color: isDark ? '#6b7a99' : '#94a3b8', py: 2, textAlign: 'center' }}>
          No recent approved ads
        </Typography>
      )}
      {ads.map((ad: any, index: number) => (
        <React.Fragment key={ad.id}>
          <ListItem
            sx={{
              py: 2,
              px: 0,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(167, 139, 250, 0.05)' : '#f5f3ff',
                borderRadius: '8px',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: '#0ea5e9',
              }}
            >
              <StorefrontIcon sx={{ fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {ad.title}
                </Typography>
              }
              secondary={
                <Stack spacing={0.5} component="span">
                  <Typography variant="caption" component="span" sx={{ color: isDark ? '#4a5068' : '#cbd5e1' }}>
                    {ad.createdAt ? new Date(ad.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
          {index < ads.length - 1 && (
            <Divider sx={{ my: 1, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );

  const renderPayments = () => (
    <List sx={{ p: 0 }}>
      {payments.length === 0 && (
        <Typography variant="body2" sx={{ color: isDark ? '#6b7a99' : '#94a3b8', py: 2, textAlign: 'center' }}>
          No recent payments
        </Typography>
      )}
      {payments.map((payment: any, index: number) => (
        <React.Fragment key={payment.id}>
          <ListItem
            sx={{
              py: 2,
              px: 0,
              '&:hover': {
                backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : '#ecfdf5',
                borderRadius: '8px',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: '#10b981',
              }}
            >
              <PaymentIcon sx={{ fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {payment.method} - {payment.status}
                </Typography>
              }
              secondary={
                <Stack spacing={0.5} component="span">
                  <Typography variant="caption" component="span" sx={{ color: isDark ? '#4a5068' : '#cbd5e1' }}>
                    {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : 'N/A'}
                  </Typography>
                </Stack>
              }
            />
          </ListItem>
          {index < payments.length - 1 && (
            <Divider sx={{ my: 1, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
          )}
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
        height: '100%',
      }}
    >
      <CardHeader
        title="Recent Activity"
        sx={{
          pb: 1.5,
          '& .MuiCardHeader-title': {
            fontWeight: 700,
            fontSize: '1rem',
          },
        }}
      />

      {/* Tabs */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 2,
          pb: 2,
          borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: isDark ? '#1e2440' : '#eaecf5',
            borderRadius: '2px',
          },
        }}
      >
        {[
          { id: 'ads', label: 'Latest Ads' },
          { id: 'payments', label: 'Recent Payments' },
        ].map((tab) => (
          <Chip
            key={tab.id}
            label={tab.label}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            variant={activeTab === tab.id ? 'filled' : 'outlined'}
            color={activeTab === tab.id ? 'primary' : 'default'}
            size="small"
            sx={{
              borderRadius: '6px',
              flexShrink: 0,
              backgroundColor:
                activeTab === tab.id
                  ? '#a78bfa'
                  : isDark
                  ? 'transparent'
                  : 'transparent',
              color: activeTab === tab.id ? '#fff' : isDark ? '#6b7a99' : '#94a3b8',
              borderColor: activeTab === tab.id ? '#a78bfa' : isDark ? '#1e2440' : '#eaecf5',
              '&:hover': {
                borderColor: '#a78bfa',
              },
            }}
          />
        ))}
      </Box>

      <CardContent sx={{ pt: 2 }}>
        {activeTab === 'ads' && renderAds()}
        {activeTab === 'payments' && renderPayments()}
      </CardContent>
    </Card>
  );
}
