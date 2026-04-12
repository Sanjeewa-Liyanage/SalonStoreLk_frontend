import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearAuthTokens, setAccessToken } from '@/lib/tokenStorage';

interface User {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    name?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // starts true while checking session
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isLoading = false;
            setAccessToken(action.payload.accessToken);
            
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            clearAuthTokens();
        },
        setAuthLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
});

export const { setCredentials, logout, setAuthLoading } = authSlice.actions;
export default authSlice.reducer;