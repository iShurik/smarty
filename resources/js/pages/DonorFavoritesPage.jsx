import React from 'react';
import { Badge, Card, Stack } from 'react-bootstrap';

const favorites = [
  { name: 'StreamerOne', status: 'Онлайн', rules: 'TTS + YouTube' },
  { name: 'StreamerTwo', status: 'Оффлайн', rules: 'Только мем-клипы' },
];

export default function DonorFavoritesPage() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Избранные стримеры</h1>
        <p className="section-subtitle">Быстрый доступ к страницам донатов и активным правилам.</p>
      </div>
      <Stack gap={3}>
        {favorites.map((fav) => (
          <Card key={fav.name} className="shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title className="mb-1 fs-6">{fav.name}</Card.Title>
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  {fav.rules}
                </Card.Text>
              </div>
              <Badge bg={fav.status === 'Онлайн' ? 'success' : 'secondary'}>{fav.status}</Badge>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}