import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Container, Nav, Navbar, Button } from 'react-bootstrap';
import { useAuth } from '../../auth/AuthContext';

export default function PublicLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-vh-100 bg-light">
      <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-semibold text-primary">
            StreamKit
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-nav" />
          <Navbar.Collapse id="main-nav" className="justify-content-between">
            <Nav className="me-auto" navbarScroll>
              <Nav.Link as={NavLink} to="/" end>
                Главная
              </Nav.Link>
              <Nav.Link as={NavLink} to="/streamer">
                Кабинет стримера
              </Nav.Link>
              <Nav.Link as={NavLink} to="/donor">
                Кабинет донатора
              </Nav.Link>
              <Nav.Link as={NavLink} to="/admin">
                Админка
              </Nav.Link>
            </Nav>
            <div className="d-flex align-items-center gap-2">
              {user ? (
                <Button variant="outline-secondary" size="sm" onClick={logout}>
                  Выйти ({user.name})
                </Button>
              ) : (
                <Button as={Link} to="/login" size="sm" variant="primary">
                  Войти
                </Button>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4 py-md-5">
        <Outlet />
      </Container>
    </div>
  );
}