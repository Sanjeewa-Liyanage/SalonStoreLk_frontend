// lib/store/SocketInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './hooks';
import { addNotification, fetchUnreadCount } from './slices/notificationSlice';
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

        // 2. Initialize Socket Connection — EXACTLY matching the working playground tester config
        const socket = io(SOCKET_URL, {
            auth: { token: token },
            transports: ['websocket', 'polling'], // Match tester: both transports
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log(`✅ Socket connected. ID: ${socket.id}, transport: ${socket.io.engine.transport.name}`);
        });

        // Server confirms auth
        socket.on('authenticated', (data: any) => {
            console.log(`🔑 Authenticated as ${data.role} (userId: ${data.userId})`);
        });

        // 3. Catch-all: dispatch notifications for ANY event from the server
        // This ensures we never miss an event regardless of its name
        socket.onAny((eventName: string, data: any) => {
            console.log(`📡 [Socket.io] Event: '${eventName}'`, data);

            // Skip system events — only process notification-type events
            const systemEvents = ['authenticated', 'error', 'connect', 'disconnect', 'connect_error'];
            if (systemEvents.includes(eventName)) return;

            // Extract the notification object from the payload
            // Backend wraps notifications in a `notifications` array inside the event data
            const notification = data?.notifications?.[0] || data;

            // Update Redux state (badge count increments automatically)
            dispatch(addNotification(notification));

            // Show toast
            toast({
                title: notification.title || eventName.replace(/-/g, ' ').toUpperCase(),
                description: notification.message || data?.message || 'You received a new update.',
            });
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