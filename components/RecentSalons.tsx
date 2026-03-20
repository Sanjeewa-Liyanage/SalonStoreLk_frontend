'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';
import { exportToCSV, exportToJSON, exportToPDF } from '@/utils/exportData';

interface Salon {
  id: string;
  name: string;
  owner: string;
  location: string;
  services: number;
  rating: number;
  status: 'active' | 'pending' | 'inactive';
  registeredDate: string;
  revenue: number;
}

const SAMPLE_DATA: Salon[] = [
  {
    id: '1',
    name: 'Glamour Studio',
    owner: 'Sarah Ahmed',
    location: 'Downtown, Colombo',
    services: 12,
    rating: 4.8,
    status: 'active',
    registeredDate: '2024-01-15',
    revenue: 45000,
  },
  {
    id: '2',
    name: 'Beauty Haven',
    owner: 'Jessica Chen',
    location: 'Mall Road, Kandy',
    services: 8,
    rating: 4.6,
    status: 'active',
    registeredDate: '2024-02-10',
    revenue: 32000,
  },
  {
    id: '3',
    name: 'Elegance Spa',
    owner: 'Maria Rodriguez',
    location: 'Beach Road, Galle',
    services: 15,
    rating: 4.9,
    status: 'pending',
    registeredDate: '2024-03-05',
    revenue: 0,
  },
  {
    id: '4',
    name: 'Style Plus',
    owner: 'Anika Patel',
    location: 'City Center, Negombo',
    services: 10,
    rating: 4.5,
    status: 'active',
    registeredDate: '2024-01-20',
    revenue: 28000,
  },
  {
    id: '5',
    name: 'Luxe Salon',
    owner: 'Diana Prince',
    location: 'Suburbs, Jaffna',
    services: 7,
    rating: 4.3,
    status: 'inactive',
    registeredDate: '2023-12-01',
    revenue: 5000,
  },
  {
    id: '6',
    name: 'Radiant Beauty',
    owner: 'Emma Watson',
    location: 'Shopping District, Colombo',
    services: 14,
    rating: 4.7,
    status: 'active',
    registeredDate: '2024-02-20',
    revenue: 52000,
  },
];

const statusConfig: Record<string, { color: 'success' | 'warning' | 'error', label: string }> = {
  active: { color: 'success', label: 'Active' },
  pending: { color: 'warning', label: 'Pending' },
  inactive: { color: 'error', label: 'Inactive' },
};

