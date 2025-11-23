import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from 'react-bootstrap';

export default function NotFoundPage() {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="section-title fs-3 mb-2">Страница не найдена</Card.Title>
        <Card.Text className="section-subtitle mb-3">Маршрут не существует или находится в разработке.</Card.Text>
        <Button as={Link} to="/" variant="primary">
          Вернуться на главную
        </Button>
      </Card.Body>
    </Card>
  );
}