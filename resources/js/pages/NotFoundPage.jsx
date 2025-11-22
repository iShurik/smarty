import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Страница не найдена</h1>
            <p className="text-slate-700">Маршрут не существует или находится в разработке.</p>
            <Link className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white" to="/">
                Вернуться на главную
            </Link>
        </div>
    );
}