export default function RecentSalons() {
  const { isDark } = useMuiTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [data] = useState<Salon[]>(SAMPLE_DATA);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = data.filter((salon) =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportCSV = () => {
    const exportData = {
      columns: ['ID', 'Salon Name', 'Owner', 'Location', 'Services', 'Rating', 'Status', 'Registered Date', 'Revenue'],
      rows: filteredData.map((salon) => ({
        ID: salon.id,
        'Salon Name': salon.name,
        Owner: salon.owner,
        Location: salon.location,
        Services: salon.services,
        Rating: salon.rating,
        Status: salon.status,
        'Registered Date': salon.registeredDate,
        Revenue: `Rs. ${salon.revenue.toLocaleString()}`,
      })),
    };
    exportToCSV(exportData, `salons-${new Date().toISOString().split('T')[0]}.csv`);
    handleExportClose();
  };

  const handleExportJSON = () => {
    const exportData = {
      columns: ['id', 'name', 'owner', 'location', 'services', 'rating', 'status', 'registeredDate', 'revenue'],
      rows: filteredData,
    };
    exportToJSON(exportData, `salons-${new Date().toISOString().split('T')[0]}.json`);
    handleExportClose();
  };

  const handleExportPDF = async () => {
    const exportData = {
      columns: ['Salon Name', 'Owner', 'Location', 'Services', 'Rating', 'Status', 'Revenue'],
      rows: filteredData.map((salon) => ({
        'Salon Name': salon.name,
        Owner: salon.owner,
        Location: salon.location,
        Services: salon.services,
        Rating: `${salon.rating} ⭐`,
        Status: salon.status,
        Revenue: `Rs. ${salon.revenue.toLocaleString()}`,
      })),
    };
    await exportToPDF(exportData, `salons-${new Date().toISOString().split('T')[0]}.pdf`);
    handleExportClose();
  };

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(filteredData.map((s) => s.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
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
        title="Recent Salons"
        subheader={`${filteredData.length} salons in total`}
        action={
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              color: '#a78bfa',
              borderColor: '#a78bfa',
              '&:hover': {
                borderColor: '#c4b5fd',
                backgroundColor: isDark ? 'rgba(167, 139, 250, 0.08)' : '#f5f3ff',
              },
            }}
          >
            Export
          </Button>
        }
        sx={{
          pb: 2,
          '& .MuiCardHeader-title': {
            fontWeight: 700,
            fontSize: '1rem',
          },
        }}
      />

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            backgroundColor: isDark ? '#141828' : '#ffffff',
            border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
          },
        }}
      >
        <MenuItem onClick={handleExportCSV}>
          <FileDownloadIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <FileDownloadIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Export as JSON
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <FileDownloadIcon sx={{ mr: 1, fontSize: '1rem' }} />
          Export as PDF
        </MenuItem>
      </Menu>

      <CardContent sx={{ p: 0 }}>
        {/* Search */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search salons by name, owner, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: '1.1rem', color: isDark ? '#6b7a99' : '#94a3b8', mr: 1 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
                '& fieldset': {
                  borderColor: isDark ? '#1e2440' : '#eaecf5',
                },
              },
            }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                    checked={filteredData.length > 0 && selectedRows.length === filteredData.length}
                    onChange={handleSelectAll}
                    sx={{ color: isDark ? '#6b7a99' : undefined }}
                  />
                </TableCell>
                {['Salon Name', 'Owner', 'Location', 'Services', 'Rating', 'Status', 'Revenue', 'Registered'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontWeight: 700,
                      color: isDark ? '#e2e8f0' : '#1a1d2e',
                      borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((salon) => {
                const isSelected = selectedRows.includes(salon.id);
                const config = statusConfig[salon.status];
                return (
                  <TableRow
                    key={salon.id}
                    hover
                    selected={isSelected}
                    onClick={() => handleSelectRow(salon.id)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: isDark ? 'rgba(167, 139, 250, 0.05)' : '#f5f3ff',
                      },
                      '&.Mui-selected': {
                        backgroundColor: isDark ? 'rgba(167, 139, 250, 0.1)' : '#ede9fe',
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(167, 139, 250, 0.15)' : '#f5f3ff',
                        },
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        sx={{ color: isDark ? '#6b7a99' : undefined }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e', borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{salon.name}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e', borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="body2">{salon.owner}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e', borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="body2">{salon.location}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Chip label={salon.services} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: isDark ? '#e2e8f0' : '#1a1d2e' }}>
                        {salon.rating} ⭐
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Chip label={config.label} size="small" color={config.color} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }} align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: salon.revenue > 0 ? '#10b981' : '#6b7a99' }}>
                        Rs. {salon.revenue.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="caption" sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e' }}>
                        {new Date(salon.registeredDate).toLocaleDateString('en-US', {
                          year: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sx={{
            borderTop: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
            backgroundColor: isDark ? '#0d0f1a' : '#f7f9ff',
            color: isDark ? '#e2e8f0' : '#1a1d2e',
          }}
        />

        {/* Selected Count */}
        {selectedRows.length > 0 && (
          <Box sx={{ p: 2, backgroundColor: isDark ? 'rgba(167, 139, 250, 0.05)' : '#f5f3ff', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#a78bfa', fontWeight: 600 }}>
              {selectedRows.length} salon{selectedRows.length !== 1 ? 's' : ''} selected
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
