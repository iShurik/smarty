import React from 'react';

const mediaSections = [
    {
        title: 'TTS голоса',
        description: 'Каталог голосов и разрешённые варианты для стримера.',
        items: ['Google: ru-RU WaveNet', 'AWS: Joanna', 'ElevenLabs: Viral RU'],
    },
    {
        title: 'YouTube ссылки',
        description: 'Кеш метаданных, лимит 1000 просмотров, региональные ограничения.',
        items: ['Последняя проверка: 5 мин назад', 'Заблокировано: 3 ссылки'],
    },
    {
        title: 'Мем-клипы',
        description: 'Модерация предложенных донаторами клипов и управление тегами.',
        items: ['В очереди: 4', 'Одобрено: 12', 'Отклонено: 2'],
    },
];

export default function StreamerMediaPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Медиа и правила</h1>
                <p className="text-slate-700">Единая точка настройки голосов, YouTube фильтров и мемов.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {mediaSections.map((section) => (
                    <div key={section.title} className="space-y-2 rounded-lg border bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{section.title}</p>
                        <p className="text-sm text-slate-700">{section.description}</p>
                        <ul className="space-y-1 text-sm text-slate-800">
                            {section.items.map((item) => (
                                <li key={item}>• {item}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}