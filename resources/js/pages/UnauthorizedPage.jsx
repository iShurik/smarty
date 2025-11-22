import React from 'react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
    return (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Нет доступа</h1>
            <p className="text-slate-700">У вас нет прав на просмотр этой секции. Выберите другую роль или вернитесь на главную.</p>
            <div className="flex gap-3">
                <Link className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white" to="/">
                    На главную
                </Link>
                <Link className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800" to="/login">
                    Сменить роль
                </Link>
            </div>
        </div>
    );
}