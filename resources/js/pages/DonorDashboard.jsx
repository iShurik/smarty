import React from 'react';

const donations = [
    { title: 'TTS для StreamerOne', amount: '$10', status: 'Оплачен' },
    { title: 'Мем-клип для StreamerTwo', amount: '$5', status: 'Ожидает модерации' },
];

export default function DonorDashboard() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">Кабинет донатора</h1>
            <p className="text-slate-700">Отслеживание последних донатов, статусов и доступных медиа опций.</p>
            <div className="space-y-3">
                {donations.map((donation) => (
                    <div key={donation.title} className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{donation.title}</p>
                            <p className="text-xs text-slate-600">{donation.status}</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">{donation.amount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}