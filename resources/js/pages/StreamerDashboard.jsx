import React from 'react';

const cards = [
    { title: 'Донаты', value: 'Статус: готово', description: 'Создание донатов, валидация правил стримера, TTS + медиа.' },
    { title: 'Очередь воспроизведения', value: 'Виджет', description: 'Опубликованные донаты пушатся в оверлей через WS/SSE.' },
    { title: 'Платежи', value: 'Интеграции', description: 'Кошелёк стримера, комиссии и вывод средств через провайдеров.' },
];

export default function StreamerDashboard() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Кабинет стримера</h1>
            <p className="text-slate-700">Быстрый обзор ключевых модулей и статусов их реализации.</p>
            <div className="grid gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.title} className="space-y-2 rounded-lg border bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{card.title}</p>
                        <p className="text-lg font-semibold text-slate-900">{card.value}</p>
                        <p className="text-sm text-slate-700">{card.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}