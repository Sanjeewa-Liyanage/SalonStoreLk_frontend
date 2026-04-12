'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Link as MuiLink,
  TextField,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getAdsAndPayment } from '@/lib/adsService';
import { verifyPayment, rejectPayment } from '@/lib/paymentService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

interface AdDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  adId: string | null;
}

export default function AdDetailsDialog({ open, onClose, adId }: AdDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (open && adId) {
      fetchDetails(adId);
    } else {
      setData(null);
      setError(null);
    }
  }, [open, adId]);

  const fetchDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      if (!token) throw new Error('No access token found.');
      const response = await getAdsAndPayment(id, token);
      setData(response);
    } catch (err: any) {
      console.error('Failed to fetch ad details:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId: string) => {
    setVerifying(paymentId);
    try {
      await verifyPayment(paymentId);
      if (adId) await fetchDetails(adId);
    } catch (err: any) {
      console.error('Failed to verify payment:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to verify payment.');
    } finally {
      setVerifying(null);
    }
  };

  const handleRejectClick = (paymentId: string) => {
    setRejectingId(paymentId);
    setRejectReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectingId || !rejectReason.trim()) return;
    setRejecting(rejectingId);
    try {
      await rejectPayment(rejectingId, rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
      if (adId) await fetchDetails(adId);
    } catch (err: any) {
      console.error('Failed to reject payment:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to reject payment.');
    } finally {
      setRejecting(null);
    }
  };

  const statusColor = (status: string) => {
    const normalized = (status || '').toUpperCase();
    if (normalized === 'APPROVED') return 'success';
    if (normalized === 'PENDING_APPROVAL' || normalized === 'PENDING_VERIFICATION') return 'warning';
    if (normalized === 'REJECTED') return 'error';
    return 'default';
  };

  const isPdf = (url?: string) => {
    if (!url) return false;
    // Check if the URL contains .pdf before query parameters
    const cleanUrl = url.split('?')[0].toLowerCase();
    return cleanUrl.endsWith('.pdf');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">Ad Details & Payment Proof</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : data ? (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            {/* Ad Details Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Ad Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Title</Typography>
                  <Typography variant="body1">{data.ad?.title || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body2">{data.ad?.description || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Salon Name</Typography>
                  <Typography variant="body2">{data.ad?.salonName || '-'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Ad Status</Typography>
                  <Box mt={0.5}>
                    <Chip
                      size="small"
                      label={(data.ad?.status || 'Unknown').replace('_', ' ')}
                      color={statusColor(data.ad?.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>

                {data.ad?.imageUrl && data.ad.imageUrl.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>Ad Images</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                      {data.ad.imageUrl.map((img: string, i: number) => (
                        <Box
                          key={i}
                          component="img"
                          src={img}
                          alt={`Ad Image ${i + 1}`}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: '1px solid #eee'
                          }}
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {data.ad?.videoUrl && data.ad.videoUrl.length > 0 && (
                  <Box mt={1.5}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>Ad Videos</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 0.5 }}>
                      {data.ad.videoUrl.map((vid: string, i: number) => (
                        <Box
                          key={i}
                          sx={{
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid #eee',
                            bgcolor: '#000',
                            cursor: 'pointer',
                          }}
                          onClick={() => window.open(vid, '_blank')}
                        >
                          <video
                            src={vid}
                            controls
                            muted
                            loop
                            preload="metadata"
                            style={{
                              width: '100%',
                              maxHeight: 220,
                              display: 'block',
                              objectFit: 'contain',
                            }}
                            title={`Ad Video ${i + 1}`}
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Payment Details Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>Payment Details</Typography>
              {data.payments && data.payments.length > 0 ? (
                data.payments.map((payment: any, idx: number) => (
                  <Box key={payment.id || idx} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #eaecf5' }}>

                    <Box>
                      <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                      <Typography variant="body2">{payment.transactionId || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body2">{payment.paymentMethod || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                      <Box mt={0.5}>
                        <Chip
                          size="small"
                          label={(payment.status || 'Unknown').replace('_', ' ')}
                          color={statusColor(payment.status)}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Payment Date</Typography>
                      <Typography variant="body2">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}
                      </Typography>
                    </Box>

                    {payment.paymentProofUrl && (
                      <Box mt={1}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>Payment Proof</Typography>
                        <Box mt={0.5}>
                          {isPdf(payment.paymentProofUrl) ? (
                            <Button
                              variant="outlined"
                              startIcon={<PictureAsPdfIcon color="error" />}
                              endIcon={<OpenInNewIcon />}
                              onClick={() => window.open(payment.paymentProofUrl, '_blank')}
                              size="small"
                              sx={{ textTransform: 'none' }}
                            >
                              View PDF Document
                            </Button>
                          ) : (
                            <Box
                              component="img"
                              src={payment.paymentProofUrl}
                              alt="Payment Proof"
                              sx={{
                                maxWidth: '100%',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: '1px solid #eee',
                                bgcolor: '#f8fafc'
                              }}
                              onClick={() => window.open(payment.paymentProofUrl, '_blank')}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {payment.status !== 'VERIFIED' && payment.status !== 'REJECTED' && (
                      <Box mt={1.5} sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={verifying === payment.id ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineIcon />}
                          disabled={verifying === payment.id || rejecting === payment.id}
                          onClick={() => handleVerify(payment.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          {verifying === payment.id ? 'Verifying...' : 'Verify Payment'}
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={rejecting === payment.id ? <CircularProgress size={16} color="inherit" /> : <CancelOutlinedIcon />}
                          disabled={verifying === payment.id || rejecting === payment.id}
                          onClick={() => handleRejectClick(payment.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          {rejecting === payment.id ? 'Rejecting...' : 'Reject Payment'}
                        </Button>
                      </Box>
                    )}

                    {rejectingId === payment.id && (
                      <Box mt={1.5} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <TextField
                          size="small"
                          label="Rejection Reason"
                          placeholder="e.g. fraud detected"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          multiline
                          minRows={1}
                          maxRows={3}
                          sx={{ flex: 1 }}
                        />
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          disabled={!rejectReason.trim() || rejecting === payment.id}
                          onClick={handleRejectConfirm}
                          sx={{ textTransform: 'none', mt: 0.5 }}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setRejectingId(null)}
                          sx={{ textTransform: 'none', mt: 0.5 }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">No payment records found.</Typography>
              )}
            </Box>
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
