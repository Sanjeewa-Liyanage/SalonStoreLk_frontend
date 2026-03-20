'use client';

import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useMuiTheme } from '@/context/MuiThemeContext';

const revenueData = [
  { month: 'Jan', revenue: 45000, users: 2400 },
  { month: 'Feb', revenue: 52000, users: 2810 },
  { month: 'Mar', revenue: 48000, users: 2290 },
  { month: 'Apr', revenue: 61000, users: 2000 },
  { month: 'May', revenue: 55000, users: 2181 },
  { month: 'Jun', revenue: 67000, users: 2500 },
];

const categoryData = [
  { name: 'Hair Salon', value: 35, color: '#a78bfa' },
  { name: 'Spa & Massage', value: 25, color: '#0ea5e9' },
  { name: 'Makeup', value: 20, color: '#f59e0b' },
  { name: 'Nail Art', value: 15, color: '#10b981' },
  { name: 'Other', value: 5, color: '#8b5cf6' },
];

const userActivityData = [
  { day: 'Mon', visits: 2400, bookings: 1200 },
  { day: 'Tue', visits: 3000, bookings: 1398 },
  { day: 'Wed', visits: 2780, bookings: 1908 },
  { day: 'Thu', visits: 3908, bookings: 2800 },
  { day: 'Fri', visits: 4800, bookings: 3908 },
  { day: 'Sat', visits: 3800, bookings: 4800 },
  { day: 'Sun', visits: 4300, bookings: 3800 },
];

interface RevenueChartProps {
  isDark: boolean;
}

function RevenueChart({ isDark }: RevenueChartProps) {
  const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');

  const handleChartChange = (event: any, newChartType: 'line' | 'bar') => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
      }}
    >
      <CardHeader
        title="Revenue & Users"
        action={
          <ToggleButtonGroup
            value={chartType}
            exclusive
            onChange={handleChartChange}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                borderColor: isDark ? '#1e2440' : '#eaecf5',
                color: isDark ? '#6b7a99' : '#94a3b8',
                '&.Mui-selected': {
                  backgroundColor: '#a78bfa',
                  color: '#fff',
                  borderColor: '#a78bfa',
                  '&:hover': {
                    backgroundColor: '#c4b5fd',
                  },
                },
              },
            }}
          >
            <ToggleButton value="line">Line</ToggleButton>
            <ToggleButton value="bar">Bar</ToggleButton>
          </ToggleButtonGroup>
        }
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
          {chartType === 'line' ? (
            <LineChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#1e2440' : '#eaecf5'}
              />
              <XAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
              <YAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#141828' : '#ffffff',
                  border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#1a1d2e',
                }}
              />
              <Legend wrapperStyle={{ color: isDark ? '#f1f5f9' : '#1a1d2e' }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ fill: '#a78bfa', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={revenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#1e2440' : '#eaecf5'}
              />
              <XAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
              <YAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#141828' : '#ffffff',
                  border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#1a1d2e',
                }}
              />
              <Legend wrapperStyle={{ color: isDark ? '#f1f5f9' : '#1a1d2e' }} />
              <Bar dataKey="revenue" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="users" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function CategoryChart({ isDark }: RevenueChartProps) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
      }}
    >
      <CardHeader
        title="Service Categories"
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': {
            fontWeight: 700,
            fontSize: '1rem',
          },
        }}
      />
      <CardContent>
        <Stack spacing={2}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={80}
                fill="#a78bfa"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#141828' : '#ffffff',
                  border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f1f5f9' : '#1a1d2e',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {categoryData.map((cat) => (
              <Chip
                key={cat.name}
                label={`${cat.name} ${cat.value}%`}
                size="small"
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: cat.color,
                      mr: 1,
                    }}
                  />
                }
                sx={{
                  backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#f5f3ff',
                  color: isDark ? '#e2e8f0' : '#1a1d2e',
                }}
              />
            ))}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ActivityChart({ isDark }: RevenueChartProps) {
  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
      }}
    >
      <CardHeader
        title="Weekly Activity"
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
          <AreaChart data={userActivityData}>
            <defs>
              <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#1e2440' : '#eaecf5'}
            />
            <XAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
            <YAxis stroke={isDark ? '#6b7a99' : '#94a3b8'} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#141828' : '#ffffff',
                border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                borderRadius: '8px',
                color: isDark ? '#f1f5f9' : '#1a1d2e',
              }}
            />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#a78bfa"
              fillOpacity={1}
              fill="url(#colorVisits)"
            />
            <Area
              type="monotone"
              dataKey="bookings"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorBookings)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function Charts() {
  const { isDark } = useMuiTheme();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
      <Box>
        <RevenueChart isDark={isDark} />
      </Box>
      <Box>
        <CategoryChart isDark={isDark} />
      </Box>
      <Box sx={{ gridColumn: '1 / -1' }}>
        <ActivityChart isDark={isDark} />
      </Box>
    </Box>
  );
}
