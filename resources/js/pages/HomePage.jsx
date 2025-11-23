import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Col, ListGroup, Row, Stack } from 'react-bootstrap';

export default function HomePage() {
  const highlights = [
    'Донаты с TTS, YouTube и мем-клипами',
    'Голосовые и медиа ограничения на уровне стримера',
    'Виджеты целей, аукционы и подписки',
    'Модерация контента и расширенная аналитика',
  ];

  return (
    <div className="py-2">
      <Row className="g-4 align-items-stretch">
        <Col lg={7}>
          <Stack gap={3} className="h-100">
            <div>
              <Badge bg="primary" className="mb-2 text-uppercase">
                MVP-каркас
              </Badge>
              <h1 className="section-title fs-2">
                StreamKit — платформа донатов c архитектурой уровня DonationAlerts
              </h1>
              <p className="section-subtitle fs-6 mt-3">
                Каркас SPA на React + Laravel Vite: публичные страницы, кабинеты стримера и донатора, базовая админка и
                охрана маршрутов под роли.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button as={Link} to="/streamer" variant="primary">
                Кабинет стримера
              </Button>
              <Button as={Link} to="/donor" variant="outline-primary">
                Кабинет донатора
              </Button>
            </div>
          </Stack>
        </Col>
        <Col lg={5}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="fs-6 text-muted text-uppercase">Что готово прямо сейчас</Card.Title>
              <ListGroup variant="flush" className="mt-3">
                {highlights.map((item) => (
                  <ListGroup.Item key={item} className="d-flex align-items-start gap-2 ps-0">
                    <span className="mt-1 rounded-circle bg-primary" style={{ width: 8, height: 8 }} />
                    <span className="section-subtitle">{item}</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}