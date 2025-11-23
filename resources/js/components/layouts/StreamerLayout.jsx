import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Card, Col, Nav, Row } from 'react-bootstrap';

const navItems = [
  { to: '/streamer', label: 'Дашборд' },
  { to: '/streamer/profile', label: 'Профиль' },
  { to: '/streamer/goals', label: 'Цели' },
  { to: '/streamer/media', label: 'Медиа' },
  { to: '/streamer/moderation', label: 'Модерация' },
];

export default function StreamerLayout() {
  return (
    <Row className="g-4">
      <Col lg={3}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title className="mb-3 text-uppercase text-muted" style={{ fontSize: '0.85rem' }}>
              Стример
            </Card.Title>
            <Nav className="flex-column" variant="pills">
              {navItems.map((item) => (
                <Nav.Link key={item.to} as={NavLink} to={item.to} end>
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={9}>
        <Card className="shadow-sm">
          <Card.Body>
            <Outlet />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}