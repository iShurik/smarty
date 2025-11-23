import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function StreamerProfilePage() {
    const [form, setForm] = useState({
        display_name: '',
        country_code: '',
        slug: '',
        min_amount: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});

    const authHeaders = () => {
        const token = localStorage.getItem('authToken');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            setError('');
            setValidationErrors({});

            try {
                const { data } = await axios.get('/api/v1/streamer/profile', {
                    headers: authHeaders(),
                });

                setForm({
                    display_name: data.display_name ?? '',
                    country_code: data.country_code ?? '',
                    slug: data.slug ?? '',
                    min_amount: data.min_amount ?? '',
                });
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        'Не удалось загрузить профиль. Убедитесь, что авторизованы как стример и есть Sanctum-токен в localStorage под ключом "authToken".',
                );
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setSuccess('');
        setError('');
        setValidationErrors({});

        try {
            const payload = {
                ...form,
                country_code: form.country_code.trim(),
                min_amount: Number(form.min_amount) || 0,
            };

            const { data } = await axios.put('/api/v1/streamer/profile', payload, {
                headers: authHeaders(),
            });

            setForm({
                display_name: data.display_name,
                country_code: data.country_code,
                slug: data.slug,
                min_amount: data.min_amount,
            });
            setSuccess('Профиль сохранён.');
        } catch (err) {
            if (err.response?.data?.errors) {
                setValidationErrors(err.response.data.errors);
            }
            setError(err.response?.data?.message || 'Не удалось сохранить профиль');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-slate-900">Профиль стримера</h1>
                <p className="text-slate-700">
                    Базовые настройки страницы донатов: отображаемое имя, страна, публичный slug и минимальная сумма доната.
                </p>
            </div>

            {loading ? (
                <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">Загрузка профиля…</div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
                    {success && (
                        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-800">{success}</div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm font-medium text-slate-800">
                            <span>Отображаемое имя</span>
                            <input
                                type="text"
                                name="display_name"
                                value={form.display_name}
                                onChange={handleChange}
                                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                            {validationErrors.display_name && (
                                <p className="text-xs text-red-600">{validationErrors.display_name.join(', ')}</p>
                            )}
                        </label>

                        <label className="space-y-1 text-sm font-medium text-slate-800">
                            <span>Страна (ISO-2)</span>
                            <input
                                type="text"
                                name="country_code"
                                value={form.country_code}
                                onChange={handleChange}
                                maxLength={2}
                                className="w-full uppercase rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                            {validationErrors.country_code && (
                                <p className="text-xs text-red-600">{validationErrors.country_code.join(', ')}</p>
                            )}
                        </label>

                        <label className="space-y-1 text-sm font-medium text-slate-800">
                            <span>Slug страницы донатов</span>
                            <input
                                type="text"
                                name="slug"
                                value={form.slug}
                                onChange={handleChange}
                                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                            {validationErrors.slug && (
                                <p className="text-xs text-red-600">{validationErrors.slug.join(', ')}</p>
                            )}
                        </label>

                        <label className="space-y-1 text-sm font-medium text-slate-800">
                            <span>Минимальная сумма доната</span>
                            <input
                                type="number"
                                name="min_amount"
                                value={form.min_amount}
                                min={0}
                                step="0.01"
                                onChange={handleChange}
                                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                            {validationErrors.min_amount && (
                                <p className="text-xs text-red-600">{validationErrors.min_amount.join(', ')}</p>
                            )}
                        </label>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-slate-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                        >
                            {saving ? 'Сохранение…' : 'Сохранить профиль'}
                        </button>
                        <span className="text-xs text-slate-500">
                            Sanctum токен ожидается в localStorage: authToken. Иначе API вернёт 401/403.
                        </span>
                    </div>
                </form>
            )}
        </div>
    );
}