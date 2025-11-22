import React from 'react';

const catalogs = [
    { name: 'Голоса TTS', status: '26 активных', action: 'Управлять' },
    { name: 'Теги мемов', status: '18 тегов', action: 'Редактировать' },
    { name: 'Бан-листы YouTube', status: '54 видео', action: 'Просмотреть' },
];

export default function AdminCatalogsPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Справочники и каталоги</h1>
                <p className="text-slate-700">Голоса, теги, бан-листы и другие системные данные.</p>
            </div>
            <div className="space-y-3">
                {catalogs.map((catalog) => (
                    <div key={catalog.name} className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{catalog.name}</p>
                            <p className="text-xs text-slate-600">{catalog.status}</p>
                        </div>
                        <button className="rounded border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                            {catalog.action}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}