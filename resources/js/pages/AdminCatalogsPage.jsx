import React from 'react';
import { Button, Card, Stack } from 'react-bootstrap';

const catalogs = [
  { name: 'Голоса TTS', status: '26 активных', action: 'Управлять' },
  { name: 'Теги мемов', status: '18 тегов', action: 'Редактировать' },
  { name: 'Бан-листы YouTube', status: '54 видео', action: 'Просмотреть' },
];

export default function AdminCatalogsPage() {
  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Справочники и каталоги</h1>
        <p className="section-subtitle">Голоса, теги, бан-листы и другие системные данные.</p>
      </div>
      <Stack gap={3}>
        {catalogs.map((catalog) => (
          <Card key={catalog.name} className="shadow-sm">
            <Card.Body className="d-flex align-items-center justify-content-between">
              <div>
                <Card.Title className="mb-1 fs-6">{catalog.name}</Card.Title>
                <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                  {catalog.status}
                </Card.Text>
              </div>
              <Button variant="outline-primary" size="sm">
                {catalog.action}
              </Button>
            </Card.Body>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}