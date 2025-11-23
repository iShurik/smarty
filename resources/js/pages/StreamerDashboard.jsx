import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const cards = [
  { title: 'Донаты', value: 'Статус: готово', description: 'Создание донатов, валидация правил стримера, TTS + медиа.' },
  { title: 'Очередь воспроизведения', value: 'Виджет', description: 'Опубликованные донаты пушатся в оверлей через WS/SSE.' },
  { title: 'Платежи', value: 'Интеграции', description: 'Кошелёк стримера, комиссии и вывод средств через провайдеров.' },
];

export default function StreamerDashboard() {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-3 mb-1">Кабинет стримера</h1>
        <p className="section-subtitle">Быстрый обзор ключевых модулей и статусов их реализации.</p>
      </div>
      <Row className="g-3">
        {cards.map((card) => (
          <Col md={4} key={card.title}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {card.title}
                </div>
                <div className="fw-semibold fs-5 text-dark">{card.value}</div>
                <Card.Text className="section-subtitle mb-0">{card.description}</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}