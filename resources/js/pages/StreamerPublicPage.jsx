import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner, Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import GoalCard from '../components/goals/GoalCard';

const emptyDonationForm = {
  donor_name: '',
  amount: '',
  message: '',
  goal_id: '',
};

const extractData = (response) => response?.data?.data ?? response?.data ?? {};

const formatAmount = (value, currency) => {
  const numeric = Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return `0 ${currency ?? ''}`.trim();
  }

  if (!currency) {
    return numeric.toFixed(2);
  }

  try {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency }).format(numeric);
  } catch (error) {
    return `${numeric.toFixed(2)} ${currency}`;
  }
};

export default function StreamerPublicPage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ ...emptyDonationForm });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    async function fetchStreamer() {
      setLoading(true);
      setError('');

      try {
        const response = await axios.get(`/api/v1/public/streamers/${slug}`);
        const data = extractData(response);
        setProfile(data);
        setGoals(data.goals ?? []);
      } catch (err) {
        setError(err.response?.data?.message || 'Не удалось загрузить страницу стримера.');
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchStreamer();
    }
  }, [slug]);

  const activeGoal = useMemo(() => {
    if (!form.goal_id) {
      return null;
    }

    return goals.find((goal) => String(goal.id) === String(form.goal_id));
  }, [form.goal_id, goals]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setNotice('Платёжный шлюз подключается позже. Вы уже можете выбрать цель и подготовить донат.');
  };

  return (
    <Stack gap={4}>
      {loading ? (
        <Card className="shadow-sm">
          <Card.Body className="text-muted d-flex align-items-center gap-2">
            <Spinner animation="border" size="sm" /> Загрузка страницы…
          </Card.Body>
        </Card>
      ) : error ? (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      ) : (
        <>
          <div>
            <h1 className="section-title fs-3 mb-1">{profile?.display_name ?? 'Стример'}</h1>
            <p className="section-subtitle mb-2">
              {profile?.about || 'Публичная страница донатов с активными целями и быстрым выбором полоски сбора.'}
            </p>
            <div className="d-flex flex-wrap gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
              {profile?.country_code && <span>Страна: {profile.country_code}</span>}
              {profile?.min_amount !== null && profile?.min_amount !== undefined && (
                <span>Минимальный донат: {formatAmount(profile.min_amount, goals[0]?.currency ?? 'USD')}</span>
              )}
              {profile?.slug && (
                <Badge bg="light" text="dark">
                  @{profile.slug}
                </Badge>
              )}
            </div>
          </div>

          <Row className="g-4">
            <Col lg={5}>
              <Card className="shadow-sm">
                <Card.Body>
                  <Card.Title className="fs-6">Отправить донат</Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Выберите цель (опционально) и подготовьте донат. Список целей синхронизируется со стримером.
                  </Card.Text>

                  {notice && (
                    <Alert variant="info" className="py-2">
                      {notice}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                    <Form.Group controlId="donorName">
                      <Form.Label>Ваше имя</Form.Label>
                      <Form.Control
                        type="text"
                        name="donor_name"
                        value={form.donor_name}
                        onChange={handleChange}
                        placeholder="Например, NeonFox"
                      />
                    </Form.Group>

                    <Form.Group controlId="donationAmount">
                      <Form.Label>Сумма доната</Form.Label>
                      <Form.Control
                        type="number"
                        name="amount"
                        value={form.amount}
                        onChange={handleChange}
                        min={profile?.min_amount ?? 0}
                        step="0.01"
                        placeholder="25.00"
                      />
                    </Form.Group>

                    <Form.Group controlId="donationMessage">
                      <Form.Label>Сообщение</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="message"
                        rows={3}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Поддерживаю стрим!"
                      />
                    </Form.Group>

                    <Form.Group controlId="donationGoal">
                      <Form.Label>Цель сбора</Form.Label>
                      <Form.Select name="goal_id" value={form.goal_id} onChange={handleChange}>
                        <option value="">Без цели</option>
                        {goals.map((goal) => (
                          <option key={goal.id} value={goal.id}>
                            {goal.title}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {activeGoal && (
                      <Card className="border-0 bg-light">
                        <Card.Body className="py-2">
                          <div className="text-uppercase text-muted" style={{ fontSize: '0.75rem' }}>
                            Выбранная цель
                          </div>
                          <div className="fw-semibold">{activeGoal.title}</div>
                          <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                            {formatAmount(activeGoal.current_amount, activeGoal.currency)} из{' '}
                            {formatAmount(activeGoal.target_amount, activeGoal.currency)}
                          </div>
                        </Card.Body>
                      </Card>
                    )}

                    <Button type="submit" variant="primary">
                      Подготовить донат
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={7}>
              <Stack gap={3}>
                <div>
                  <h2 className="section-title fs-5 mb-1">Цели стримера</h2>
                  <p className="section-subtitle" style={{ fontSize: '0.95rem' }}>
                    Актуальные полоски сбора. Кликните по цели, чтобы выбрать её для доната.
                  </p>
                </div>

                {goals.length === 0 ? (
                  <Card className="shadow-sm">
                    <Card.Body className="text-muted">Активных целей пока нет.</Card.Body>
                  </Card>
                ) : (
                  <Row className="g-3">
                    {goals.map((goal) => (
                      <Col md={6} key={goal.id}>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => setForm((prev) => ({ ...prev, goal_id: String(goal.id) }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              setForm((prev) => ({ ...prev, goal_id: String(goal.id) }));
                            }
                          }}
                        >
                          <GoalCard
                            goal={goal}
                            actions={
                              form.goal_id && String(form.goal_id) === String(goal.id) ? (
                                <Badge bg="primary">Выбрано</Badge>
                              ) : null
                            }
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Stack>
            </Col>
          </Row>
        </>
      )}
    </Stack>
  );
}
