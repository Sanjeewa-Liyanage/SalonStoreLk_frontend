'use client';

import { Box, Button, CircularProgress, Container, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import StatCards from '@/components/StatCards';
import Charts from '@/components/Charts';
import RecentSalons from '@/components/RecentSalons';
import OperationsFeed from '@/components/OperationsFeed';
import PendingApprovalsPanel from '@/components/PendingApprovalsPanel';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import { useMuiTheme } from '@/context/MuiThemeContext';
import AuthGuard from '@/components/AuthGuard';
import { adminDashboardRequest } from '@/lib/dashboardService';

export default function DashboardPage() {
  const muiTheme = useTheme();
  const { isDark } = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = sessionStorage.getItem('accessToken');
        if (token) {
          const res = await adminDashboardRequest(token);
          if (res.success && res.data) {
            // The API returns nested data: { success: true, data: { message: "...", data: { kpis: ... } } }
            // Some endpoints might return { success: true, data: { kpis: ... } }. We handle both just in case.
            setDashboardData(res.data.data ? res.data.data : res.data);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <AuthGuard allowedRole="ADMIN">
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: isDark ? '#0d0f1a' : '#f9fafb',
      }}
    >
      {/* Sidebar */}
      {!isMobile && <Sidebar />}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { xs: '100%', md: 'calc(100% - 280px)' },
        }}
      >
        {/* Header */}
        <HeaderAdmin
          
        />

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: isDark ? '#0d0f1a' : '#f9fafb',
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              py: 3,
              px: { xs: 2, sm: 3, md: 4 },
              maxWidth: 'none',
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                <Typography color="error">{error}</Typography>
              </Box>
            ) : dashboardData ? (
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: '1.4rem', md: '1.8rem' },
                        color: isDark ? '#f8fafc' : '#0f172a',
                      }}
                    >
                      Admin Control Center
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.6 }}
                    >
                      Monitor approvals, business performance, and operational tasks in one place.
                    </Typography>
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} width={{ xs: '100%', md: 'auto' }}>
                    <Button
                      component={Link}
                      href="/admin/salons"
                      variant="outlined"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        borderColor: '#a78bfa',
                        color: '#a78bfa',
                      }}
                    >
                      Add Salon
                    </Button>
                    <Button
                      component={Link}
                      href="/admin/ads"
                      variant="contained"
                      sx={{
                        textTransform: 'none',
                        borderRadius: '10px',
                        backgroundColor: '#a78bfa',
                        '&:hover': { backgroundColor: '#8b5cf6' },
                      }}
                    >
                      Create Ad
                    </Button>
                  </Stack>
                </Stack>

                {/* Stat Cards */}
                <StatCards kpis={dashboardData.kpis} />

                {/* Critical Alerts / Pending Approvals */}
                <PendingApprovalsPanel kpis={dashboardData.kpis} recentActivity={dashboardData.recentActivity} />

                {/* Business Insights */}
                <Stack spacing={1.2}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Business Insights
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Track ad performance and location distribution to guide growth decisions.
                  </Typography>
                  <Charts chartsData={dashboardData.charts} />
                </Stack>

                {/* Recent Activity + Quick Actions */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '1.6fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <OperationsFeed recentActivity={dashboardData.recentActivity} />
                  </Box>
                  <Box>
                    <QuickActionsPanel />
                  </Box>
                </Box>

                <Divider sx={{ borderColor: isDark ? '#1e2440' : '#e2e8f0' }} />

                {/* Data Management Table */}
                <Stack spacing={1.2}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                    Data Management
                  </Typography>
                  <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                    Search, filter, and manage salons requiring operational review.
                  </Typography>
                </Stack>
                <RecentSalons activity={dashboardData.recentActivity} />
              </Stack>
            ) : null}
          </Container>
        </Box>
      </Box>
    </Box>
    </AuthGuard>
  );
}
