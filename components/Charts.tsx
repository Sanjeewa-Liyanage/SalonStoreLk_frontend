'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Stack,
  LinearProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMuiTheme } from '@/context/MuiThemeContext';

interface ChartsData {
  adsByPlan?: { planName: string; count: number }[];
  salonsByCity?: { city: string; count: number }[];
}

interface AdsByPlanChartProps {
  isDark: boolean;
  data: { planName: string; count: number }[];
}

function AdsByPlanChart({ isDark, data }: AdsByPlanChartProps) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
      }}
    >
      <CardHeader
        title="Ads by Plan"
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': {
            fontWeight: 700,
            fontSize: '1rem',
          },
        }}
      />
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e2440' : '#eaecf5'}
            />
            <XAxis dataKey="planName" stroke={isDark ? '#6b7a99' : '#94a3b8'} />
            <YAxis allowDecimals={false} stroke={isDark ? '#6b7a99' : '#94a3b8'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#141828' : '#ffffff',
                border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#1a1d2e',
              }}
            />
            <Legend wrapperStyle={{ color: isDark ? '#f1f5f9' : '#1a1d2e' }} />
            <Bar dataKey="count" fill="#a78bfa" radius={[8, 8, 0, 0]} name="Ads count" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface SalonsByCityChartProps {
  isDark: boolean;
  data: { city: string; count: number }[];
}

function SalonsByCityChart({ isDark, data }: SalonsByCityChartProps) {
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const topCount = sorted[0]?.count || 1;

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
        title="Top Cities"
        subheader="Ranked by number of salons"
        sx={{
          pb: 2,
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
        {sorted.length === 0 ? (
          <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
            No city data available.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {sorted.map((item, index) => {
              const progress = (item.count / topCount) * 100;
              return (
                <Box key={item.city}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.8}>
                    <Typography variant="body2" sx={{ color: isDark ? '#e2e8f0' : '#0f172a', fontWeight: 600 }}>
                      {index + 1}. {item.city}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b', fontWeight: 700 }}>
                      {item.count} salons
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: '999px',
                      backgroundColor: isDark ? '#1f2937' : '#e2e8f0',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: '999px',
                        backgroundColor: '#a78bfa',
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default function Charts({ chartsData }: { chartsData?: ChartsData }) {
  const { isDark } = useMuiTheme();

  if (!chartsData) return null;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
      <Box>
        <AdsByPlanChart isDark={isDark} data={chartsData.adsByPlan || []} />
      </Box>
      <Box>
        <SalonsByCityChart isDark={isDark} data={chartsData.salonsByCity || []} />
      </Box>
    </Box>
  );
}
