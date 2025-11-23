import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/AuthContext';

const normalizeProfileForm = (profile = {}) => ({
  display_name: profile.display_name ?? '',
  country_code: profile.country_code ?? '',
  slug: profile.slug ?? '',
  min_amount:
    profile.min_amount !== undefined && profile.min_amount !== null
      ? String(profile.min_amount)
      : '',
});

const extractProfileFromResponse = (responseData = {}) => responseData.data ?? responseData;

export default function StreamerProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState(() => normalizeProfileForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError('');
      setValidationErrors({});

      try {
        const { data } = await axios.get('/api/v1/streamer/profile');
        const profile = extractProfileFromResponse(data);

        setForm(normalizeProfileForm(profile));
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Не удалось загрузить профиль. Проверьте, что вы авторизованы как стример и у аккаунта есть роль "streamer".',
        );
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

      const { data } = await axios.put('/api/v1/streamer/profile', payload);
      const profile = extractProfileFromResponse(data);

      setForm(normalizeProfileForm(profile));
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
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-4 mb-1">Профиль стримера</h1>
        <p className="section-subtitle">
          Базовые настройки страницы донатов: отображаемое имя, страна, публичный slug и минимальная сумма доната.
        </p>
      </div>

      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="text-muted d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Загрузка профиля…
          </Card.Body>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <Card.Body>
            {error && (
              <Alert variant="danger" className="py-2">
                {error}
              </Alert>
            )}
            {success && (
              <Alert variant="success" className="py-2">
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="displayName">
                    <Form.Label>Отображаемое имя</Form.Label>
                    <Form.Control
                      type="text"
                      name="display_name"
                      value={form.display_name}
                      onChange={handleChange}
                      isInvalid={Boolean(validationErrors.display_name)}
                      required
                    />
                    {validationErrors.display_name && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.display_name.join(', ')}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="countryCode">
                    <Form.Label>Страна (ISO-2)</Form.Label>
                    <Form.Control
                      type="text"
                      name="country_code"
                      value={form.country_code}
                      onChange={handleChange}
                      maxLength={2}
                      className="text-uppercase"
                      isInvalid={Boolean(validationErrors.country_code)}
                      required
                    />
                    {validationErrors.country_code && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.country_code.join(', ')}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="slug">
                    <Form.Label>Slug страницы донатов</Form.Label>
                    <Form.Control
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      isInvalid={Boolean(validationErrors.slug)}
                      required
                    />
                    {validationErrors.slug && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.slug.join(', ')}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="minAmount">
                    <Form.Label>Минимальная сумма доната</Form.Label>
                    <Form.Control
                      type="number"
                      name="min_amount"
                      value={form.min_amount}
                      min={0}
                      step="0.01"
                      onChange={handleChange}
                      isInvalid={Boolean(validationErrors.min_amount)}
                      required
                    />
                    {validationErrors.min_amount && (
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.min_amount.join(', ')}
                      </Form.Control.Feedback>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex align-items-center gap-3 mt-3">
                <Button type="submit" disabled={saving} variant="primary">
                  {saving ? 'Сохранение…' : 'Сохранить профиль'}
                </Button>
                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                  Работает только для авторизованных стримеров.
                </span>
              </div>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}