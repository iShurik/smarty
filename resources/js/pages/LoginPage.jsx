import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, ButtonGroup, Card, Col, Form, Row } from 'react-bootstrap';
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
    
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
              Авторизация
            </div>
            <Card.Title className="mb-0">{title}</Card.Title>
          </div>
          <ButtonGroup size="sm">
            <Button
              variant={mode === 'login' ? 'primary' : 'outline-secondary'}
              onClick={() => setMode('login')}
            >
              Вход
            </Button>
            <Button
              variant={mode === 'register' ? 'primary' : 'outline-secondary'}
              onClick={() => setMode('register')}
            >
              Регистрация
            </Button>
          </ButtonGroup>
        </div>

        <p className="section-subtitle mb-3">
          Работаем через email и пароль для локальной разработки. Позже добавятся OAuth провайдеры (Twitch, Google,
          Telegram и др.) — интерфейс под это уже предусмотрен.
        </p>

        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <Form.Group className="mb-3" controlId="registerName">
              <Form.Label>Имя</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                isInvalid={Boolean(validationErrors.name)}
                required
              />
            {validationErrors.name && (
                <Form.Control.Feedback type="invalid">
                  {validationErrors.name.join(', ')}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          )}
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              isInvalid={Boolean(validationErrors.email)}
              required
            />
            {validationErrors.email && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.email.join(', ')}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Пароль</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              isInvalid={Boolean(validationErrors.password)}
              required
            />
            {validationErrors.password && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.password.join(', ')}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          {mode === 'register' && (
            <>
              <Form.Group className="mb-3" controlId="passwordConfirmation">
                <Form.Label>Подтверждение пароля</Form.Label>
                <Form.Control
                  type="password"
                  name="password_confirmation"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="registerRole">
                <Form.Label>Я регистрируюсь как</Form.Label>
                <Form.Select name="role" value={form.role} onChange={handleChange}>
                  {registerRoles.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          <Row className="align-items-center g-3 mt-1">
            <Col xs="auto">
              <Button type="submit" disabled={submitting} variant="primary">
                {submitting ? 'Отправка…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </Button>
            </Col>
            <Col>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                Сессия хранится через Sanctum-токен в localStorage.
              </div>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}