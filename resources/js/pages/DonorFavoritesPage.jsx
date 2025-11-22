import React from 'react';

const favorites = [
    { name: 'StreamerOne', status: 'Онлайн', rules: 'TTS + YouTube' },
    { name: 'StreamerTwo', status: 'Оффлайн', rules: 'Только мем-клипы' },
];

export default function DonorFavoritesPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Избранные стримеры</h1>
                <p className="text-slate-700">Быстрый доступ к страницам донатов и активным правилам.</p>
            </div>
            <div className="space-y-3">
                {favorites.map((fav) => (
                    <div key={fav.name} className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{fav.name}</p>
                            <p className="text-xs text-slate-600">{fav.rules}</p>
                        </div>
                        <span className={`text-xs font-semibold ${fav.status === 'Онлайн' ? 'text-green-600' : 'text-slate-500'}`}>
                            {fav.status}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}