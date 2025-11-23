import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const metrics = [
  { label: 'Активных стримеров', value: 128 },
  { label: 'Донатов за сутки', value: 842 },
  { label: 'Проблемные платежи', value: 3 },
];

export default function AdminOverviewPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="section-title fs-3 mb-1">Админ. Обзор</h1>
        <p className="section-subtitle">Системные метрики, статус очередей и блок-листов.</p>
      </div>
      <Row className="g-3">
        {metrics.map((metric) => (
          <Col md={4} key={metric.label}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <div className="text-uppercase text-primary fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {metric.label}
                </div>
                <div className="fs-3 fw-semibold text-dark">{metric.value}</div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}