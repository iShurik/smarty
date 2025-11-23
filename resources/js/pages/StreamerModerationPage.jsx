import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const queues = [
  { title: 'Мемы', pending: 4, approved: 12, rejected: 2 },
  { title: 'Донаты (ручная проверка)', pending: 1, approved: 23, rejected: 0 },
  { title: 'YouTube блок-лист', pending: 0, approved: 6, rejected: 0 },
];

export default function StreamerModerationPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-4 mb-1">Модерация контента</h1>
        <p className="section-subtitle">Статус очередей на проверку и быстрые действия.</p>
      </div>
      <Row className="g-3">
        {queues.map((queue) => (
          <Col md={4} key={queue.title}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {queue.title}
                </div>
                <Card.Text className="section-subtitle mb-1">Ожидает: {queue.pending}</Card.Text>
                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                  <div>Одобрено: {queue.approved}</div>
                  <div>Отклонено: {queue.rejected}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}