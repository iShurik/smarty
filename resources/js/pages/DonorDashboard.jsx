import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Badge, Card, Stack } from 'react-bootstrap';

const statusLabels = {
  pending_payment: 'Ожидает оплату',
  paid: 'Оплачен',
  rejected: 'Отклонён',
  refunded: 'Возврат',
  played: 'Воспроизведён',
};

const formatAmount = (amount, currency) => `${amount} ${currency || ''}`.trim();

export default function DonorDashboard() {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDonations = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await axios.get('/api/v1/donor/donations', {
          params: {
            per_page: 5,
            sort_by: 'created_at',
            sort_dir: 'desc',
          },
        });

        if (!isMounted) {
          return;
        }

        setDonations(data.data || []);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError('Не удалось загрузить донаты.');
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
  }, []);

  return (
    <Stack gap={3}>
      <div>
        <h1 className="section-title fs-3 mb-1">Кабинет донатора</h1>
        <p className="section-subtitle">Последние донаты, статусы и выбранные медиа.</p>
      </div>
      <Stack gap={3}>
        {error ? (
          <div className="text-danger">{error}</div>
        ) : isLoading ? (
          <div className="text-muted">Загрузка донатов...</div>
        ) : donations.length === 0 ? (
          <div className="text-muted">Пока нет донатов.</div>
        ) : (
          donations.map((donation) => (
            <Card key={donation.id} className="shadow-sm">
              <Card.Body className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
                <div>
                  <Card.Title className="mb-1 fs-6">
                    {donation.streamer?.display_name || 'Стример'}
                  </Card.Title>
                  <Card.Text className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    #{donation.id} · {donation.message_text || 'Без сообщения'}
                  </Card.Text>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <Badge bg="secondary">{statusLabels[donation.status] || donation.status}</Badge>
                  <div className="fw-semibold">{formatAmount(donation.amount, donation.currency)}</div>
                </div>
              </Card.Body>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
}
