import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
    { to: '/admin', label: 'Обзор' },
    { to: '/admin/moderation', label: 'Модерация' },
    { to: '/admin/catalogs', label: 'Каталоги' },
];

export default function AdminLayout() {
    return (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
            <aside className="rounded-lg border bg-white p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-700">Админ</h2>
                <nav className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `rounded px-3 py-2 transition hover:bg-slate-50 ${isActive ? 'bg-slate-100 text-blue-700' : ''}`
                            }
                            end
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <section className="rounded-lg border bg-white p-6 shadow-sm">
                <Outlet />
            </section>
        </div>
    );
}