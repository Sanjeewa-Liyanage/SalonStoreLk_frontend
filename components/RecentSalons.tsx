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
  Tabs,
  Tab,
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
  CheckCircleOutline as CheckCircleOutlineIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
  HighlightOff as HighlightOffIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMuiTheme } from '@/context/MuiThemeContext';

type SalonTab = 'pending' | 'approved' | 'rejected';

const statusConfig: Record<string, { color: 'success' | 'warning' | 'error' | 'default', label: string }> = {
  active: { color: 'success', label: 'Active' },
  pending: { color: 'warning', label: 'Pending' },
  inactive: { color: 'error', label: 'Inactive' },
  draft: { color: 'default', label: 'Draft' },
};

export default function RecentSalons({ activity }: { activity?: any }) {
  const { isDark } = useMuiTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SalonTab>('pending');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const pendingData = activity?.pendingSalons || [];
  const approvedData = activity?.approvedSalons || [];
  const rejectedData = activity?.rejectedSalons || [];

  const tabData =
    activeTab === 'approved' ? approvedData : activeTab === 'rejected' ? rejectedData : pendingData;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredData = tabData.filter((salon: any) =>
    (salon.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (salon.ownerName || salon.owner || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (salon.city || salon.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportCSV = () => {
    // Basic CSV implementation or integration with your utils
    handleExportClose();
  };

  const handleExportJSON = () => {
    handleExportClose();
  };

  const handleExportPDF = () => {
    handleExportClose();
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(filteredData.map((salon: any) => salon.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleTabChange = (_event: React.SyntheticEvent, value: SalonTab) => {
    setActiveTab(value);
    setSelectedRows([]);
    setPage(0);
  };

  const emptyLabel = activeTab === 'pending' ? 'No pending salons found.' : activeTab === 'approved' ? 'No approved salons available yet.' : 'No rejected salons available yet.';

  const paginatedData = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Card
      sx={{
        borderRadius: '12px',
        backgroundColor: isDark ? '#141828' : '#ffffff',
        border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
      }}
    >
      <CardHeader
        title="Pending Salons Table"
        subheader="Search, filter, and manage approval workflows"
        action={
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExportClick}
            sx={{
              backgroundColor: '#a78bfa',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#8b5cf6',
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
          '& .MuiCardHeader-subheader': {
            color: isDark ? '#94a3b8' : '#64748b',
          },
        }}
      />
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        PaperProps={{
          sx: {
            backgroundColor: isDark ? '#141828' : '#ffffff',
            border: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}`,
            color: isDark ? '#e2e8f0' : '#1a1d2e',
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
        <Box sx={{ px: 2, pt: 1, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTabs-indicator': {
                backgroundColor: '#a78bfa',
              },
            }}
          >
            <Tab
              value="pending"
              label={`Pending (${pendingData.length})`}
              sx={{ textTransform: 'none', minHeight: 40, color: isDark ? '#cbd5e1' : '#475569' }}
            />
            <Tab
              value="approved"
              label={`Approved (${approvedData.length})`}
              sx={{ textTransform: 'none', minHeight: 40, color: isDark ? '#cbd5e1' : '#475569' }}
            />
            <Tab
              value="rejected"
              label={`Rejected (${rejectedData.length})`}
              sx={{ textTransform: 'none', minHeight: 40, color: isDark ? '#cbd5e1' : '#475569' }}
            />
          </Tabs>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          justifyContent="space-between"
          sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#cbd5e1' : '#334155',
              }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              disabled
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              City
            </Button>
            <Button
              variant="outlined"
              disabled
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              Owner
            </Button>
            <Button
              variant="outlined"
              disabled
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                color: isDark ? '#94a3b8' : '#64748b',
              }}
            >
              Date
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleOutlineIcon />}
              disabled={activeTab !== 'pending' || selectedRows.length === 0}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Approve Selected
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<HighlightOffIcon />}
              disabled={activeTab !== 'pending' || selectedRows.length === 0}
              sx={{ textTransform: 'none', borderRadius: '8px' }}
            >
              Reject Selected
            </Button>
          </Stack>
        </Stack>

        {/* Search */}
        <Box sx={{ p: 2, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder={`Search ${activeTab} salons by name, owner, or location...`}
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
                {['Salon Name', 'Owner', 'Location', 'Status', 'Registered'].map((header) => (
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
              {paginatedData.map((salon: any) => {
                const isSelected = selectedRows.includes(salon.id);
                const statusKey = (salon.status || 'pending').toLowerCase();
                const config = statusConfig[statusKey] || statusConfig.pending;
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
                      <Typography variant="body2">{salon.ownerName || salon.owner || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e', borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="body2">{salon.city || salon.location || 'N/A'}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Chip label={config.label} size="small" color={config.color} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                      <Typography variant="caption" sx={{ color: isDark ? '#e2e8f0' : '#1a1d2e' }}>
                        {salon.createdAt || salon.registeredDate ? new Date(salon.createdAt || salon.registeredDate).toLocaleDateString('en-US', {
                          year: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        }) : 'N/A'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, borderBottom: `1px solid ${isDark ? '#1e2440' : '#eaecf5'}` }}>
                    <Typography variant="body2" sx={{ color: isDark ? '#6b7a99' : '#94a3b8' }}>
                      {emptyLabel}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
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
