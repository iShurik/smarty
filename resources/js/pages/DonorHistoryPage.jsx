import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Form, Pagination, Row, Stack, Table } from 'react-bootstrap';

const statusLabels = {
  pending_payment: 'Ожидает оплату',
  paid: 'Оплачен',
  rejected: 'Отклонён',
  refunded: 'Возврат',
  played: 'Воспроизведён',
};

const formatAmount = (amount, currency) => `${amount} ${currency || ''}`.trim();

const createPages = (current, last) => {
  const pages = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(last, current + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return pages;
};

export default function DonorHistoryPage() {
  const [filters, setFilters] = useState({
    status: 'all',
    from: '',
    to: '',
    sortBy: 'created_at',
    sortDir: 'desc',
    perPage: 10,
  });
  const [donations, setDonations] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 10, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(() => {
    const params = {
      page,
      per_page: filters.perPage,
      sort_by: filters.sortBy,
      sort_dir: filters.sortDir,
    };

    if (filters.status !== 'all') {
      params.status = filters.status;
    }
    if (filters.from) {
      params.from = filters.from;
    }
    if (filters.to) {
      params.to = filters.to;
    }

    return params;
  }, [filters, page]);

  useEffect(() => {
    let isMounted = true;

    const loadDonations = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await axios.get('/api/v1/donor/donations', {
          params: queryParams,
        });

        if (!isMounted) {
          return;
        }

        setDonations(data.data || []);
        setMeta(data.meta || { current_page: 1, last_page: 1, per_page: filters.perPage, total: 0 });
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError('Не удалось загрузить историю донатов.');
        setDonations([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDonations();

    return () => {
      isMounted = false;
    };
  }, [queryParams, filters.perPage]);

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.from, filters.to, filters.sortBy, filters.sortDir, filters.perPage]);

  const pages = useMemo(() => createPages(meta.current_page, meta.last_page), [meta]);

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-4 mb-1">История донатов</h1>
        <p className="section-subtitle">Фильтруйте и сортируйте пожертвования по статусам и датам.</p>
      </div>

      <Card className="shadow-sm border-0 bg-light">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={4}>
              <Form.Group controlId="donorDonationStatus">
                <Form.Label className="text-muted">Статус</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="all">Все</option>
                  <option value="pending_payment">Ожидает оплату</option>
                  <option value="paid">Оплачен</option>
                  <option value="played">Воспроизведён</option>
                  <option value="rejected">Отклонён</option>
                  <option value="refunded">Возврат</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="donorDonationFrom">
                <Form.Label className="text-muted">Дата от</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, from: event.target.value }))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="donorDonationTo">
                <Form.Label className="text-muted">Дата до</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.to}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, to: event.target.value }))
                  }
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="donorDonationSort">
                <Form.Label className="text-muted">Сортировка</Form.Label>
                <Form.Select
                  value={`${filters.sortBy}:${filters.sortDir}`}
                  onChange={(event) => {
                    const [sortBy, sortDir] = event.target.value.split(':');
                    setFilters((prev) => ({ ...prev, sortBy, sortDir }));
                  }}
                >
                  <option value="created_at:desc">Дата: сначала новые</option>
                  <option value="created_at:asc">Дата: сначала старые</option>
                  <option value="amount:desc">Сумма: по убыванию</option>
                  <option value="amount:asc">Сумма: по возрастанию</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="donorDonationPerPage">
                <Form.Label className="text-muted">На странице</Form.Label>
                <Form.Select
                  value={filters.perPage}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, perPage: Number(event.target.value) }))
                  }
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          {error ? (
            <div className="text-danger">{error}</div>
          ) : isLoading ? (
            <div className="text-muted">Загрузка истории...</div>
          ) : (
            <Table responsive className="align-middle mb-0">
              <thead>
                <tr className="text-muted" style={{ fontSize: '0.85rem' }}>
                  <th>Стример</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Дата</th>
                  <th>Контент</th>
                </tr>
              </thead>
              <tbody>
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      Нет донатов по выбранным фильтрам.
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id}>
                      <td>
                        <div className="fw-semibold">
                          {donation.streamer?.display_name || 'Стример'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                          #{donation.id} · {donation.message_text || 'Без сообщения'}
                        </div>
                      </td>
                      <td className="fw-semibold">
                        {formatAmount(donation.amount, donation.currency)}
                      </td>
                      <td>
                        <Badge bg="secondary">
                          {statusLabels[donation.status] || donation.status}
                        </Badge>
                      </td>
                      <td>{String(donation.created_at).slice(0, 10)}</td>
                      <td className="text-muted">
                        {donation.has_tts ? 'TTS' : '—'}
                        {donation.youtube_id ? ' · YouTube' : ''}
                        {donation.meme_clip_id ? ' · Мем' : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
        {!error && !isLoading && meta.last_page > 1 ? (
          <Card.Footer className="bg-white border-0">
            <div className="d-flex align-items-center justify-content-between">
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
            </div>
          </Card.Footer>
        ) : null}
      </Card>
    </Stack>
  );
}
