import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Card, Col, Nav, Row } from 'react-bootstrap';

const navItems = [
  { to: '/admin', label: 'Обзор' },
  { to: '/admin/moderation', label: 'Модерация' },
  { to: '/admin/memes', label: 'Мемы' },
  { to: '/admin/catalogs', label: 'Каталоги' },
];

export default function AdminLayout() {
  return (
    <Row className="g-4">
      <Col lg={3}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title className="mb-3 text-uppercase text-muted" style={{ fontSize: '0.85rem' }}>
              Админ
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