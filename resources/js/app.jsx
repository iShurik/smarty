import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './bootstrap';
import '../css/app.css';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './routes/AppRoutes';

const rootElement = document.getElementById('app');

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <AuthProvider>
                <BrowserRouter>
                    <AppRoutes />
                </BrowserRouter>
            </AuthProvider>
        </React.StrictMode>,
    );
}