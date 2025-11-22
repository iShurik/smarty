import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function PublicLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b bg-white shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <Link to="/" className="text-lg font-semibold text-blue-600">
                        StreamKit
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                        <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : '')} to="/">
                            Главная
                        </NavLink>
                        <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : '')} to="/streamer">
                            Кабинет стримера
                        </NavLink>
                        <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : '')} to="/donor">
                            Кабинет донатора
                        </NavLink>
                        <NavLink className={({ isActive }) => (isActive ? 'text-blue-600' : '')} to="/admin">
                            Админка
                        </NavLink>
                        {user ? (
                            <button
                                type="button"
                                onClick={logout}
                                className="rounded bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                            >
                                Выйти ({user.name})
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                                Войти
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-6xl px-4 py-10">
                <Outlet />
            </main>
        </div>
    );
}