// lib/store/SocketInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './hooks';
import { addNotification, fetchUnreadCount } from './slices/notificationSlice';
// Import the standalone toast function (NOT the hook) from the same module
// that the <Toaster /> component reads from — @/hooks/use-toast
import { toast } from '@/hooks/use-toast';

const SOCKET_URL = 'https://salon-store-lk-prod-707068751976.asia-south1.run.app';

export function SocketInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        // Clean up any existing socket before creating a new one
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        if (!isAuthenticated) return;

        // 1. Fetch initial unread count on login
        dispatch(fetchUnreadCount());

        const token = sessionStorage.getItem('accessToken');
        if (!token) return;

        // 2. Initialize Socket Connection
        const socket = io(SOCKET_URL, {
            auth: { token: token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(`✅ Socket connected successfully. ID: ${socket.id}`);
        });

        // 3. Listen to all backend notification event types
        const notificationEvents = [
            'salon-created',
            'ad-created',
            'ad-submitted',
            'user-registered',
            'notification',
        ];

        notificationEvents.forEach(eventName => {
            socket.on(eventName, (newNotification: any) => {
                console.log(`🚀 Real-time notification received [${eventName}]:`, newNotification);

                // Update Redux state (badge count increments automatically)
                dispatch(addNotification(newNotification));

                // Show toast using the standalone function
                toast({
                    title: newNotification.title || eventName.replace(/-/g, ' ').toUpperCase(),
                    description: newNotification.message || 'You received a new update.',
                });
            });
        });

        // Log EVERY event from the server — no filtering
        socket.onAny((eventName, ...args) => {
            console.log(`📡 [Socket.io] Event received: '${eventName}'`, args);
        });

        socket.on('authenticated', (data: any) => {
            console.log(`🔑 Socket authenticated: ${data.role} (userId: ${data.userId})`);
        });

        socket.on('error', (err: any) => {
            console.error('❌ Socket error:', err.message || err);
        });

        socket.on('connect_error', (err: any) => {
            console.error('❌ Socket connection error:', err.message);
        });

        socket.on('disconnect', (reason: string) => {
            console.log(`🔌 Socket disconnected. Reason: ${reason}`);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            console.log('🔌 Socket cleanup: disconnected');
        };
    }, [isAuthenticated, dispatch]);

    return <>{children}</>;
}