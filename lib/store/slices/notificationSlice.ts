import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getAllNotifications, getUnreadNotificationCount } from "@/lib/notificationService";

interface NotificationState {
    items: any[];
    unreadCount: number;
    loading: boolean;
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

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
        addNotification: (state, action: PayloadAction<any>) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.items.find((item) => item.id === action.payload);
            if (notification && notification.status === 'UNREAD') {
                notification.status = 'READ';
                state.unreadCount -= 1;
            }
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
                
                state.items = payloadArray;
                state.unreadCount = payloadArray.filter((notification: any) => notification.status === 'UNREAD').length;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                // expecting { unreadCount: number }
                state.unreadCount = action.payload.unreadCount || 0;
            });
    },
});

export const { setUnreadCount, addNotification, markAsRead } = notificationSlice.actions;
export default notificationSlice.reducer;   