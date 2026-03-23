'use client';

import { Box, Container, Stack, useMediaQuery, useTheme } from '@mui/material';
import HeaderAdmin from '@/components/HeaderAdmin';
import Sidebar from '@/components/Sidebar';
import StatCards from '@/components/StatCards';
import Charts from '@/components/Charts';
import RecentSalons from '@/components/RecentSalons';
import RightPanel from '@/components/RightPanel';
import { useMuiTheme } from '@/context/MuiThemeContext';
import AuthGuard from '@/components/AuthGuard';

export default function DashboardPage() {
  const muiTheme = useTheme();
  const { isDark } = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

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
            <Stack spacing={3}>
              {/* Stat Cards */}
              <StatCards />

              {/* Charts and Right Panel */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
                  gap: 3,
                }}
              >
                {/* Charts Section */}
                <Box>
                  <Charts />
                </Box>

                {/* Right Panel */}
                <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
                  <RightPanel />
                </Box>
              </Box>

              {/* Recent Salons */}
              <RecentSalons />
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
    </AuthGuard>
  );
}
