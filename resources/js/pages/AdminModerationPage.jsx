import React from 'react';
import { Card, Stack } from 'react-bootstrap';

const streams = [
  { name: 'StreamerOne', pending: 6, escalations: 1 },
  { name: 'StreamerTwo', pending: 2, escalations: 0 },
];

export default function AdminModerationPage() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Глобальная модерация</h1>
        <p className="section-subtitle">Мониторинг очередей мемов, донатов и блок-листов по стримерам.</p>
      </div>
      <Stack gap={3}>
        {streams.map((stream) => (
          <Card key={stream.name} className="shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title className="mb-1 fs-6">{stream.name}</Card.Title>
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  Эскалации: {stream.escalations}
                </Card.Text>
              </div>
              <div className="fw-semibold">В очереди: {stream.pending}</div>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}