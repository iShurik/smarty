import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap';
import GoalCard from '../components/goals/GoalCard';

const emptyGoalForm = {
  title: '',
  description: '',
  target_amount: '',
  currency: 'USD',
  starts_at: '',
  ends_at: '',
  is_active: true,
};

const toInputDateTime = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (part) => String(part).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
};

const toApiDateTime = (value) => {
  if (!value) {
    return null;
  }

  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) {
    return value;
  }

  return `${datePart} ${timePart}:00`;
};

const normalizeGoalForm = (goal) => ({
  title: goal?.title ?? '',
  description: goal?.description ?? '',
  target_amount: goal?.target_amount !== null && goal?.target_amount !== undefined ? String(goal.target_amount) : '',
  currency: goal?.currency ?? 'USD',
  starts_at: toInputDateTime(goal?.starts_at),
  ends_at: toInputDateTime(goal?.ends_at),
  is_active: goal?.is_active ?? true,
});

const extractData = (response) => response?.data?.data ?? response?.data ?? [];

export default function StreamerGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [form, setForm] = useState({ ...emptyGoalForm });
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [actionGoalId, setActionGoalId] = useState(null);

  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [goals]);

  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get('/api/v1/streamer/goals');
        setGoals(extractData(response));
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить цели.');
      } finally {
        setLoading(false);
      }
    }

    fetchGoals();
  }, []);

  const resetForm = () => {
    setForm({ ...emptyGoalForm });
    setEditingGoalId(null);
    setValidationErrors({});
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEdit = (goal) => {
    setEditingGoalId(goal.id);
    setForm(normalizeGoalForm(goal));
    setValidationErrors({});
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    setValidationErrors({});

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_amount: Number(form.target_amount),
      currency: form.currency.trim().toUpperCase(),
      starts_at: toApiDateTime(form.starts_at),
      ends_at: toApiDateTime(form.ends_at),
      is_active: Boolean(form.is_active),
    };

    try {
      let response;

      if (editingGoalId) {
        response = await axios.put(`/api/v1/streamer/goals/${editingGoalId}`, payload);
        const updated = extractData(response);
        setGoals((prev) => prev.map((goal) => (goal.id === updated.id ? updated : goal)));
        setMessage('Цель обновлена.');
      } else {
        response = await axios.post('/api/v1/streamer/goals', payload);
        const created = extractData(response);
        setGoals((prev) => [created, ...prev]);
        setMessage('Цель добавлена.');
      }

      resetForm();
    } catch (err) {
      if (err.response?.data?.errors) {
        setValidationErrors(err.response.data.errors);
      }
      setError(err.response?.data?.message || 'Не удалось сохранить цель.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (goal) => {
    setActionGoalId(goal.id);
    setError('');
    setMessage('');

    try {
      const response = await axios.put(`/api/v1/streamer/goals/${goal.id}`, {
        is_active: !goal.is_active,
      });
      const updated = extractData(response);
      setGoals((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось обновить статус цели.');
    } finally {
      setActionGoalId(null);
    }
  };

  const handleDelete = async (goal) => {
    if (!window.confirm(`Удалить цель "${goal.title}"?`)) {
      return;
    }

    setActionGoalId(goal.id);
    setError('');
    setMessage('');

    try {
      await axios.delete(`/api/v1/streamer/goals/${goal.id}`);
      setGoals((prev) => prev.filter((item) => item.id !== goal.id));
      if (editingGoalId === goal.id) {
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Не удалось удалить цель.');
    } finally {
      setActionGoalId(null);
    }
  };

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Цели и полоски сбора</h1>
        <p className="section-subtitle">
          Создавайте цели, управляйте активностью и отслеживайте прогресс. Активные цели показываются на публичной
          странице донатов.
        </p>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}
      {message && (
        <Alert variant="success" className="py-2">
          {message}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <Card.Title className="fs-6 mb-1">
                {editingGoalId ? 'Редактировать цель' : 'Новая цель'}
              </Card.Title>
              <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                Заполните основные параметры: название, сумма и период активности.
              </Card.Text>
            </div>
            {editingGoalId && (
              <Badge bg="secondary" className="text-uppercase">
                Режим редактирования
              </Badge>
            )}
          </div>

          <Form onSubmit={handleSubmit} className="mt-3">
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="goalTitle">
                  <Form.Label>Название цели</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.title)}
                    required
                  />
                  {validationErrors.title && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.title.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="goalTarget">
                  <Form.Label>Целевая сумма</Form.Label>
                  <Form.Control
                    type="number"
                    name="target_amount"
                    value={form.target_amount}
                    min={0}
                    step="0.01"
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.target_amount)}
                    required
                  />
                  {validationErrors.target_amount && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.target_amount.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="goalCurrency">
                  <Form.Label>Валюта</Form.Label>
                  <Form.Control
                    type="text"
                    name="currency"
                    value={form.currency}
                    maxLength={3}
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.currency)}
                    required
                  />
                  {validationErrors.currency && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.currency.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="goalDescription">
                  <Form.Label>Описание</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    rows={2}
                    value={form.description}
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.description)}
                  />
                  {validationErrors.description && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.description.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="goalStarts">
                  <Form.Label>Старт</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="starts_at"
                    value={form.starts_at}
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.starts_at)}
                  />
                  {validationErrors.starts_at && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.starts_at.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="goalEnds">
                  <Form.Label>Финиш</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="ends_at"
                    value={form.ends_at}
                    onChange={handleChange}
                    isInvalid={Boolean(validationErrors.ends_at)}
                  />
                  {validationErrors.ends_at && (
                    <Form.Control.Feedback type="invalid">
                      {validationErrors.ends_at.join(', ')}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6} className="d-flex align-items-center">
                <Form.Check
                  type="switch"
                  id="goalActive"
                  name="is_active"
                  label="Цель активна"
                  checked={form.is_active}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <div className="d-flex align-items-center gap-2 mt-3">
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? 'Сохранение…' : editingGoalId ? 'Обновить цель' : 'Добавить цель'}
              </Button>
              {editingGoalId && (
                <Button type="button" variant="outline-secondary" onClick={resetForm} disabled={saving}>
                  Отменить
                </Button>
              )}
            </div>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="text-muted d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Загрузка целей…
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {sortedGoals.length === 0 ? (
            <Col>
              <Card className="shadow-sm">
                <Card.Body className="text-muted">Целей пока нет. Создайте первую полоску сбора.</Card.Body>
              </Card>
            </Col>
          ) : (
            sortedGoals.map((goal) => (
              <Col key={goal.id} md={6} xl={4}>
                <GoalCard
                  goal={goal}
                  showStatus
                  actions={
                    <div className="d-flex flex-wrap gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => handleEdit(goal)}>
                        Редактировать
                      </Button>
                      <Button
                        size="sm"
                        variant={goal.is_active ? 'outline-secondary' : 'outline-success'}
                        onClick={() => handleToggleActive(goal)}
                        disabled={actionGoalId === goal.id}
                      >
                        {goal.is_active ? 'Скрыть' : 'Включить'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(goal)}
                        disabled={actionGoalId === goal.id}
                      >
                        Удалить
                      </Button>
                    </div>
                  }
                />
              </Col>
            ))
          )}
        </Row>
      )}
    </Stack>
  );
}
