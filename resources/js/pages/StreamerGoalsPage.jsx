import React from 'react';
import { Card, ProgressBar, Stack } from 'react-bootstrap';

const goals = [
  { title: 'Новый микрофон', target: 500, current: 180, currency: 'USD', endsAt: '31.10' },
  { title: 'Апгрейд ПК', target: 1200, current: 820, currency: 'USD', endsAt: '15.11' },
];

export default function StreamerGoalsPage() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Цели и полоски сбора</h1>
        <p className="section-subtitle">Управление активными целями, привязка донатов и статус для оверлея.</p>
      </div>
      <Stack gap={3}>
        {goals.map((goal) => {
          const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
          return (
            <Card key={goal.title} className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center justify-content-between">
                  <Card.Title className="mb-1 fs-6">{goal.title}</Card.Title>
                  <div className="fw-semibold">
                    {goal.current}/{goal.target} {goal.currency}
                  </div>
                </div>
                <ProgressBar now={progress} className="my-3" animated={progress < 100} />
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Дедлайн: {goal.endsAt}
                </Card.Text>
              </Card.Body>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}