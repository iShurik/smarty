import React from 'react';

const goals = [
    { title: 'Новый микрофон', target: 500, current: 180, currency: 'USD', endsAt: '31.10' },
    { title: 'Апгрейд ПК', target: 1200, current: 820, currency: 'USD', endsAt: '15.11' },
];

export default function StreamerGoalsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Цели и полоски сбора</h1>
                <p className="text-slate-700">Управление активными целями, привязка донатов и статус для оверлея.</p>
            </div>
            <div className="space-y-3">
                {goals.map((goal) => {
                    const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                    return (
                        <div key={goal.title} className="space-y-2 rounded-lg border bg-slate-50 p-4">
                            <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                <span>{goal.title}</span>
                                <span>
                                    {goal.current}/{goal.target} {goal.currency}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200">
                                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-slate-600">Дедлайн: {goal.endsAt}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}