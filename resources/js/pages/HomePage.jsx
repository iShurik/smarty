import React from 'react';
import { Link } from 'react-router-dom';

export default function HomePage() {
    const highlights = [
        'Донаты с TTS, YouTube и мем-клипами',
        'Голосовые и медиа ограничения на уровне стримера',
        'Виджеты целей, аукционы и подписки',
        'Модерация контента и расширенная аналитика',
    ];

    return (
        <div className="space-y-8">
            <section className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                    <p className="text-sm uppercase tracking-wide text-blue-600">MVP-каркас</p>
                    <h1 className="text-3xl font-semibold leading-tight text-slate-900">
                        StreamKit — платформа донатов c архитектурой уровня DonationAlerts
                    </h1>
                    <p className="text-lg text-slate-700">
                        Каркас SPA на React + Laravel Vite: публичные страницы, кабинеты стримера и донатора, базовая
                        админка и охрана маршрутов под роли.
                    </p>
                    <div className="flex gap-3">
                        <Link className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white" to="/streamer">
                            Кабинет стримера
                        </Link>
                        <Link className="rounded border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700" to="/donor">
                            Кабинет донатора
                        </Link>
                    </div>
                </div>
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-slate-700">Что готово прямо сейчас</h2>
                    <ul className="space-y-2 text-slate-700">
                        {highlights.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </div>
    );
}