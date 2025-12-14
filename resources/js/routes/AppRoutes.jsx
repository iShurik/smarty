import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../components/layouts/AdminLayout';
import DonorLayout from '../components/layouts/DonorLayout';
import PublicLayout from '../components/layouts/PublicLayout';
import StreamerLayout from '../components/layouts/StreamerLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminCatalogsPage from '../pages/AdminCatalogsPage';
import AdminModerationPage from '../pages/AdminModerationPage';
import AdminOverviewPage from '../pages/AdminOverviewPage';
import DonorDashboard from '../pages/DonorDashboard';
import DonorFavoritesPage from '../pages/DonorFavoritesPage';
import DonorHistoryPage from '../pages/DonorHistoryPage';
import DonorSuggestMemePage from '../pages/DonorSuggestMemePage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MemeGalleryPage from '../pages/MemeGalleryPage';
import NotFoundPage from '../pages/NotFoundPage';
import StreamerDashboard from '../pages/StreamerDashboard';
import StreamerProfilePage from '../pages/StreamerProfilePage';
import StreamerGoalsPage from '../pages/StreamerGoalsPage';
import StreamerMediaPage from '../pages/StreamerMediaPage';
import StreamerRulesPage from '../pages/StreamerRulesPage';
import StreamerModerationPage from '../pages/StreamerModerationPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import AdminMemeModerationPage from '../pages/AdminMemeModerationPage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="unauthorized" element={<UnauthorizedPage />} />
                <Route path="memes" element={<MemeGalleryPage />} />

                <Route
                    path="streamer/*"
                    element={
                        <ProtectedRoute allowedRoles={['streamer']}>
                            <StreamerLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<StreamerDashboard />} />
                    <Route path="profile" element={<StreamerProfilePage />} />
                    <Route path="goals" element={<StreamerGoalsPage />} />
                    <Route path="media" element={<StreamerMediaPage />} />
                    <Route path="rules" element={<StreamerRulesPage />} />
                    <Route path="moderation" element={<StreamerModerationPage />} />
                </Route>

                <Route
                    path="donor/*"
                    element={
                        <ProtectedRoute allowedRoles={['donor']}>
                            <DonorLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DonorDashboard />} />
                    <Route path="favorites" element={<DonorFavoritesPage />} />
                    <Route path="history" element={<DonorHistoryPage />} />
                    <Route path="memes" element={<DonorSuggestMemePage />} />
                </Route>

                <Route
                    path="admin/*"
                    element={
                        <ProtectedRoute allowedRoles={['admin', 'moderator']}>
                            <AdminLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="moderation" element={<AdminModerationPage />} />
                    <Route path="memes" element={<AdminMemeModerationPage />} />
                    <Route path="catalogs" element={<AdminCatalogsPage />} />
                </Route>

                <Route path="404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    );
}