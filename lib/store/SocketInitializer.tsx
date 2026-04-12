// lib/store/SocketInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from './hooks';
import { addNotification, fetchUnreadCount } from './slices/notificationSlice';
import { toast } from '@/hooks/use-toast';
import { refreshAccessToken } from '@/lib/authService';

const SOCKET_URL = 'https://salon-store-lk-prod-707068751976.asia-south1.run.app';
const UNREAD_COUNT_POLL_INTERVAL_MS = 8 * 60 * 1000;

export function SocketInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const socketRef = useRef<Socket | null>(null);
    const processedNotificationIdsRef = useRef<Set<string>>(new Set());
    const refreshInFlightRef = useRef(false);

    useEffect(() => {
        // Clean up any existing socket before creating a new one
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        if (!isAuthenticated) return;

        // 1. Fetch initial unread count on login
        dispatch(fetchUnreadCount());
        const unreadCountPollingId = window.setInterval(() => {
            dispatch(fetchUnreadCount());
        }, UNREAD_COUNT_POLL_INTERVAL_MS);

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

        const shouldRefreshSocketToken = (err: any) => {
            const message = String(err?.message || err || '').toLowerCase();
            return (
                message.includes('invalid or expired token') ||
                message.includes('invalid token') ||
                message.includes('expired token') ||
                message.includes('jwt expired') ||
                message.includes('unauthorized')
            );
        };

        const refreshTokenAndReconnect = async () => {
            if (refreshInFlightRef.current) return;

            try {
                refreshInFlightRef.current = true;
                const nextAccessToken = await refreshAccessToken();

                if (!socketRef.current) return;

                socketRef.current.auth = { token: nextAccessToken };

                // Ensure next auth payload is used immediately.
                if (socketRef.current.connected) {
                    socketRef.current.disconnect();
                }
                socketRef.current.connect();
            } catch (refreshError: any) {
                console.error('❌ Failed to refresh token for socket reconnect:', refreshError?.message || refreshError);

                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                window.location.href = '/login';
            } finally {
                refreshInFlightRef.current = false;
            }
        };

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

            // Normalize event payload because backend may return:
            // { notification: {...}, notificationId }, { notifications: [...] }, or {...notification}
            const notification = data?.notification || data?.notifications?.[0] || data;
            const notificationId = notification?.id || data?.notificationId;

            // Guard against duplicate socket emissions/reconnect replays.
            if (notificationId && processedNotificationIdsRef.current.has(notificationId)) {
                return;
            }

            if (notificationId) {
                processedNotificationIdsRef.current.add(notificationId);

                // Keep this set bounded in long sessions.
                if (processedNotificationIdsRef.current.size > 500) {
                    const oldestId = processedNotificationIdsRef.current.values().next().value;
                    if (oldestId) {
                        processedNotificationIdsRef.current.delete(oldestId);
                    }
                }
            }

            // Update Redux state (badge count increments automatically)
            dispatch(addNotification(notification));

            // Show toast
            toast({
                title: notification.title || eventName.replace(/-/g, ' ').toUpperCase(),
                description: notification.message || data?.message || 'You received a new update.',
            });
        });

        socket.on('error', (err: any) => {
            if (shouldRefreshSocketToken(err)) {
                void refreshTokenAndReconnect();
            }
        });

        socket.on('connect_error', (err: any) => {
            console.error('❌ Socket connection error:', err.message);
            if (shouldRefreshSocketToken(err)) {
                void refreshTokenAndReconnect();
            }
        });

        socket.on('disconnect', (reason: string) => {
            console.log(`🔌 Socket disconnected. Reason: ${reason}`);
        });

        return () => {
            window.clearInterval(unreadCountPollingId);
            socket.offAny();
            socket.disconnect();
            socketRef.current = null;
            console.log('🔌 Socket cleanup: disconnected');
        };
    }, [isAuthenticated, dispatch]);

    return <>{children}</>;
}