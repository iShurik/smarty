import React from 'react';

const payments = [
    { provider: 'Stripe', amount: '$10', status: 'succeeded', createdAt: '10.09' },
    { provider: 'PayPal', amount: '$5', status: 'refunded', createdAt: '07.09' },
];

export default function DonorHistoryPage() {
    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">История платежей</h1>
                <p className="text-slate-700">Реестр транзакций донатора и статусы возвратов.</p>
            </div>
            <div className="space-y-3">
                {payments.map((payment) => (
                    <div key={payment.provider + payment.createdAt} className="flex items-center justify-between rounded-lg border bg-slate-50 p-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">{payment.provider}</p>
                            <p className="text-xs text-slate-600">{payment.createdAt}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-800">{payment.amount}</p>
                            <p className="text-xs text-slate-600">{payment.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}