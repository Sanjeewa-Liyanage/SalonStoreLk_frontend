'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Stack,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchNotifications, markAllAsRead, markAllNotificationsRead, markAsRead, markNotificationRead } from '@/lib/store/slices/notificationSlice';

interface HeaderProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function HeaderAdmin({
  pageTitle = 'Dashboard',
  pageSubtitle = "Welcome back — here's what's happening today.",
}: HeaderProps) {
  const { isDark, toggleTheme } = useMuiTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const [search, setSearch] = useState('');
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);
  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(event.currentTarget);
    // Fetch notifications list when pane is opened
    dispatch(fetchNotifications());
  };

  const handleNotifClose = () => {
    setNotifAnchor(null);
  };

  const handleUserClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchor(event.currentTarget);
  };

  const handleUserClose = () => {
    setUserAnchor(null);
  };

  const handleLogout = () => {
    handleUserClose();
    logout();
    router.push('/auth/login');
  };

  const handleProfileNavigation = () => {
    handleUserClose();
    router.push('/admin/profile');
  };

  const handleSettingsNavigation = () => {
    handleUserClose();
    router.push('/admin/settings');
  };

  const filteredNotifications =
    notifFilter === 'unread' ? notifications.filter((n: any) => n.status === 'UNREAD') : notifications;

  const handleNotificationItemClick = (notification: any) => {
    const notificationId = notification?.id;
    if (!notificationId || notification?.status !== 'UNREAD') return;

    dispatch(markAsRead(notificationId));
    void dispatch(markNotificationRead(notificationId));
  };

  const handleMarkAllNotificationsRead = () => {
    if (unreadCount <= 0) return;

    dispatch(markAllAsRead());
    void dispatch(markAllNotificationsRead());
  };

  const displayName = user?.name || user?.firstName || user?.lastName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Admin User'
    : 'Admin User';
  const displayEmail = user?.email || 'admin@salonstore.lk';
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase() || 'AD'
    : 'AD';
  
  // Use user avatar if available
  const avatarSrc = user?.profilePictureUrl || user?.avatarUrl || '';

  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: isDark ? '#141828' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#1a1d2e',
          borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
          boxShadow: 'none',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
          }}
        >
          {/* Left Section - Title */}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: isDark ? '#f1f5f9' : '#1a1d2e',
              }}
            >
              {pageTitle}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isDark ? '#6b7a99' : '#94a3b8',
                display: 'block',
                mt: 0.5,
              }}
            >
              {pageSubtitle}
            </Typography>
          </Box>

          {/* Right Section - Controls */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                width: { xs: 0, sm: 0, md: 250 },
                display: { xs: 'none', md: 'flex' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
                  '& fieldset': {
                    borderColor: isDark ? '#1e2440' : '#eaecf5',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? '#2a3050' : '#d0d5e5',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '0.875rem',
                  color: isDark ? '#e2e8f0' : '#1a1d2e',
                  '&::placeholder': {
                    color: isDark ? '#6b7a99' : '#94a3b8',
                    opacity: 1,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: '1rem', color: isDark ? '#6b7a99' : '#94a3b8' }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Theme Toggle */}
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                border: `1.5px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                borderRadius: '10px',
                color: isDark ? '#6b7a99' : '#94a3b8',
                '&:hover': {
                  borderColor: '#a78bfa',
                  color: '#a78bfa',
                },
              }}
            >
              {isDark ? <LightIcon sx={{ fontSize: '1.1rem' }} /> : <DarkIcon sx={{ fontSize: '1.1rem' }} />}
            </IconButton>

            {/* Notifications */}
            <IconButton
              onClick={handleNotifClick}
              size="small"
              sx={{
                border: `1.5px solid ${notifAnchor ? '#a78bfa' : isDark ? '#1e2440' : '#eaecf5'}`,
                borderRadius: '10px',
                color: notifAnchor ? '#a78bfa' : isDark ? '#6b7a99' : '#94a3b8',
                backgroundColor: notifAnchor ? (isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff') : 'transparent',
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ fontSize: '1.1rem' }} />
              </Badge>
            </IconButton>

            {/* User Menu */}
            <Button
              onClick={handleUserClick}
              sx={{
                p: 0.4,
                minWidth: 'auto',
                borderRadius: '10px',
                textTransform: 'none',
                gap: 1,
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
                },
              }}
            >
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {!avatarSrc && initials}
              </Avatar>
              <Typography
                sx={{
                  display: { xs: 'none', sm: 'block' },
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: isDark ? '#dbe4ff' : '#1f2937',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayName}
              </Typography>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleNotifClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflowY: 'hidden',
            mt: 1,
            borderRadius: '16px',
            backgroundColor: isDark ? '#141828' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={`${unreadCount} Unread`}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Button
                size="small"
                variant="text"
                disabled={unreadCount <= 0}
                onClick={handleMarkAllNotificationsRead}
              >
                Mark all as read
              </Button>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant={notifFilter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setNotifFilter('all')}
            >
              All
            </Button>
            <Button
              size="small"
              variant={notifFilter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setNotifFilter('unread')}
            >
              Unread
            </Button>
          </Stack>
        </Box>

        <List
          sx={{
            maxHeight: 300,
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {filteredNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                sx={{ textAlign: 'center', color: isDark ? '#6b7a99' : '#94a3b8' }}
              />
            </ListItem>
          ) : (
            filteredNotifications.map((notif: any, idx: number) => (
              <React.Fragment key={notif.id || idx}>
                <ListItem
                  onClick={() => handleNotificationItemClick(notif)}
                  sx={{
                    py: 2,
                    cursor: notif.status === 'UNREAD' ? 'pointer' : 'default',
                    backgroundColor: notif.status === 'UNREAD'
                      ? isDark
                        ? 'rgba(167, 139, 250, 0.05)'
                        : '#fafbff'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f5f3ff',
                    },
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.03)' : '#f7f9ff'}`,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: notif.status === 'UNREAD' ? '#6366f1' : isDark ? '#2a3050' : '#e2e8f0',
                      mr: 2,
                      flexShrink: 0,
                      mt: 0.3,
                    }}
                  />
                  <ListItemText
                    primary={notif.message || notif.title || 'Notification'}
                    secondary={notif.createdAt ? new Date(notif.createdAt).toLocaleString() : notif.time || 'Just now'}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: notif.status === 'UNREAD'
                        ? isDark
                          ? '#f1f5f9'
                          : '#1a1d2e'
                        : isDark
                          ? '#6b7a99'
                          : '#94a3b8',
                    }}
                    secondaryTypographyProps={{
                      variant: 'caption',
                      color: isDark ? '#6b7a99' : '#94a3b8',
                    }}
                  />
                </ListItem>
              </React.Fragment>
            ))
          )}
        </List>

        <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <Button
            size="small"
            href="/admin/notifications"
            sx={{
              color: '#a78bfa',
              textDecoration: 'none',
              fontSize: '0.75rem',
              fontWeight: 600,
              '&:hover': {
                color: '#c4b5fd',
              },
            }}
          >
            View all notifications →
          </Button>
        </Box>
      </Popover>

      {/* User Menu Popover */}
      <Menu
        anchorEl={userAnchor}
        open={Boolean(userAnchor)}
        onClose={handleUserClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 220,
            borderRadius: '12px',
            backgroundColor: isDark ? '#141828' : '#ffffff',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
            mt: 1,
          },
        }}
      >
        <Box sx={{ px: 2, py: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={avatarSrc}
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {!avatarSrc && initials}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {displayName}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
                {displayEmail}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <MenuItem
          onClick={handleProfileNavigation}
          sx={{
            py: 1.5,
            px: 2,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f5f3ff',
            },
          }}
        >
          <PersonIcon sx={{ mr: 2, fontSize: '1rem' }} />
          My Profile
        </MenuItem>

        <MenuItem
          onClick={handleSettingsNavigation}
          sx={{
            py: 1.5,
            px: 2,
            fontSize: '0.875rem',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f5f3ff',
            },
          }}
        >
          <SettingsIcon sx={{ mr: 2, fontSize: '1rem' }} />
          Settings
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            px: 2,
            fontSize: '0.875rem',
            color: '#ef4444',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fff1f2',
            },
          }}
        >
          <LogoutIcon sx={{ mr: 2, fontSize: '1rem' }} />
          Sign out
        </MenuItem>
      </Menu>
    </>
  );
}
