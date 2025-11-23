import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const registerRoles = [
  { value: 'streamer', label: 'Стример' },
  { value: 'donor', label: 'Донатор' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'streamer',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const title = useMemo(() => (mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'), [mode]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setValidationErrors({});

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
          role: form.role,
        });
      }

      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Не удалось выполнить действие. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Авторизация</p>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        </div>
        <div className="flex gap-2 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`rounded px-3 py-1 ${mode === 'login' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded px-3 py-1 ${
              mode === 'register' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'
            }`}
          >
            Регистрация
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-700">
        Работаем через email и пароль для локальной разработки. Позже добавятся OAuth провайдеры (Twitch, Google,
        Telegram и др.) — интерфейс под это уже предусмотрен.
      </p>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <label className="block space-y-1 text-sm font-medium text-slate-800">
            <span>Имя</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            {validationErrors.name && <p className="text-xs text-red-600">{validationErrors.name.join(', ')}</p>}
          </label>
        )}

        <label className="block space-y-1 text-sm font-medium text-slate-800">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
          {validationErrors.email && <p className="text-xs text-red-600">{validationErrors.email.join(', ')}</p>}
        </label>

        <label className="block space-y-1 text-sm font-medium text-slate-800">
          <span>Пароль</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            required
          />
          {validationErrors.password && (
            <p className="text-xs text-red-600">{validationErrors.password.join(', ')}</p>
          )}
        </label>

        {mode === 'register' && (
          <>
            <label className="block space-y-1 text-sm font-medium text-slate-800">
              <span>Подтверждение пароля</span>
              <input
                type="password"
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </label>

            <label className="block space-y-1 text-sm font-medium text-slate-800">
              <span>Я регистрируюсь как</span>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
                {registerRoles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? 'Отправка…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <p className="text-xs text-slate-500">Сессия хранится через Sanctum-токен в localStorage.</p>
        </div>
      </form>
    </div>
  );
}