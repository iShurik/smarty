import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const defaultStats = {
  today: { total_amount: '0.00', donations_count: 0 },
  last_7_days: { total_amount: '0.00', donations_count: 0 },
  last_30_days: { total_amount: '0.00', donations_count: 0 },
};

export default function StreamerDashboard() {
  const [stats, setStats] = useState(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await axios.get('/api/v1/streamer/stats');

        if (!isMounted) {
          return;
        }

        setStats({
          today: data.today || defaultStats.today,
          last_7_days: data.last_7_days || defaultStats.last_7_days,
          last_30_days: data.last_30_days || defaultStats.last_30_days,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError('Не удалось загрузить статистику.');
        setStats(defaultStats);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      {
        title: 'Сегодня',
        amount: stats.today.total_amount,
        count: stats.today.donations_count,
        hint: 'За текущий день',
      },
      {
        title: '7 дней',
        amount: stats.last_7_days.total_amount,
        count: stats.last_7_days.donations_count,
        hint: 'Последние 7 дней включая сегодня',
      },
      {
        title: '30 дней',
        amount: stats.last_30_days.total_amount,
        count: stats.last_30_days.donations_count,
        hint: 'Последние 30 дней включая сегодня',
      },
    ],
    [stats],
  );

  const formatAmount = (value) =>
    new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-3 mb-1">Кабинет стримера</h1>
        <p className="section-subtitle">Короткая сводка по донатам за последние периоды.</p>
      </div>
      {error && <div className="text-danger">{error}</div>}
      <Row className="g-3">
        {cards.map((card) => (
          <Col md={4} key={card.title}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {card.title}
                </div>
                <div className="fw-semibold fs-4 text-dark">
                  {isLoading ? '...' : formatAmount(card.amount)}
                </div>
                <Card.Text className="section-subtitle mb-0">
                  {isLoading ? 'Загрузка данных...' : `Донатов: ${card.count}`}
                </Card.Text>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  {card.hint}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
