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
  AdsClick as AdsClickIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
      { label: 'Suspended Salons', href: '/admin/salons?tab=suspended' },
      { label: 'Rejected Salons', href: '/admin/salons?tab=rejected' },
    ],
  },
  {
    label: 'Users',
    icon: PeopleIcon,
    href: '/admin/users',
    children: [
      { label: 'All Users', href: '/admin/users' },
      { label: 'Salon Owners', href: '/admin/users?role=SALON_OWNER' },
      { label: 'Customers', href: '/admin/users?role=CUSTOMER' },
      { label: 'Suspended Users', href: '/admin/users?status=SUSPENDED' },
    ],
  },
  {
    label: 'Ads',
    icon: AdsClickIcon,
    href: '/admin/ads',
    children:[
      {label: 'All Ads', href: '/admin/ads'},
      {label: 'Active Ads', href: '/admin/ads?status=active'},
      {label: 'Pending Ads', href: '/admin/ads?status=pending'},
      {label: 'Rejected Ads', href: '/admin/ads?status=rejected'},
    ]
  },
  {
    label: 'Ads Plans',
    icon: AnalyticsIcon,
    href: '/admin/adsplans',

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
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Construct full current path
  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

  // Automatically expand the parent if a child is active
  React.useEffect(() => {
    MENU_ITEMS.forEach(item => {
      if (item.children) {
        const isChildActive = item.children.some(child => currentPath === child.href);
        if (isChildActive && !expandedItems.includes(item.label)) {
          setExpandedItems(prev => [...prev, item.label]);
        }
      }
    });
  }, [currentPath]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

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
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }} aria-label="Go to homepage">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Image
                src="/logo.png"
                alt="SalonStore"
                width={36}
                height={36}
                priority
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
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
          </Link>
          {isMobile && (
            <IconButton size="small" onClick={handleDrawerToggle}>
              <CloseIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2, overflow: 'auto', scrollbarWidth:'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {MENU_ITEMS.map((item) => (
          <React.Fragment key={item.label}>
            <ListItemButton
              onClick={() => item.children && toggleExpand(item.label)}
              href={!item.children ? item.href : undefined}
              component={!item.children ? Link : 'button'}
              selected={currentPath === item.href || (item.children && item.children.some(child => currentPath === child.href))}
              sx={{
                width: '100%',
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
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(167, 139, 250, 0.2)' : '#ddd6fe',
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
                      selected={currentPath === child.href}
                      sx={{
                        width: '100%',
                        pl: 6,
                        borderRadius: '6px',
                        mb: 0.3,
                        color: isDark ? '#a0aec0' : '#718096',
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f9f5ff',
                        },
                        '&.Mui-selected': {
                          backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
                          color: '#a78bfa',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : '#ede9fe',
                          },
                        },
                        '& .MuiListItemText-primary': {
                          fontSize: '0.875rem',
                        }
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
          onClick={handleLogout}
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
