import React from 'react';

const metrics = [
    { label: 'Активных стримеров', value: 128 },
    { label: 'Донатов за сутки', value: 842 },
    { label: 'Проблемные платежи', value: 3 },
];

export default function AdminOverviewPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Админ. Обзор</h1>
            <p className="text-slate-700">Системные метрики, статус очередей и блок-листов.</p>
            <div className="grid gap-4 md:grid-cols-3">
                {metrics.map((metric) => (
                    <div key={metric.label} className="space-y-2 rounded-lg border bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{metric.label}</p>
                        <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}