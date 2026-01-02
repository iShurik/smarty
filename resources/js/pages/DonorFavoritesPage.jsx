import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Form, Pagination, Row, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const createPages = (current, last) => {
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(last, current + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
};

export default function DonorFavoritesPage() {
  const [streamers, setStreamers] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });
  const [filters, setFilters] = useState({
    sortBy: 'last_donation_at',
    sortDir: 'desc',
    perPage: 6,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const queryParams = useMemo(
    () => ({
      page,
      per_page: filters.perPage,
      sort_by: filters.sortBy,
      sort_dir: filters.sortDir,
    }),
    [filters, page],
  );

  useEffect(() => {
    let isMounted = true;

    const loadStreamers = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await axios.get('/api/v1/donor/streamers', { params: queryParams });

        if (!isMounted) {
          return;
        }

        setStreamers(data.data || []);
        setMeta(data.meta || { current_page: 1, last_page: 1, per_page: filters.perPage, total: 0 });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError('Не удалось загрузить список стримеров.');
        setStreamers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStreamers();

    return () => {
      isMounted = false;
    };
  }, [queryParams, filters.perPage]);

  useEffect(() => {
    setPage(1);
  }, [filters.sortBy, filters.sortDir, filters.perPage]);

  const pages = useMemo(() => createPages(meta.current_page, meta.last_page), [meta]);

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">Стримеры, которым вы донатили</h1>
        <p className="section-subtitle">Сводка по количеству донатов и сумме.</p>
      </div>

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={6}>
              <Form.Group controlId="donorStreamersSort">
                <Form.Label className="text-muted">Сортировка</Form.Label>
                <Form.Select
                  value={`${filters.sortBy}:${filters.sortDir}`}
                  onChange={(event) => {
                    const [sortBy, sortDir] = event.target.value.split(':');
                    setFilters((prev) => ({ ...prev, sortBy, sortDir }));
                  }}
                >
                  <option value="last_donation_at:desc">Последний донат: новые</option>
                  <option value="last_donation_at:asc">Последний донат: старые</option>
                  <option value="total_amount:desc">Сумма донатов: больше</option>
                  <option value="total_amount:asc">Сумма донатов: меньше</option>
                  <option value="donations_count:desc">Количество донатов: больше</option>
                  <option value="donations_count:asc">Количество донатов: меньше</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="donorStreamersPerPage">
                <Form.Label className="text-muted">На странице</Form.Label>
                <Form.Select
                  value={filters.perPage}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, perPage: Number(event.target.value) }))
                  }
                >
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error ? (
        <div className="text-danger">{error}</div>
      ) : isLoading ? (
        <div className="text-muted">Загрузка списка...</div>
      ) : streamers.length === 0 ? (
        <div className="text-muted">Вы ещё не донатили стримерам.</div>
      ) : (
        <Row className="g-3">
          {streamers.map((streamer) => (
            <Col md={6} key={streamer.id}>
              <Card className="shadow-sm h-100">
                <Card.Body className="d-flex flex-column gap-2">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <Card.Title className="mb-1 fs-6">{streamer.display_name}</Card.Title>
                      <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                        Последний донат: {String(streamer.last_donation_at).slice(0, 10)}
                      </Card.Text>
                    </div>
                    <Badge bg="primary">{streamer.donations_count} донатов</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-semibold">Всего: {streamer.total_amount}</div>
                    <Link className="btn btn-outline-primary btn-sm" to={`/s/${streamer.slug}`}>
                      Страница донатов
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {!error && !isLoading && meta.last_page > 1 ? (
        <Card className="shadow-sm border-0">
          <Card.Body className="d-flex align-items-center justify-content-between">
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>
              Всего: {meta.total}
            </div>
            <Pagination className="mb-0">
              <Pagination.Prev
                disabled={meta.current_page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              />
              {pages.map((pageNumber) => (
                <Pagination.Item
                  key={pageNumber}
                  active={pageNumber === meta.current_page}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
              />
            </Pagination>
          </Card.Body>
        </Card>
      ) : null}
    </Stack>
  );
}
