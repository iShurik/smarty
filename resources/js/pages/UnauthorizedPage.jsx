import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Stack } from 'react-bootstrap';

export default function UnauthorizedPage() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="section-title fs-3 mb-2">Нет доступа</Card.Title>
        <Card.Text className="section-subtitle mb-3">
          У вас нет прав на просмотр этой секции. Выберите другую роль или вернитесь на главную.
        </Card.Text>
        <Stack direction="horizontal" gap={2}>
          <Button as={Link} to="/" variant="primary">
            На главную
          </Button>
          <Button as={Link} to="/login" variant="outline-secondary">
            Сменить роль
          </Button>
        </Stack>
      </Card.Body>
    </Card>
  );
}