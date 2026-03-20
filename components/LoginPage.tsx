'use client';

import { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Link,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface LoginPageProps {
  onNavigate?: (page: string) => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Add your login logic here
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    console.log('Login with:', { email, password });
    // Add authentication logic
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              sx={{
                color: '#000',
                mb: 1,
              }}
            >
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your SalonStore.lk account
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              autoFocus
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563eb',
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#2563eb',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#2563eb',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#2563eb',
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Forgot Password Link */}
            <Box sx={{ textAlign: 'right', mb: 3 }}>
              <Link
                href="#"
                underline="hover"
                sx={{
                  color: '#2563eb',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  '&:hover': {
                    color: '#1d4ed8',
                  },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                py: 1.5,
                mb: 2,
                backgroundColor: '#000',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            >
              Sign In
            </Button>

            {/* Register with Blue Button */}
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={() => onNavigate?.('register')}
              sx={{
                py: 1.5,
                mb: 3,
                backgroundColor: '#2563eb',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1rem',
                textTransform: 'uppercase',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              Create New Account
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Back to Home */}
            <Box sx={{ textAlign: 'center' }}>
              <Link
                component="button"
                type="button"
                onClick={() => onNavigate?.('home')}
                underline="hover"
                sx={{
                  color: '#d4a32b',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': {
                    color: '#b8891f',
                  },
                }}
              >
                ← Back to Home
              </Link>
            </Box>
          </form>
        </Paper>

        {/* Footer Text */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            © 2024 SalonStore.lk - All Rights Reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
