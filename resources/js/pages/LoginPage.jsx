import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const options = [
    { value: 'streamer', label: 'Стример' },
    { value: 'donor', label: 'Донатор' },
    { value: 'admin', label: 'Администратор' },
];

export default function LoginPage() {
    const { loginAs } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = (role) => {
        loginAs(role);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    };

    return (
        <div className="max-w-xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Быстрая авторизация</h1>
            <p className="text-slate-700">
                Заглушка авторизации для прототипа. Выберите роль, чтобы увидеть нужный кабинет и навигацию.
            </p>
            <div className="grid gap-3 md:grid-cols-3">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleLogin(option.value)}
                        className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50"
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}