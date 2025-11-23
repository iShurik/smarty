import React from 'react';
import { Card, Stack } from 'react-bootstrap';

const donations = [
  { title: 'TTS для StreamerOne', amount: '$10', status: 'Оплачен' },
  { title: 'Мем-клип для StreamerTwo', amount: '$5', status: 'Ожидает модерации' },
];

export default function DonorDashboard() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-3 mb-1">Кабинет донатора</h1>
        <p className="section-subtitle">Отслеживание последних донатов, статусов и доступных медиа опций.</p>
      </div>
      <Stack gap={3}>
        {donations.map((donation) => (
          <Card key={donation.title} className="shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title className="mb-1 fs-6">{donation.title}</Card.Title>
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  {donation.status}
                </Card.Text>
              </div>
              <div className="fw-semibold">{donation.amount}</div>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}