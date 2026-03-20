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
  AvatarGroup,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as AlertCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

const notifications = [
  {
    id: 1,
    title: 'New Salon Approval',
    description: 'Beauty Haven submitted for verification',
    time: '2 hours ago',
    icon: NotificationsIcon,
    color: '#0ea5e9',
    type: 'info',
  },
  {
    id: 2,
    title: 'Revenue Milestone',
    description: 'Monthly revenue exceeded Rs. 2M',
    time: '5 hours ago',
    icon: TrendingUpIcon,
    color: '#10b981',
    type: 'success',
  },
  {
    id: 3,
    title: 'System Alert',
    description: 'High database load detected',
    time: '1 day ago',
    icon: AlertCircleIcon,
    color: '#f59e0b',
    type: 'warning',
  },
  {
    id: 4,
    title: 'Backup Complete',
    description: 'Daily backup completed successfully',
    time: '2 days ago',
    icon: CheckCircleIcon,
    color: '#10b981',
    type: 'success',
  },
];

const topPerformers = [
  { id: 1, name: 'Glamour Studio', avatar: 'GS', revenue: 45000 },
  { id: 2, name: 'Radiant Beauty', avatar: 'RB', revenue: 52000 },
  { id: 3, name: 'Style Plus', avatar: 'SP', revenue: 38000 },
];

const teamMembers = [
  { id: 1, name: 'Sarah A.', avatar: 'SA' },
  { id: 2, name: 'Jessica C.', avatar: 'JC' },
  { id: 3, name: 'Maria R.', avatar: 'MR' },
  { id: 4, name: 'Anika P.', avatar: 'AP' },
];

export default function RightPanel() {
  const { isDark } = useMuiTheme();
  const [activeTab, setActiveTab] = useState<'notifications' | 'performance' | 'team'>('notifications');

  const renderNotifications = () => (
    <List sx={{ p: 0 }}>
      {notifications.map((notif, index) => {
        const Icon = notif.icon;
        return (
          <React.Fragment key={notif.id}>
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
                  color: notif.color,
                }}
              >
                <Icon sx={{ fontSize: '1.2rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {notif.title}
                  </Typography>
                }
                secondary={
                  <Stack spacing={0.5} component="span">
                    <Typography variant="caption" component="span" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
                      {notif.description}
                    </Typography>
                    <Typography variant="caption" component="span" sx={{ color: isDark ? '#4a5068' : '#cbd5e1' }}>
                      {notif.time}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
            {index < notifications.length - 1 && (
              <Divider sx={{ my: 1, borderColor: isDark ? '#1e2440' : '#eaecf5' }} />
            )}
          </React.Fragment>
        );
      })}
    </List>
  );

  const renderPerformance = () => (
    <Stack spacing={2.5}>
      {topPerformers.map((performer) => (
        <Box key={performer.id}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {performer.avatar}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {performer.name}
                </Typography>
                <Typography variant="caption" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
                  Revenue
                </Typography>
              </Box>
            </Stack>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#10b981',
              }}
            >
              Rs. {(performer.revenue / 1000).toFixed(0)}K
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(performer.revenue / 52000) * 100}
            sx={{
              height: 6,
              borderRadius: '3px',
              backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
              '& .MuiLinearProgress-bar': {
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
              },
            }}
          />
        </Box>
      ))}
    </Stack>
  );

  const renderTeam = () => (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Team Members
        </Typography>
        <AvatarGroup max={4}>
          {teamMembers.map((member) => (
            <Avatar
              key={member.id}
              sx={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: `2px solid ${isDark ? '#141828' : '#ffffff'}`,
              }}
            >
              {member.avatar}
            </Avatar>
          ))}
        </AvatarGroup>
      </Box>

      <Divider sx={{ borderColor: isDark ? '#1e2440' : '#eaecf5' }} />

      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            System Status
          </Typography>
          <Chip label="Operational" color="success" size="small" />
        </Stack>
        <Stack spacing={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
              Server Load
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              62%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={62}
            sx={{
              height: 6,
              borderRadius: '3px',
              backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
              '& .MuiLinearProgress-bar': {
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #a78bfa, #c4b5fd)',
              },
            }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
              Database Usage
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              45%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={45}
            sx={{
              height: 6,
              borderRadius: '3px',
              backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
              '& .MuiLinearProgress-bar': {
                borderRadius: '3px',
                background: 'linear-gradient(90deg, #0ea5e9, #06b6d4)',
              },
            }}
          />
        </Stack>
      </Box>
    </Stack>
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
        title="Quick Insights"
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
          { id: 'notifications', label: 'Notifications' },
          { id: 'performance', label: 'Performance' },
          { id: 'team', label: 'Team' },
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
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'performance' && renderPerformance()}
        {activeTab === 'team' && renderTeam()}
      </CardContent>
    </Card>
  );
}
