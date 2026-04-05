import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllNotifications, getUnreadNotificationCount, markAllNotificationsAsRead, markNotificationAsRead } from "@/lib/notificationService";

interface NotificationState {
    items: any[];
    unreadCount: number;
    loading: boolean;
}

function normalizeNotification(payload: any) {
    if (!payload) return null;
    const source = payload.notification || payload;
    const id = source.id || payload.notificationId;
    return id ? { ...source, id } : source;
}

function dedupeNotifications(items: any[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const id = item?.id;
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

function applyMarkAsRead(state: NotificationState, notificationId: string) {
    const notification = state.items.find((item) => item.id === notificationId);
    if (notification && notification.status === 'UNREAD') {
        notification.status = 'READ';
        state.unreadCount = Math.max(0, state.unreadCount - 1);
    }
}

function applyMarkAllAsRead(state: NotificationState) {
    state.items = state.items.map((item) => (
        item?.status === 'UNREAD' ? { ...item, status: 'READ' } : item
    ));
    state.unreadCount = 0;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    loading: false,
};

export const fetchNotifications = createAsyncThunk(
    "notifications/getAllNotifications",
    async () => {
        const response = await getAllNotifications();
        return response; // Assuming backend returns array directly or modify as per response structure
    }
);

export const fetchUnreadCount = createAsyncThunk(
    "notifications/getUnreadCount",
    async () => {
        const response = await getUnreadNotificationCount();
        return response; 
    }
);

export const markNotificationRead = createAsyncThunk(
    "notifications/markNotificationRead",
    async (notificationId: string) => {
        await markNotificationAsRead(notificationId);
        return notificationId;
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    "notifications/markAllNotificationsRead",
    async () => {
        await markAllNotificationsAsRead();
        return true;
    }
);

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
        addNotification: (state, action: PayloadAction<any>) => {
            const notification = normalizeNotification(action.payload);
            if (!notification) return;

            const exists = notification.id
                ? state.items.some((item) => item.id === notification.id)
                : false;

            if (exists) return;

            state.items.unshift(notification);
            if (notification.status === 'UNREAD') {
                state.unreadCount += 1;
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            applyMarkAsRead(state, action.payload);
        },
        markAllAsRead: (state) => {
            applyMarkAllAsRead(state);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                
                // Safely extract the array from the payload whether it's wrapped in an object or not
                const payloadArray = Array.isArray(action.payload) 
                    ? action.payload 
                    : action.payload?.data || action.payload?.notifications || action.payload?.content || [];

                const normalized = payloadArray
                    .map((item: any) => normalizeNotification(item))
                    .filter(Boolean);
                const uniqueNotifications = dedupeNotifications(normalized);

                state.items = uniqueNotifications;
                state.unreadCount = uniqueNotifications.filter((notification: any) => notification.status === 'UNREAD').length;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                // expecting { unreadCount: number }
                state.unreadCount = action.payload.unreadCount || 0;
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                applyMarkAsRead(state, action.payload);
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                applyMarkAllAsRead(state);
            });
    },
});

export const { setUnreadCount, addNotification, markAsRead, markAllAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;   