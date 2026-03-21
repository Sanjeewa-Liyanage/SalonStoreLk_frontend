'use client';

import React, { useState } from 'react';
import {
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Stack,
  Chip,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  StorefrontOutlined as SalonIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import Link from 'next/link';

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    icon: DashboardIcon,
    href: '/admin/dashboard',
  },
  {
    label: 'Salons',
    icon: SalonIcon,
    href: '/admin/salons',
    children: [
      { label: 'All Salons', href: '/admin/salons' },
      { label: 'Pending Approval', href: '/admin/salons?tab=pending' },
      { label: 'Active Salons', href: '/admin/salons?tab=active' },
    ],
  },
  {
    label: 'Users',
    icon: PeopleIcon,
    href: '/admin/users',
    children: [
      { label: 'All Users', href: '/admin/users' },
      { label: 'Active Users', href: '/admin/users/active' },
      { label: 'Inactive Users', href: '/admin/users/inactive' },
    ],
  },
  {
    label: 'Analytics',
    icon: AnalyticsIcon,
    href: '/admin/analytics',
  },
  {
    label: 'Settings',
    icon: SettingsIcon,
    href: '/admin/settings',
  },
];

export default function Sidebar() {
  const theme = useTheme();
  const { isDark } = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['Salons', 'Users']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              SS
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              SalonStore
            </Typography>
          </Stack>
          {isMobile && (
            <IconButton size="small" onClick={handleDrawerToggle}>
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflow: 'auto' }}>
        {MENU_ITEMS.map((item) => (
          <React.Fragment key={item.label}>
            <ListItemButton
              onClick={() => item.children && toggleExpand(item.label)}
              href={!item.children ? item.href : undefined}
              component={!item.children ? Link : 'button'}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                color: isDark ? '#e2e8f0' : '#1a1d2e',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
                },
                '&.Mui-selected': {
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : '#ede9fe',
                  color: '#a78bfa',
                  '& .MuiListItemIcon-root': {
                    color: '#a78bfa',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isDark ? '#6b7a99' : '#94a3b8',
                }}
              >
                <item.icon sx={{ fontSize: '1.3rem' }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                }}
              />
              {item.children && (
                expandedItems.includes(item.label) ? <ExpandLessIcon /> : <ExpandMoreIcon />
              )}
            </ListItemButton>

            {/* Submenu */}
            {item.children && (
              <Collapse in={expandedItems.includes(item.label)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItemButton
                      key={child.label}
                      href={child.href}
                      component={Link}
                      sx={{
                        pl: 6,
                        borderRadius: '6px',
                        mb: 0.3,
                        color: isDark ? '#a0aec0' : '#718096',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f9f5ff',
                        },
                      }}
                    >
                      <ListItemText
                        primary={child.label}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontSize: '0.875rem',
                        }}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
        <Chip
          label="v1.0"
          size="small"
          sx={{
            mb: 1.5,
            width: '100%',
            backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
            color: '#a78bfa',
          }}
        />
        <ListItemButton
          sx={{
            borderRadius: '8px',
            color: '#ef4444',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fff1f2',
          },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#ef4444' }}>
            <LogoutIcon sx={{ fontSize: '1.3rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign out"
            primaryTypographyProps={{
              variant: 'body2',
              fontWeight: 500,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <Box sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}>
          <IconButton onClick={handleDrawerToggle} size="small">
            <MenuIcon sx={{ fontSize: '1.5rem' }} />
          </IconButton>
        </Box>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              backgroundColor: isDark ? '#0d0f1a' : '#ffffff',
              borderRight: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          variant="temporary"
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              backgroundColor: isDark ? '#0d0f1a' : '#ffffff',
              borderRight: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}
