import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5 text-muted">
        <Spinner animation="border" size="sm" className="me-2" /> Проверяем авторизацию…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRoleCodes = (user?.roles || [])
    .map((role) => (typeof role === 'string' ? role : role?.code))
    .filter(Boolean)
    .map((code) => code.toLowerCase());

  if (allowedRoles && !allowedRoles.some((role) => userRoleCodes.includes(role.toLowerCase()))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}