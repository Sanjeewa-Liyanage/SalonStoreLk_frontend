'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import {
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Payments as PaymentsIcon,
  Schedule as ScheduleIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

type FeedLevel = 'success' | 'pending' | 'warning' | 'info';

interface FeedItem {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  type: 'ad' | 'payment';
  level: FeedLevel;
}

interface OperationsFeedProps {
  recentActivity?: any;
}

function getDateGroup(date: Date) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(todayStart.getDate() - 1);

  if (date >= todayStart) return 'Today';
  if (date >= yesterdayStart && date < todayStart) return 'Yesterday';
  return 'Earlier';
}

function levelStyles(level: FeedLevel, isDark: boolean) {
  if (level === 'success') {
    return {
      icon: <CheckCircleIcon sx={{ color: '#10b981' }} />,
      chip: { label: 'Verified', color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5' },
    };
  }

  if (level === 'pending') {
    return {
      icon: <ScheduleIcon sx={{ color: '#f59e0b' }} />,
      chip: { label: 'Pending', color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.12)' : '#fffbeb' },
    };
  }

  if (level === 'warning') {
    return {
      icon: <WarningAmberIcon sx={{ color: '#f97316' }} />,
      chip: { label: 'Warning', color: '#f97316', bg: isDark ? 'rgba(249,115,22,0.12)' : '#fff7ed' },
    };
  }

  return {
    icon: <InfoIcon sx={{ color: '#6366f1' }} />,
    chip: { label: 'Info', color: '#6366f1', bg: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff' },
  };
}

export default function OperationsFeed({ recentActivity }: OperationsFeedProps) {
  const { isDark } = useMuiTheme();

  const ads = recentActivity?.latestApprovedAds || [];
  const payments = recentActivity?.recentPayments || [];

  const adFeed: FeedItem[] = ads.map((ad: any) => ({
    id: ad.id,
    title: `Ad approved: ${ad.title}`,
    description: 'Campaign is now live in listings.',
    createdAt: ad.createdAt,
    type: 'ad',
    level: 'success',
  }));

  const paymentFeed: FeedItem[] = payments.map((payment: any) => {
    const status = (payment.status || '').toUpperCase();
    const method = (payment.method || '').replace('_', ' ');
    const level: FeedLevel = status === 'VERIFIED' ? 'success' : status === 'PENDING' ? 'pending' : 'warning';

    return {
      id: payment.id,
      title: `Payment ${status || 'UPDATED'}`,
      description: `${method || 'Payment'} transaction processed.`,
      createdAt: payment.createdAt,
      type: 'payment',
      level,
    };
  });

  const feed = [...adFeed, ...paymentFeed]
    .filter((item) => item.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const grouped = feed.reduce(
    (acc, item) => {
      const key = getDateGroup(new Date(item.createdAt));
      acc[key].push(item);
      return acc;
    },
    { Today: [] as FeedItem[], Yesterday: [] as FeedItem[], Earlier: [] as FeedItem[] }
  );

  return (
    <Card
      sx={{
        borderRadius: '14px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#e5e7eb'}`,
        height: '100%',
      }}
    >
      <CardHeader
        title="Operations Feed"
        subheader="Grouped timeline of latest platform events"
        sx={{
          pb: 1,
          '& .MuiCardHeader-title': {
            fontSize: '1rem',
            fontWeight: 700,
          },
          '& .MuiCardHeader-subheader': {
            color: isDark ? '#94a3b8' : '#64748b',
          },
        }}
      />
      <CardContent sx={{ pt: 1 }}>
        {feed.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
              borderRadius: '10px',
              border: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
            }}
          >
            <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
              No recent activity to show.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {(['Today', 'Yesterday', 'Earlier'] as const).map((groupKey) => {
              const items = grouped[groupKey];
              if (!items.length) return null;

              return (
                <Box key={groupKey}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                      color: isDark ? '#94a3b8' : '#64748b',
                      mb: 1,
                      display: 'block',
                    }}
                  >
                    {groupKey}
                  </Typography>

                  <List sx={{ p: 0 }}>
                    {items.map((item, index) => {
                      const styles = levelStyles(item.level, isDark);
                      return (
                        <React.Fragment key={item.id}>
                          <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.2 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {item.type === 'ad' ? <CampaignIcon sx={{ color: '#6366f1' }} /> : <PaymentsIcon sx={{ color: '#0ea5e9' }} />}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#0f172a' }}>
                                    {item.title}
                                  </Typography>
                                  <Chip
                                    size="small"
                                    icon={styles.icon}
                                    label={styles.chip.label}
                                    sx={{
                                      backgroundColor: styles.chip.bg,
                                      color: styles.chip.color,
                                      fontWeight: 600,
                                    }}
                                  />
                                </Stack>
                              }
                              secondary={
                                <Stack spacing={0.6} component="span" mt={0.4}>
                                  <Typography component="span" variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                    {item.description}
                                  </Typography>
                                  <Typography component="span" variant="caption" sx={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                    {new Date(item.createdAt).toLocaleString()}
                                  </Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                          {index < items.length - 1 && <Divider sx={{ borderColor: isDark ? '#1e2440' : '#e2e8f0' }} />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
