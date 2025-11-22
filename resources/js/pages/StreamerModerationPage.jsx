import React from 'react';

const queues = [
    { title: 'Мемы', pending: 4, approved: 12, rejected: 2 },
    { title: 'Донаты (ручная проверка)', pending: 1, approved: 23, rejected: 0 },
    { title: 'YouTube блок-лист', pending: 0, approved: 6, rejected: 0 },
];

export default function StreamerModerationPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Модерация контента</h1>
                <p className="text-slate-700">Статус очередей на проверку и быстрые действия.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {queues.map((queue) => (
                    <div key={queue.title} className="space-y-2 rounded-lg border bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{queue.title}</p>
                        <p className="text-sm text-slate-700">Ожидает: {queue.pending}</p>
                        <p className="text-xs text-slate-600">Одобрено: {queue.approved}</p>
                        <p className="text-xs text-slate-600">Отклонено: {queue.rejected}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}