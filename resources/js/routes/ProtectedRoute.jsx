import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10 text-sm text-slate-600">
                Проверяем авторизацию…
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (allowedRoles && !allowedRoles.some((role) => user.roles.includes(role))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}