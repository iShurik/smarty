import React from 'react';

const streams = [
    { name: 'StreamerOne', pending: 6, escalations: 1 },
    { name: 'StreamerTwo', pending: 2, escalations: 0 },
];

export default function AdminModerationPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Глобальная модерация</h1>
                <p className="text-slate-700">Мониторинг очередей мемов, донатов и блок-листов по стримерам.</p>
            </div>
            <div className="space-y-3">
                {streams.map((stream) => (
                    <div key={stream.name} className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{stream.name}</p>
                            <p className="text-xs text-slate-600">Эскалации: {stream.escalations}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">В очереди: {stream.pending}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}