'use client'; // Required for Redux in Next.js App Router

import { Provider } from 'react-redux';
import { store } from './store';
import { SocketInitializer } from './SocketInitializer';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <SocketInitializer>
                {children}
            </SocketInitializer>
        </Provider>
    );
}